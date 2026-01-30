import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Persons from './pages/Persons';
import Login from './pages/Login';
import { useAuth } from './AuthContext';

export default function App() {
  const { user, initializing } = useAuth();
  return (
    <>
      <main className="app-shell">
        <Routes>
          <Route
            path="/"
            element={
              initializing ? null : (user ? <Navigate to="/persons" replace /> : <Login />)
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/persons"
            element={<ProtectedRoute><Persons /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </>
  );
}

