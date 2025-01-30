// server/services/mealAnalysis.js

export const analyzeMeal = async (description) => {
  return {
    name: description.split('\n')[0] || 'Unknown Meal',
    protein: Math.floor(Math.random() * 30) + 10, 
    calories: Math.floor(Math.random() * 400) + 200, 
  };
};