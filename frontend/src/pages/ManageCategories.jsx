import React, { useState, useEffect } from 'react'
import { FolderTree, Plus, Edit2, Trash2 } from 'lucide-react'
import { Modal, Button } from 'react-bootstrap'
import complaintService from '../services/complaintService'
import dashboardService from '../services/dashboardService'
import { toast } from 'react-toastify'

const ManageCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_severity: 20
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await complaintService.getCategories()
      if (res.success) {
        setCategories(res.data || [])
      }
    } catch (e) {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', default_severity: 20 })
    setShowModal(true)
  }

  const openEditModal = (cat) => {
    setEditingId(cat.id)
    setFormData({
      name: cat.name,
      description: cat.description || '',
      default_severity: cat.default_severity || 20
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const res = await dashboardService.updateCategory(editingId, formData)
        if (res.success) {
          toast.success('Category updated!')
          setShowModal(false)
          loadCategories()
        }
      } else {
        const res = await dashboardService.createCategory(formData)
        if (res.success) {
          toast.success('Category created!')
          setShowModal(false)
          loadCategories()
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return

    try {
      const res = await dashboardService.deleteCategory(id)
      if (res.success) {
        toast.info('Category deleted.')
        loadCategories()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete category')
    }
  }

  return (
    <div className="dashboard-page-content">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Facility Categories</h2>
          <p className="text-muted small mb-0">
            Define infrastructure classification types and baseline defect severities.
          </p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={openCreateModal}>
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Default Severity</th>
                <th>Total Complaints</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No categories defined.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-bold text-muted">#{c.id}</td>
                    <td className="fw-bold text-dark">{c.name}</td>
                    <td className="small text-secondary">{c.description || 'N/A'}</td>
                    <td>
                      <span className="badge bg-warning bg-opacity-25 text-dark fw-bold">
                        {c.default_severity} / 40 pts
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border">{c.complaint_count || 0} tickets</span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-light btn-sm me-1"
                        onClick={() => openEditModal(c)}
                        title="Edit Category"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(c.id, c.name)}
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            {editingId ? 'Edit Category' : 'Create Category'}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSave}>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Category Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Electrical & Lighting"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Description</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Scope of repairs under this category..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary d-flex justify-content-between">
                <span>Default Baseline Severity (out of 40):</span>
                <strong>{formData.default_severity} marks</strong>
              </label>
              <input
                type="range"
                className="form-range"
                min="5"
                max="40"
                step="5"
                value={formData.default_severity}
                onChange={(e) => setFormData({ ...formData, default_severity: parseInt(e.target.value) })}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Category'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}

export default ManageCategories
