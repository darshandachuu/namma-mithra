import React, { useState, useEffect } from 'react'
import { Users, UserPlus, Search, Check, X, Shield, Lock, Edit } from 'lucide-react'
import { Modal, Button } from 'react-bootstrap'
import dashboardService from '../services/dashboardService'
import { formatRelative } from '../utils/formatDate'
import { toast } from 'react-toastify'

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Add User Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'staff',
    department: 'Maintenance',
    phone: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await dashboardService.getUsers()
      if (res.success) {
        setUsers(res.data || [])
      }
    } catch (e) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.is_active
      const res = await dashboardService.updateUser(user.id, { is_active: newStatus })
      if (res.success) {
        toast.info(`User ${user.full_name} is now ${newStatus ? 'Active' : 'Deactivated'}`)
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update user status')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await dashboardService.createUser(formData)
      if (res.success) {
        toast.success('User account created successfully!')
        setShowAddModal(false)
        setFormData({
          full_name: '',
          email: '',
          password: '',
          role: 'staff',
          department: 'Maintenance',
          phone: ''
        })
        loadUsers()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const filtered = users.filter(u => {
    const matchRole = !roleFilter || u.role === roleFilter
    const matchSearch = !searchTerm ||
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchRole && matchSearch
  })

  return (
    <div className="dashboard-page-content">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Manage Users & Roles</h2>
          <p className="text-muted small mb-0">
            Control campus user accounts, assign staff technicians, and monitor access credentials.
          </p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-2.5">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search users by name, email, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-1 overflow-auto">
              {['', 'student', 'staff', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`btn btn-sm text-nowrap ${
                    roleFilter === r ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  onClick={() => setRoleFilter(r)}
                >
                  {r ? r.toUpperCase() : 'ALL ROLES'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th>Name & Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Registered</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No users found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold text-muted">#{u.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{u.full_name}</div>
                      <div className="small text-muted">{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        u.role === 'admin' ? 'bg-danger' : u.role === 'staff' ? 'bg-primary' : 'bg-secondary'
                      } text-uppercase small`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="small text-secondary">{u.department || 'N/A'}</td>
                    <td className="small text-muted">{u.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${u.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="small text-muted">{formatRelative(u.created_at)}</td>
                    <td className="text-end">
                      <button
                        className={`btn btn-sm py-1 px-2.5 ${u.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => handleToggleStatus(u)}
                        title={u.is_active ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">Create Campus User Account</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleCreateUser}>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Campus Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. john@campuscare.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="row g-2.5 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Role *</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff Technician</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Department</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Electrical / IT"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="row g-2.5 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Initial Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 chars"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Mobile Phone</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}

export default ManageUsers
