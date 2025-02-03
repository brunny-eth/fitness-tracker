// server/services/mealAnalysis.js
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const analyzeMeal = async (mealDescription) => {
  console.log("Starting meal analysis");
  console.log(`API Key present: ${Boolean(process.env.ANTHROPIC_API_KEY)}`);

  try {
    console.log("Sending request to Anthropic API");
    
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

    console.log("Received response from Anthropic API");
    
    const responseText = message.content[0].text;
    const parsedResponse = JSON.parse(responseText);
    console.log("Successfully parsed JSON response");
    
    return parsedResponse;
    
  } catch (error) {
    console.error("Error in analyzeMeal:", error);
    throw new Error("Failed to analyze meal");
  }
};