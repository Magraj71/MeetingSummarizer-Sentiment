import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBwZaEyiOlyPc59q96KQvech0_M1IAn550";
const genAI = new GoogleGenerativeAI(apiKey);

async function checkModels() {
  try {
    const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(modelsUrl);
    const data = await res.json();
    console.log(data.models.map(m => m.name));
  } catch (err) {
    console.error(err);
  }
}

checkModels();
