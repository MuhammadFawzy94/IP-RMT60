const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Gemini_API_KEY } = process.env;

// Inisialisasi API dengan API key
const genAI = new GoogleGenerativeAI(Gemini_API_KEY);

async function geminiApi({ prompt }) {
  try {
    console.log("Attempting to call Gemini API with prompt:", prompt);
    
    // Gunakan model gemini-pro
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Tambahkan konteks tentang motor untuk mendapatkan jawaban lebih relevan
    const enhancedPrompt = `${prompt}\n\nBerikan jawaban dalam bahasa Indonesia yang detail dan terstruktur tentang perawatan dan perbaikan sepeda motor.`;
    
    // Generate content 
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log("Gemini API response received");
    return responseText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}

module.exports = { geminiApi };