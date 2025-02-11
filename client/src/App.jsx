import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import NutritionPage from './components/nutrition/NutritionPage';
import WorkoutPage from './pages/WorkoutPage';
import GoalsPage from './components/nutrition/GoalsPage';
import HistoryPage from './components/history/HistoryPage';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RegisterPage from './components/auth/RegisterPage';
import { Button } from './components/ui/button';

function App() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // The ProtectedRoute will handle redirect
  };

  return (
    <BrowserRouter>
      <div className="App">
        <nav className="border-b mb-4">
          <div className="max-w-2xl mx-auto p-4 flex justify-between">
            <div className="flex gap-4">
              <Link to="/" className="hover:text-blue-600">Nutrition</Link>
              <Link to="/workouts" className="hover:text-blue-600">Workouts</Link>
              <Link to="/goals" className="hover:text-blue-600">Goals</Link>
              <Link to="/history" className="hover:text-blue-600">History</Link>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.username}</span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            )}
          </div>
        </nav>
        
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <LoginPage />
          } />
          
                  
          <Route path="/register" element={
            user ? <Navigate to="/" replace /> : <RegisterPage />
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <NutritionPage />
            </ProtectedRoute>
          } />
          
          <Route path="/workouts" element={
            <ProtectedRoute>
              <WorkoutPage />
            </ProtectedRoute>
          } />
          
          <Route path="/goals" element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;