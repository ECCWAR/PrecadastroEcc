import { GoogleGenAI } from "@google/genai";

// Safe initialization of the AI client
const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateWelcomeMessage = async (name: string): Promise<string> => {
  if (!ai) {
    return `Sejam bem-vindos, ${name}! Que a paz de Cristo esteja com vocês.`;
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Escreva uma mensagem curta, calorosa e acolhedora (máximo 2 frases) de boas-vindas para um casal (representado por "${name}") que acabou de se inscrever no Encontro de Casais com Cristo (ECC). 
      Use uma linguagem cristã, fraterna e inspiradora.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || `Sejam bem-vindos, ${name}! Que Deus abençoe sua jornada.`;
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return `Sejam bem-vindos, ${name}! Estamos muito felizes com sua inscrição.`;
  }
};