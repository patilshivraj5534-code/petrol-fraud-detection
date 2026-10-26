
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzePetrolImages = async (receiptBase64: string, pumpBase64: string): Promise<AnalysisResult> => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: receiptBase64.split(',')[1],
            },
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: pumpBase64.split(',')[1],
            },
          },
          {
            text: `Analyze these two images:
            1. The first image is a payment receipt (screenshot or photo).
            2. The second image is a petrol pump meter reading.

            Task:
            - Extract the total amount paid from the receipt.
            - Extract the fuel volume (liters), unit price, and total amount from the pump meter.
            - Verify if the 'Total Paid' on the receipt matches the 'Total Amount' shown on the pump.
            - Calculate any discrepancy (Total Paid - Pump Total).
            - Note any suspicious patterns or warnings.

            Return the results strictly in JSON format according to the provided schema.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          paymentAmount: { type: Type.NUMBER, description: "Total amount found on the payment receipt" },
          pumpVolume: { type: Type.NUMBER, description: "Volume of fuel in liters/units" },
          pumpUnitPrice: { type: Type.NUMBER, description: "Price per liter/unit" },
          pumpTotalAmount: { type: Type.NUMBER, description: "Total cost shown on the pump display" },
          currency: { type: Type.STRING, description: "Currency symbol or code (e.g., $, ₹, £)" },
          isMatch: { type: Type.BOOLEAN, description: "Whether the payment and pump totals match within a 0.5% tolerance" },
          discrepancy: { type: Type.NUMBER, description: "The difference between payment and pump total" },
          confidenceScore: { type: Type.NUMBER, description: "0 to 1 confidence in extraction" },
          summary: { type: Type.STRING, description: "A brief human-readable summary of the findings" },
          warnings: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Any potential red flags like edited images or mismatched dates"
          },
        },
        required: ["paymentAmount", "pumpVolume", "pumpTotalAmount", "isMatch", "summary"],
      },
    },
  });

  const response = await model;
  if (!response.text) {
    throw new Error("Failed to get analysis from Gemini");
  }

  return JSON.parse(response.text.trim());
};
