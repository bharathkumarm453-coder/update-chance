import { GoogleGenAI } from "@google/genai";
import { Trade } from "../types";

export const analyzeTrades = async (trades: Trade[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure your environment.";
  }

  if (trades.length === 0) {
    return "No trades available to analyze. Please add some trades to your journal first.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare a summarized version of trades to save tokens and focus on analysis
  const tradeSummary = trades.map(t => ({
    symbol: t.symbol,
    direction: t.direction,
    pnl: t.pnl,
    setup: t.setup,
    date: t.entryDate,
    notes: t.notes
  }));

  const prompt = `
    Act as a professional trading mentor and risk manager. 
    Review the following trading journal data (JSON format).
    
    Data:
    ${JSON.stringify(tradeSummary)}

    Please provide a concise analysis covering:
    1. Overall performance observation.
    2. Pattern recognition: What setups are working best? What aren't?
    3. Psychological analysis based on notes (if any) and P&L swings.
    4. Actionable advice for the next trading session.

    Keep the tone professional, encouraging, but strict on risk management. Format with Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "An error occurred while analyzing your trades. Please try again later.";
  }
};