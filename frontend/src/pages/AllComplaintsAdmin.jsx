import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Wrench, Eye, AlertCircle } from 'lucide-react'
import { Modal, Button } from 'react-bootstrap'
import complaintService from '../services/complaintService'
import dashboardService from '../services/dashboardService'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { formatRelative } from '../utils/formatDate'
import { toast } from 'react-toastify'

const AllComplaintsAdmin = () => {
  const [complaints, setComplaints] = useState([])
  const [categories, setCategories] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Assign Modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [activeComplaint, setActiveComplaint] = useState(null)
  const [staffId, setStaffId] = useState('')
  const [notes, setNotes] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [compRes, catRes, staffRes] = await Promise.all([
        complaintService.getComplaints(),
        complaintService.getCategories(),
        dashboardService.getUsers('staff')
      ])

      if (compRes.success) setComplaints(compRes.data || [])
      if (catRes.success) setCategories(catRes.data || [])
      if (staffRes.success) setStaffUsers(staffRes.data || [])
    } catch (e) {
      toast.error('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const openAssignModal = (complaint) => {
    setActiveComplaint(complaint)
    setStaffId(complaint.assignment?.staff_id || '')
    setNotes(complaint.assignment?.notes || '')
    setShowAssignModal(true)
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!activeComplaint || !staffId) return

    setAssigning(true)
    try {
      const res = await dashboardService.assignComplaint(activeComplaint.id, staffId, notes)
      if (res.success) {
        toast.success(`Complaint #${activeComplaint.id} assigned!`)
        setShowAssignModal(false)
        loadAll()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  const filtered = complaints.filter(c => {
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchCategory = !categoryFilter || c.category_id === parseInt(categoryFilter)
    const matchPriority = !priorityFilter || c.priority?.priority_level === priorityFilter
    const matchSearch = !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchStatus && matchCategory && matchPriority && matchSearch
  })

  return (
    <div className="dashboard-page-content">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">All Campus Complaints</h2>
          <p className="text-muted small mb-0">
            Complete central registry of institutional complaints, priorities, and maintenance assignments.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-2.5">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select bg-light"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select bg-light"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
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
                <th>Title & Category</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Staff</th>
                <th>Submitted</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading complaints...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No complaints match your query.
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
                    <td className="small">
                      {c.assignment ? (
                        <span className="text-dark fw-medium">{c.assignment.staff_name}</span>
                      ) : (
                        <span className="badge bg-light text-warning border">Unassigned</span>
                      )}
                    </td>
                    <td className="small text-muted">{formatRelative(c.created_at)}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1.5">
                        <button
                          className="btn btn-outline-primary btn-sm py-1 px-2.5"
                          onClick={() => openAssignModal(c)}
                          title="Assign or Reassign Technician"
                        >
                          <Wrench size={13} className="me-1" />
                          {c.assignment ? 'Reassign' : 'Assign'}
                        </button>
                        <Link
                          to={`/complaints/${c.id}`}
                          className="btn btn-light btn-sm py-1 px-2 text-secondary"
                          title="View Details"
                        >
                          <Eye size={14} />
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

      {/* Assign Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            Assign Maintenance Technician
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleAssign}>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Complaint</label>
              <div className="p-2.5 bg-light rounded border small">
                <strong>#{activeComplaint?.id} - {activeComplaint?.title}</strong>
                <div className="text-muted mt-1">{activeComplaint?.location_name}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Choose Staff Technician *</label>
              <select
                className="form-select"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                required
              >
                <option value="">-- Choose Staff Member --</option>
                {staffUsers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.department || 'Maintenance'} - {s.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Instructions / Priority Notes</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Specific instructions or tool requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={assigning}>
              {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}

export default AllComplaintsAdmin
