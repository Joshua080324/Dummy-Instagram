const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function cleanText(text = "") {
  return text
    .replace(/^#+\s?.*$/gm, "")
    .replace(/---+/g, " ")
    .replace(/^\s*\d+\.\s*/gm, "")
    .replace(/^\s*-\s*/gm, "")
    .replace(/\*/g, "")
    .replace(/["""'']/g, '"')
    .replace(/\r?\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function askGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    return cleanText(rawText);
  } catch (err) {
    return "Sorry, I'm having trouble responding right now.";
  }
}

module.exports = { askGemini, cleanText };
