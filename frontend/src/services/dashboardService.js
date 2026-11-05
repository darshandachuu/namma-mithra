import api from './api'

export const dashboardService = {
  async getSummary() {
    const res = await api.get('/dashboard/summary')
    return res.data
  },

  async getChartsData() {
    const res = await api.get('/dashboard/charts')
    return res.data
  },

  async getAdminReports() {
    const res = await api.get('/admin/reports')
    return res.data
  },

  async assignComplaint(complaintId, staffId, notes = '') {
    const res = await api.post('/admin/assignments', {
      complaint_id: complaintId,
      staff_id: staffId,
      notes
    })
    return res.data
  },

  async getUsers(role = null) {
    const params = role ? { role } : {}
    const res = await api.get('/admin/users', { params })
    return res.data
  },

  async createUser(userData) {
    const res = await api.post('/admin/users', userData)
    return res.data
  },

  async updateUser(userId, userData) {
    const res = await api.put(`/admin/users/${userId}`, userData)
    return res.data
  },

  async createCategory(data) {
    const res = await api.post('/admin/categories', data)
    return res.data
  },

  async updateCategory(catId, data) {
    const res = await api.put(`/admin/categories/${catId}`, data)
    return res.data
  },

  async deleteCategory(catId) {
    const res = await api.delete(`/admin/categories/${catId}`)
    return res.data
  },

  async createLocation(data) {
    const res = await api.post('/admin/locations', data)
    return res.data
  },

  async updateLocation(locId, data) {
    const res = await api.put(`/admin/locations/${locId}`, data)
    return res.data
  },

  async deleteLocation(locId) {
    const res = await api.delete(`/admin/locations/${locId}`)
    return res.data
  },

  // Notifications
  async getNotifications() {
    const res = await api.get('/notifications')
    return res.data
  },

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count')
    return res.data
  },

  async markNotificationRead(notifId) {
    const res = await api.put(`/notifications/${notifId}/read`)
    return res.data
  },

  async markAllNotificationsRead() {
    const res = await api.put('/notifications/read-all')
    return res.data
  }
}

export default dashboardService
