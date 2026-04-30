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
        title: "Mock: Team Sync",
        overview: "This is a mock summary because GEMINI_API_KEY is missing in .env.local",
        takeaways: ["Setup Gemini API to see real results", "Add MONGODB_URI for database"],
        actionItems: [{ task: "Add API Key to .env.local", assignee: "Developer", priority: "high" }],
        sentiment: { overall: "neutral", score: 50, highlights: ["Need API key \u2192 \ud83d\ude1f"] },
        keyDecisions: ["Use mock data for now"]
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the following meeting transcript and provide a structured JSON output. Do not include markdown formatting or backticks, return raw JSON only.
      
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
            title: data.title,
            overview: data.overview,
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