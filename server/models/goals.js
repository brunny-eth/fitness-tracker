import mongoose from 'mongoose';

const goalsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    // Making it optional
    required: false
  },
  weightGoal: {
    type: String,
    enum: ['gain', 'lose', 'maintain'],
    default: 'maintain'  // Adding default
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
      // Adjust protein target based on muscle goals (1.2-2.0g per kg)
      const proteinMultiplier = this.muscleGoal === 'gain' ? 2.0 : 1.2;
      this.proteinTarget = Math.round(this.targetWeight * proteinMultiplier);
      
      // Base metabolic rate (BMR) calculation remains the same
      const bmr = (10 * this.currentWeight) + 625;
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