import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext.jsx'

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext)

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />

  return children
}

export default PrivateRoute
