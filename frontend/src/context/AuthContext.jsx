import React, { createContext, useState, useEffect } from 'react'
import authService from '../services/authService'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('campuscare_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('campuscare_token')
      const storedUser = localStorage.getItem('campuscare_user')

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          setToken(storedToken)
          // Verify with backend silently
          const profileRes = await authService.getProfile()
          if (profileRes.success) {
            setUser(profileRes.data)
            localStorage.setItem('campuscare_user', JSON.stringify(profileRes.data))
          }
        } catch (e) {
          console.warn('Session verification failed:', e)
          localStorage.removeItem('campuscare_token')
          localStorage.removeItem('campuscare_user')
          setUser(null)
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    const res = await authService.login(email, password)
    if (res.success && res.data) {
      const { user: loggedInUser, token: authToken } = res.data
      setUser(loggedInUser)
      setToken(authToken)
      localStorage.setItem('campuscare_token', authToken)
      localStorage.setItem('campuscare_user', JSON.stringify(loggedInUser))
      return res
    }
    throw new Error(res.message || 'Login failed')
  }

  const register = async (userData) => {
    const res = await authService.register(userData)
    if (res.success && res.data) {
      const { user: registeredUser, token: authToken } = res.data
      setUser(registeredUser)
      setToken(authToken)
      localStorage.setItem('campuscare_token', authToken)
      localStorage.setItem('campuscare_user', JSON.stringify(registeredUser))
      return res
    }
    throw new Error(res.message || 'Registration failed')
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setToken(null)
  }

  const refreshProfile = async () => {
    try {
      const res = await authService.getProfile()
      if (res.success) {
        setUser(res.data)
        localStorage.setItem('campuscare_user', JSON.stringify(res.data))
      }
    } catch (e) {
      console.error('Failed to refresh profile', e)
    }
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isStudent: user?.role === 'student',
    isStaff: user?.role === 'staff',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
