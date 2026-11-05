import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  Wrench,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserPlus
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts'
import { Modal, Button } from 'react-bootstrap'
import dashboardService from '../services/dashboardService'
import complaintService from '../services/complaintService'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { formatRelative } from '../utils/formatDate'
import { toast } from 'react-toastify'

const COLORS = ['#f59e0b', '#0ea5e9', '#3b82f6', '#10b981', '#64748b', '#ef4444']

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null)
  const [charts, setCharts] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [staffId, setStaffId] = useState('')
  const [notes, setNotes] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [sumRes, chartRes, compRes, staffRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getChartsData(),
        complaintService.getComplaints({ status: 'pending' }),
        dashboardService.getUsers('staff')
      ])

      if (sumRes.success) setSummary(sumRes.data)
      if (chartRes.success) setCharts(chartRes.data)
      if (compRes.success) setComplaints(compRes.data || [])
      if (staffRes.success) setStaffUsers(staffRes.data || [])
    } catch (e) {
      toast.error('Failed to load administrator dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint)
    setStaffId(complaint.assignment?.staff_id || '')
    setNotes(complaint.assignment?.notes || '')
    setShowAssignModal(true)
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!selectedComplaint || !staffId) {
      toast.error('Please choose a technician.')
      return
    }

    setAssigning(true)
    try {
      const res = await dashboardService.assignComplaint(selectedComplaint.id, staffId, notes)
      if (res.success) {
        toast.success(`Complaint #${selectedComplaint.id} assigned successfully!`)
        setShowAssignModal(false)
        loadData()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="dashboard-page-content">
      {/* Title */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Campus Facility Administration</h2>
          <p className="text-muted small mb-0">
            Real-time management dashboard: priority ticket allocation, analytics, and facility monitoring.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/reports" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
            <TrendingUp size={15} /> View Full Reports
          </Link>
          <Link to="/admin/users" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <UserPlus size={15} /> Manage Users
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Total Complaints</div>
              <div className="fs-3 fw-bold text-dark">{summary?.total_complaints || 0}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {summary?.users?.total || 0} Registered Users
              </div>
            </div>
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <Layers size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Pending Assignment</div>
              <div className="fs-3 fw-bold text-warning">{summary?.pending || 0}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Awaiting staff routing</div>
            </div>
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Critical & High Priority</div>
              <div className="fs-3 fw-bold text-danger">
                {(summary?.critical_priority || 0) + (summary?.high_priority || 0)}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {summary?.critical_priority || 0} Critical (80-100 pts)
              </div>
            </div>
            <div className="stat-icon bg-danger bg-opacity-10 text-danger">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Resolved Defects</div>
              <div className="fs-3 fw-bold text-success">{summary?.resolved || 0}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Avg Score: {summary?.average_priority_score || 0} pts
              </div>
            </div>
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts (Recharts) */}
      <div className="row g-4 mb-4">
        {/* Status Distribution Pie */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-3 h-100 bg-white">
            <h6 className="fw-bold text-dark mb-1">Complaint Status Distribution</h6>
            <p className="text-muted small mb-3">Live status breakdown across campus</p>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.status_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(charts?.status_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-3 h-100 bg-white">
            <h6 className="fw-bold text-dark mb-1">Complaints by Category</h6>
            <p className="text-muted small mb-3">Defect volume per facility infrastructure domain</p>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.category_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="complaints" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* High Priority Pending Queue */}
      <div className="card border-0 shadow-sm bg-white mb-4">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-0 fs-6">Pending Complaints Requiring Assignment</h5>
            <span className="text-muted small">Sorted by institutional priority score</span>
          </div>
          <Link to="/admin/complaints" className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold">
            All Complaints <ArrowRight size={14} className="ms-1" />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Title & Category</th>
                <th>Location</th>
                <th>Priority Score</th>
                <th>Supports</th>
                <th>Submitted</th>
                <th className="text-end">Assign Technician</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading pending queue...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <CheckCircle2 size={32} className="text-success mb-2" />
                    <div>All pending complaints have been assigned to technicians!</div>
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
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
                      <span className="badge bg-light text-primary border">
                        {c.support_count} votes
                      </span>
                    </td>
                    <td className="small text-muted">{formatRelative(c.created_at)}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-primary btn-sm py-1 px-3 d-inline-flex align-items-center gap-1 shadow-sm"
                        onClick={() => openAssignModal(c)}
                      >
                        <Wrench size={13} /> Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Assignment Modal */}
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
                <strong>#{selectedComplaint?.id} - {selectedComplaint?.title}</strong>
                <div className="text-muted mt-1">{selectedComplaint?.location_name}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Select Maintenance Staff *</label>
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
              <label className="form-label small fw-semibold text-secondary">Instructions / Urgency Notes</label>
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

export default AdminDashboard
