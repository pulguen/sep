import React from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Persons from './pages/Persons';
import Login from './pages/Login';
import AuditLogs from './pages/AuditLogs';
import { useAuth } from './AuthContext';

export default function App() {
  const { user, initializing, logout } = useAuth();
  return (
    <>
      {user && (
        <header className="top-nav">
          <div className="nav-inner">
            <div className="brand">
              <div className="brand-mark">SEP</div>
              <div>
                <div className="brand-title">Sistema de Ejecución Penal</div>
                <div className="brand-subtitle">Gestión segura y trazable</div>
              </div>
            </div>
            <nav className="nav-links">
              <NavLink to="/persons" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Personas
              </NavLink>
              <NavLink to="/audit" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Auditoría
              </NavLink>
              <a className="nav-link" href="http://127.0.0.1:8001/admin/" target="_blank" rel="noreferrer">
                Admin
              </a>
            </nav>
            <div className="nav-actions">
              <span className="nav-user">{user.username}</span>
              <button className="btn-ghost" type="button" onClick={logout}>Salir</button>
            </div>
          </div>
        </header>
      )}
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
          <Route
            path="/audit"
            element={<ProtectedRoute><AuditLogs /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </>
  );
}

