import api from './api'

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },

  async register(userData) {
    const res = await api.post('/auth/register', userData)
    return res.data
  },

  async getProfile() {
    const res = await api.get('/auth/profile')
    return res.data
  },

  async updateProfile(profileData) {
    const res = await api.put('/auth/profile', profileData)
    return res.data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('campuscare_token')
      localStorage.removeItem('campuscare_user')
    }
  }
}

export default authService
