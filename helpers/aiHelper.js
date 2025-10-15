const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// cleaning text function
function cleanText(text = "") {
  return text
    // Hapus seluruh baris heading markdown dan pemisah
    .replace(/^#+\s?.*$/gm, "")     
    .replace(/---+/g, " ")         
    // Hapus bullet dan angka daftar
    .replace(/^\s*\d+\.\s*/gm, "") 
    .replace(/^\s*-\s*/gm, "")     
    .replace(/\*/g, "")            
    // Hapus kutipan berlebih
    .replace(/["“”‘’]/g, '"')      
    // Rapikan whitespace
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
    console.error("❌ Error from Gemini:", err);
    return "Maaf, saya mengalami kesulitan menjawab saat ini.";
  }
}

module.exports = { askGemini, cleanText };
