// src/services/api.js
import axios from 'axios'
import { getToken, clearToken } from './authToken'

const api = axios.create({
  baseURL: '/api', // dev proxy forwards to backend
  timeout: 15000
})

// Add Authorization header if token exists
api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers = {
      // spread existing headers correctly
      ...config.headers,
      Authorization: `Bearer ${token}`
    }
  }
  return config
}, (error) => Promise.reject(error))

// Handle 401 centrally
api.interceptors.response.use(response => response, error => {
  if (error.response && error.response.status === 401) {
    // token expired or invalid - clear and reload
    clearToken()
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

export default api
