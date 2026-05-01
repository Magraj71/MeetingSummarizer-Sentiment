import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBwZaEyiOlyPc59q96KQvech0_M1IAn550";
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent("Say hello");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testModel();
