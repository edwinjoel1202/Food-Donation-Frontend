import React, { createContext, useEffect, useState } from 'react'
import api from '../services/api'
import { setToken as storeToken, getToken, clearToken } from '../services/authToken'
import { toast } from 'react-toastify'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      // attempt to read minimal profile from backend
      api.get('/users/me')
        .then(res => {
          setUser(res.data)
        })
        .catch(() => {
          // fallback: maybe backend doesn't have /users/me -> decode token not available here
          clearToken()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const payload = res.data
    if (payload?.token) {
      storeToken(payload.token)
      // set user from payload fields if present
      setUser({ id: payload.userId, email: payload.email, name: payload.name, role: payload.role })
      toast.success('Logged in')
      return payload
    } else {
      throw new Error('No token returned')
    }
  }

  const register = async (name, email, password, role = 'USER') => {
    const res = await api.post('/auth/register', { name, email, password, role })
    const payload = res.data
    if (payload?.token) {
      storeToken(payload.token)
      setUser({ id: payload.userId, email: payload.email, name: payload.name, role: payload.role })
      toast.success('Registered')
      return payload
    } else {
      throw new Error('No token returned')
    }
  }

  const logout = () => {
    clearToken()
    setUser(null)
    toast.info('Logged out')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
