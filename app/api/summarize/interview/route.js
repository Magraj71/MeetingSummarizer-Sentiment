import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Returning mock data.");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({
        title: "Mock: Technical Interview",
        overview: "A mock interview analysis because GEMINI_API_KEY is missing.",
        strengths: ["Clear communication", "Good problem solving"],
        weaknesses: ["Needs to improve system design", "A bit nervous"],
        keyDecisions: ["Proceed to next round"],
        sentiment: { overall: "positive", score: 85, highlights: ["Smiled during technical answers \u2192 \ud83d\ude0a"] },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the following interview/meeting transcript and provide a structured JSON output. Do not include markdown formatting or backticks, return raw JSON only.
      
      This is a 2-way conversation between a Host and a Guest. Evaluate the conversation focusing on the candidate's/guest's performance, but also note important questions asked by the host.

      Output structure required:
      {
        "title": "A short, descriptive title for the interview",
        "overview": "A 2-3 sentence summary of the interview",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "weaknesses": ["Area for improvement 1", "Area for improvement 2"],
        "keyDecisions": ["Key keywords discussed 1", "Key keywords 2", "Important concept mentioned"],
        "sentiment": {
          "overall": "mostly positive|neutral|mostly negative|mixed",
          "score": an integer from 0 to 100 representing positivity/confidence,
          "highlights": ["Quote or observation \u2192 emoji"]
        }
      }

      Transcript:
      ${transcript}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
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
            type: "interview",
            title: data.title,
            overview: data.overview,
            strengths: data.strengths || [],
            weaknesses: data.weaknesses || [],
            keyDecisions: data.keyDecisions || [], // Reusing keyDecisions for Keywords
            sentiment: data.sentiment,
            takeaways: [],
            actionItems: [],
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
    console.error("AI Error:", error);
    return NextResponse.json({ message: "Failed to summarize interview" }, { status: 500 });
  }
}
