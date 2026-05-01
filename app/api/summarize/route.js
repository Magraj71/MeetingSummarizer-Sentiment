import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Meeting from "@/models/Meeting";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function POST(request) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json({ message: "Transcript is required" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
      console.warn("No API Keys set. Returning mock data.");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({
        title: "Mock: Team Sync",
        overview: "This is a mock summary because no AI API keys are set in .env.local",
        takeaways: ["Setup Groq or Gemini API to see real results", "Add MONGODB_URI for database"],
        actionItems: [{ task: "Add GROQ_API_KEY to .env.local", assignee: "Developer", priority: "high" }],
        sentiment: { overall: "neutral", score: 50, highlights: ["Need API key \u2192 \ud83d\ude1f"] },
        keyDecisions: ["Use mock data for now"]
      });
    }

    const prompt = `
      Analyze the following meeting transcript and provide a structured JSON output.
      
      Output structure required:
      Output structure required:
      {
        "title": "A short, descriptive title for the meeting",
        "overview": "A brief overview of the context",
        "executiveSummary": "A detailed 1-2 paragraph professional summary of everything discussed and decided.",
        "takeaways": ["Main takeaway 1", "Main takeaway 2"],
        "actionItems": [
          { "task": "What to do", "assignee": "Person", "priority": "high|medium|low" }
        ],
        "sentiment": {
          "overall": "mostly positive|neutral|mostly negative|mixed",
          "score": an integer from 0 to 100 representing positivity,
          "highlights": ["Quote \u2192 emoji"]
        },
        "keyDecisions": ["Decision 1", "Decision 2"]
      }

      Transcript:
      ${transcript}
    `;

    let responseText = "";

    try {
      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } else {
        throw new Error("No Gemini Key, trying Groq");
      }
    } catch (geminiError) {
      if (groqKey) {
        console.log("Using Groq API for analysis...");
        const groq = new Groq({ apiKey: groqKey });
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.1-8b-instant", // Fast and free model
          response_format: { type: "json_object" }
        });
        responseText = chatCompletion.choices[0]?.message?.content || "";
      } else {
        throw geminiError;
      }
    }
    
    // Clean up potential markdown formatting from Gemini
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
            transcript: transcript,
            title: data.title,
            overview: data.overview,
            executiveSummary: data.executiveSummary || "",
            takeaways: data.takeaways,
            actionItems: data.actionItems,
            sentiment: data.sentiment,
            keyDecisions: data.keyDecisions,
          });
          await newMeeting.save();
          data._id = newMeeting._id; // Attach ID so client can use it
        }
      }
    } catch (saveError) {
      console.error("Error saving meeting to DB:", saveError);
      // Continue anyway, we can still return the generated data
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ message: "Failed to summarize transcript" }, { status: 500 });
  }
}
