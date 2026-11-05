import React, { useState, useEffect } from 'react'
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react'
import { Modal, Button } from 'react-bootstrap'
import complaintService from '../services/complaintService'
import dashboardService from '../services/dashboardService'
import { toast } from 'react-toastify'

const ManageLocations = () => {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    building_name: '',
    block: '',
    floor: '',
    room_number: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    setLoading(true)
    try {
      const res = await complaintService.getLocations()
      if (res.success) {
        setLocations(res.data || [])
      }
    } catch (e) {
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    setFormData({ building_name: '', block: '', floor: '', room_number: '' })
    setShowModal(true)
  }

  const openEditModal = (loc) => {
    setEditingId(loc.id)
    setFormData({
      building_name: loc.building_name,
      block: loc.block || '',
      floor: loc.floor || '',
      room_number: loc.room_number || ''
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const res = await dashboardService.updateLocation(editingId, formData)
        if (res.success) {
          toast.success('Location updated!')
          setShowModal(false)
          loadLocations()
        }
      } else {
        const res = await dashboardService.createLocation(formData)
        if (res.success) {
          toast.success('Location created!')
          setShowModal(false)
          loadLocations()
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete location "${name}"?`)) return

    try {
      const res = await dashboardService.deleteLocation(id)
      if (res.success) {
        toast.info('Location deleted.')
        loadLocations()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete location')
    }
  }

  return (
    <div className="dashboard-page-content">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Campus Locations</h2>
          <p className="text-muted small mb-0">
            Maintain campus buildings, wings, classrooms, lecture halls, and laboratories.
          </p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={openCreateModal}>
          <Plus size={18} />
          <span>Add Location</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Building Name</th>
                <th>Block / Wing</th>
                <th>Floor</th>
                <th>Room / Facility</th>
                <th>Active Issues</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading locations...
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No locations added yet.
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id}>
                    <td className="fw-bold text-muted">#{loc.id}</td>
                    <td className="fw-bold text-dark">{loc.building_name}</td>
                    <td className="small text-secondary">{loc.block || '—'}</td>
                    <td className="small text-secondary">{loc.floor || '—'}</td>
                    <td className="small text-dark fw-medium">{loc.room_number || 'General Area'}</td>
                    <td>
                      <span className="badge bg-light text-primary border">{loc.complaint_count || 0} tickets</span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-light btn-sm me-1"
                        onClick={() => openEditModal(loc)}
                        title="Edit Location"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(loc.id, loc.display_name)}
                        title="Delete Location"
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
            {editingId ? 'Edit Campus Location' : 'Add Campus Location'}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSave}>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Building Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Science & Computing Block"
                value={formData.building_name}
                onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                required
              />
            </div>

            <div className="row g-2.5 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Block / Wing</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. West Wing / Block B"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Floor</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 2nd Floor"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Room / Area Identifier</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MCA Lab 301 / Classroom 102 / Restroom"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Location'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}

export default ManageLocations
