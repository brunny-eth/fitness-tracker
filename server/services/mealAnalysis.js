import { Claude } from '@anthropic-ai/sdk';

const claude = new Claude(process.env.CLAUDE_API_KEY);

export async function analyzeMeal(description) {
  const prompt = `Analyze this meal: "${description}". 
                 Return only a JSON object with protein (in grams) and calories.
                 Base this on typical portions and ingredients.`;

  const response = await claude.messages.create({
    model: "claude-3-opus-20240229",
    messages: [{ role: "user", content: prompt }]
  });

  return JSON.parse(response.content);
}
