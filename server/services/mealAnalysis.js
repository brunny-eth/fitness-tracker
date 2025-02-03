// server/services/mealAnalysis.js
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from server root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const apiKey = process.env.CLAUDE_API_KEY;  
if (!apiKey) {
  console.error('CLAUDE_API_KEY is not set in environment variables');
}
const anthropic = new Anthropic({
  apiKey: apiKey
});

export const analyzeMeal = async (mealDescription) => {
  const startTime = Date.now();
  console.log("Starting meal analysis at:", new Date().toISOString());
  console.log("Meal description:", mealDescription);
  console.log(`API Key present: ${Boolean(apiKey)}`);
  console.log("API Key first 4 chars:", apiKey?.slice(0, 4));

  try {
    console.log("Creating request to Anthropic API...");
    
    const messageStart = Date.now();
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0,
      messages: [{
        role: "user",
        content: `You are analyzing a meal to estimate its nutritional content. Break down each component and provide protein and calorie estimates.
        
        Meal: ${mealDescription}
        
        Rules:
        1. Always provide realistic estimates even with vague portions
        2. Round protein to nearest 0.5g
        3. Round calories to nearest 10
        4. If portion is unclear, assume a typical serving size
        
        Provide your response in this exact JSON format:
        {
            "total": {
                "protein": 0,
                "calories": 0
            },
            "breakdown": [
                {
                    "item": "food name",
                    "portion": "amount",
                    "protein": 0,
                    "calories": 0
                }
            ]
        }`
      }]
    });

    const apiDuration = Date.now() - messageStart;
    console.log("Received response from Anthropic API after", apiDuration, "ms");
    console.log("Raw response:", message.content[0].text);
    
    const responseText = message.content[0].text;
    const parsedResponse = JSON.parse(responseText);
    
    const totalDuration = Date.now() - startTime;
    console.log("Total analysis duration:", totalDuration, "ms");
    console.log("Parsed response:", JSON.stringify(parsedResponse, null, 2));
    
    return parsedResponse;
    
  } catch (error) {
    console.error("Error in analyzeMeal:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw new Error("Failed to analyze meal");
  }
};