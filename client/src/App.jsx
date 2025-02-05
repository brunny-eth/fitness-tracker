import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import NutritionPage from './components/nutrition/NutritionPage';
import WorkoutPage from './pages/WorkoutPage';
import GoalsPage from './components/nutrition/GoalsPage';
import HistoryPage from './components/history/HistoryPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
      <nav className="border-b mb-4">
          <div className="max-w-2xl mx-auto p-4 flex gap-4">
            <Link to="/" className="hover:text-blue-600">Nutrition</Link>
            <Link to="/workouts" className="hover:text-blue-600">Workouts</Link>
            <Link to="/goals" className="hover:text-blue-600">Goals</Link>
            <Link to="/history" className="hover:text-blue-600">History</Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<NutritionPage />} />
          <Route path="/workouts" element={<WorkoutPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;