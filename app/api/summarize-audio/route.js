import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Meeting from "@/models/Meeting";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "File is required" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
      console.warn("No API Keys set. Returning mock data.");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({
        title: "Mock: Audio Analysis",
        overview: "This is a mock summary for an uploaded audio file.",
        takeaways: ["File uploaded successfully", "Need API key for real processing"],
        actionItems: [{ task: "Configure Groq or Gemini API", assignee: "User", priority: "high" }],
        sentiment: { overall: "neutral", score: 50, highlights: ["Upload successful -> 🚀"] },
        keyDecisions: ["Mocking data"]
      });
    }

    // Convert file to base64 inlineData
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    
    // Determine mime type
    const mimeType = file.type || "audio/mp3";

    const prompt = `
      Analyze the provided audio/video file and summarize the meeting. Provide a structured JSON output.
      
      Output structure required:
      {
        "title": "A short, descriptive title for the meeting",
        "overview": "A 2-3 sentence overview of what was discussed",
        "takeaways": ["Point 1", "Point 2", "Point 3"],
        "actionItems": [
          { "task": "What to do", "assignee": "Person name or 'Team'", "priority": "high|medium|low" }
        ],
        "sentiment": {
          "overall": "mostly positive|neutral|mostly negative|mixed",
          "score": an integer from 0 to 100 representing positivity,
          "highlights": ["Quote or observation \u2192 emoji"]
        },
        "keyDecisions": ["Decision 1", "Decision 2"]
      }
    `;

    let responseText = "";
    let finalTranscript = "[Audio File Transcribed via AI]";

    try {
      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ]);
        responseText = result.response.text();
      } else {
        throw new Error("No Gemini key, falling back to Groq");
      }
    } catch (geminiError) {
      if (groqKey) {
        console.log("Using Groq API for Audio Analysis Fallback...");
        const groq = new Groq({ apiKey: groqKey });
        
        // Step 1: Transcribe using Whisper
        const transcription = await groq.audio.transcriptions.create({
          file: file,
          model: "whisper-large-v3-turbo",
        });
        
        finalTranscript = transcription.text;

        // Step 2: Summarize using Llama 3.1
        const modifiedPrompt = prompt + "\n\nTranscript:\n" + finalTranscript;
        
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: modifiedPrompt }],
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" }
        });
        
        responseText = chatCompletion.choices[0]?.message?.content || "";
      } else {
        throw geminiError;
      }
    }

    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedJson);

    // Try to save to database if authenticated
    try {
      const token = request.cookies.get("token")?.value;
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const db = await connectToDatabase();
        if (db) {
          const newMeeting = new Meeting({
            userId: decoded.id,
            transcript: finalTranscript,
            title: data.title,
            overview: data.overview,
            takeaways: data.takeaways,
            actionItems: data.actionItems,
            sentiment: data.sentiment,
            keyDecisions: data.keyDecisions,
          });
          await newMeeting.save();
          data._id = newMeeting._id; 
        }
      }
    } catch (saveError) {
      console.error("Error saving meeting to DB:", saveError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Audio Analysis Error:", error);
    return NextResponse.json({ message: "Failed to process audio file. Make sure it is less than 20MB." }, { status: 500 });
  }
}
