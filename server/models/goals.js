import mongoose from 'mongoose';

const goalsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  weightGoal: {
    type: String,
    enum: ['gain', 'lose', 'maintain'],
    required: true
  },
  muscleGoal: {
    type: String,
    enum: ['gain', 'maintain'],
    required: true
  },
  targetWeight: {
    type: Number,
    required: true
  },
  currentWeight: {
    type: Number,
    required: true
  },
  weeklyGoal: {
    type: Number,  // in kg
    required: true
  },
  proteinTarget: {
    type: Number,  // in grams
    required: true
  },
  calorieTarget: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true,
  methods: {
    calculateNutritionTargets() {
      // Protein target: 1.8g per kg of target weight
      this.proteinTarget = Math.round(this.targetWeight * 1.8);
      
      // Base metabolic rate (BMR) using Mifflin-St Jeor Equation
      // Note: This is simplified - in production we'd need age, height, and gender
      const bmr = (10 * this.currentWeight) + 625;
      
      // Activity multiplier (moderate activity = 1.55)
      const maintenance = bmr * 1.55;
      
      // Adjust calories based on goal
      if (this.weightGoal === 'lose') {
        this.calorieTarget = Math.round(maintenance - 500);
      } else if (this.weightGoal === 'gain') {
        this.calorieTarget = Math.round(maintenance + 500);
      } else {
        this.calorieTarget = Math.round(maintenance);
      }
      
      return {
        proteinTarget: this.proteinTarget,
        calorieTarget: this.calorieTarget
      };
    }
  }
});

export default mongoose.model('Goals', goalsSchema);