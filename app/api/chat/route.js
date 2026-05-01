import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export async function POST(request) {
  try {
    const { message, transcriptContext } = await request.json();

    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
      return NextResponse.json({
        reply: "This is a mock reply because no API keys are set. But I understand you are asking about the meeting!"
      });
    }

    const prompt = `
      You are an AI Meeting Assistant. A user is asking you a question about a specific meeting.
      Answer the question accurately based on the transcript provided below.
      Be concise, helpful, and friendly.

      Question: ${message}

      Meeting Transcript Context:
      ${transcriptContext || "No transcript provided."}
    `;

    let responseText = "";

    try {
      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } else {
        throw new Error("No Gemini Key");
      }
    } catch (geminiError) {
      if (groqKey) {
        const groq = new Groq({ apiKey: groqKey });
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.1-8b-instant", 
        });
        responseText = chatCompletion.choices[0]?.message?.content || "";
      } else {
        throw geminiError;
      }
    }

    return NextResponse.json({ reply: responseText });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ message: "Failed to generate reply" }, { status: 500 });
  }
}
