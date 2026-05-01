import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = "AIzaSyAjsWWbh4xLVG4YWGWmrHk1uvNSiZOD0L4";
const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
  console.log("Fetching...");
  try {
    const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(requestUrl);
    const data = await response.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

list();
