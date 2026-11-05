import api from './api'

export const complaintService = {
  async getComplaints(params = {}) {
    const res = await api.get('/complaints', { params })
    return res.data
  },

  async getComplaintDetails(id) {
    const res = await api.get(`/complaints/${id}`)
    return res.data
  },

  async createComplaint(formData) {
    const res = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data
  },

  async uploadComplaintPhoto(complaintId, file) {
    const data = new FormData()
    data.append('image', file)
    const res = await api.post(`/complaints/${complaintId}/images`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data
  },

  async supportComplaint(complaintId) {
    const res = await api.post(`/complaints/${complaintId}/support`)
    return res.data
  },

  async unsupportComplaint(complaintId) {
    const res = await api.delete(`/complaints/${complaintId}/support`)
    return res.data
  },

  async getDuplicateSuggestions(categoryId, locationId, excludeId = null) {
    const params = { category_id: categoryId, location_id: locationId }
    if (excludeId) params.exclude_id = excludeId
    const res = await api.get('/complaints/duplicates', { params })
    return res.data
  },

  async getCategories() {
    const res = await api.get('/complaints/categories')
    return res.data
  },

  async getLocations() {
    const res = await api.get('/complaints/locations')
    return res.data
  },

  async getMyComplaints(params = {}) {
    const res = await api.get('/student/complaints', { params })
    return res.data
  },

  async getStudentDashboard() {
    const res = await api.get('/student/dashboard')
    return res.data
  },

  async getStaffComplaints(params = {}) {
    const res = await api.get('/staff/complaints', { params })
    return res.data
  },

  async getStaffDashboard() {
    const res = await api.get('/staff/dashboard')
    return res.data
  },

  async updateStaffStatus(complaintId, status, remarks = '') {
    const res = await api.put(`/staff/complaints/${complaintId}/status`, { status, remarks })
    return res.data
  }
}

export default complaintService
