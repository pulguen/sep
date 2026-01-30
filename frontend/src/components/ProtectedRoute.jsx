import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth()
  if (initializing) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

