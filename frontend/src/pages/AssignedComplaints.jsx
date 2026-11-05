import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Search, Filter, Wrench, CheckCircle2, Send, ExternalLink } from 'lucide-react'
import { Modal, Button } from 'react-bootstrap'
import complaintService from '../services/complaintService'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { formatDateTime, formatRelative } from '../utils/formatDate'
import { toast } from 'react-toastify'

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Status update modal state
  const [showModal, setShowModal] = useState(false)
  const [activeComplaint, setActiveComplaint] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('in_progress')
  const [remarks, setRemarks] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadAssignedTasks()
  }, [])

  const loadAssignedTasks = async () => {
    setLoading(true)
    try {
      const res = await complaintService.getStaffComplaints()
      if (res.success) {
        setComplaints(res.data || [])
      }
    } catch (e) {
      toast.error('Failed to load assigned work orders')
    } finally {
      setLoading(false)
    }
  }

  const openStatusModal = (complaint) => {
    setActiveComplaint(complaint)
    setSelectedStatus(complaint.status === 'assigned' ? 'in_progress' : complaint.status)
    setRemarks('')
    setShowModal(true)
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (!activeComplaint) return

    setUpdating(true)
    try {
      const res = await complaintService.updateStaffStatus(activeComplaint.id, selectedStatus, remarks)
      if (res.success) {
        toast.success(`Complaint #${activeComplaint.id} updated!`)
        setShowModal(false)
        loadAssignedTasks()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const filtered = complaints.filter(c => {
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchSearch = !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="dashboard-page-content">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Assigned Work Orders</h2>
          <p className="text-muted small mb-0">
            Track and execute campus maintenance tasks assigned to your technician queue.
          </p>
        </div>
      </div>

      {/* Filter bar */}
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
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-1 overflow-auto">
              {['', 'assigned', 'in_progress', 'resolved', 'closed'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn btn-sm text-nowrap ${
                    statusFilter === s ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s ? s.replace('_', ' ').toUpperCase() : 'ALL WORK ORDERS'}
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
                <th style={{ width: '80px' }}>ID</th>
                <th>Defect Title & Category</th>
                <th>Location</th>
                <th>Priority Score</th>
                <th>Status</th>
                <th>Assigned Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading work orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No work orders found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-bold text-muted">#{c.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{c.title}</div>
                      <div className="small text-muted">{c.category_name}</div>
                    </td>
                    <td className="small text-secondary">{c.location_name}</td>
                    <td>
                      <PriorityBadge
                        level={c.priority?.priority_level}
                        score={c.priority?.total_priority_score}
                      />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="small text-muted">
                      {formatRelative(c.assignment?.assigned_at || c.created_at)}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1.5">
                        <button
                          className="btn btn-outline-primary btn-sm py-1 px-2.5 d-flex align-items-center gap-1"
                          onClick={() => openStatusModal(c)}
                        >
                          <Wrench size={13} /> Update Status
                        </button>
                        <Link
                          to={`/complaints/${c.id}`}
                          className="btn btn-light btn-sm py-1 px-2 text-secondary"
                          title="Open Details & Photos"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            Update Task Status: Complaint #{activeComplaint?.id}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleUpdateStatus}>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Complaint</label>
              <div className="p-2.5 bg-light rounded border small">
                <strong>{activeComplaint?.title}</strong>
                <div className="text-muted mt-1">{activeComplaint?.location_name}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Set Work Status *</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                required
              >
                <option value="in_progress">In Progress (Work Underway)</option>
                <option value="resolved">Resolved (Defect Repaired & Verified)</option>
                <option value="assigned">Assigned (Pending Inspection)</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Technician Progress Notes / Materials Used</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Replaced 15A switchboard, tightened ground screw, power restored."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={updating}>
              {updating ? 'Saving...' : 'Submit Update'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}

export default AssignedComplaints
