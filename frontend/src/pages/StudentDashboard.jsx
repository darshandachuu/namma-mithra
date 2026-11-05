import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Clock, AlertCircle, CheckCircle2, ThumbsUp, ArrowRight, FileText } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import complaintService from '../services/complaintService'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { formatRelative } from '../utils/formatDate'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const res = await complaintService.getStudentDashboard()
      if (res.success) {
        setStats(res.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-page-content">
      {/* Welcome Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Student Portal</h2>
          <p className="text-muted small mb-0">
            Welcome, <strong>{user?.full_name}</strong> ({user?.department || 'Student'}). Manage and monitor your campus maintenance requests.
          </p>
        </div>
        <Link to="/submit" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
          <PlusCircle size={18} />
          <span>Submit New Complaint</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Total Submitted</div>
              <div className="fs-3 fw-bold text-dark">{stats?.total_submitted || 0}</div>
            </div>
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <FileText size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Pending Review</div>
              <div className="fs-3 fw-bold text-warning">{stats?.pending_count || 0}</div>
            </div>
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">In Progress</div>
              <div className="fs-3 fw-bold text-info">{stats?.in_progress_count || 0}</div>
            </div>
            <div className="stat-icon bg-info bg-opacity-10 text-info">
              <AlertCircle size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Resolved & Fixed</div>
              <div className="fs-3 fw-bold text-success">{stats?.resolved_count || 0}</div>
            </div>
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Community Supports Received Banner */}
      <div className="card bg-info bg-opacity-10 border-info border-opacity-25 mb-4 shadow-sm">
        <div className="card-body p-3.5 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-info text-white p-2.5 rounded-circle">
              <ThumbsUp size={22} />
            </div>
            <div>
              <div className="fw-bold text-dark">
                {stats?.total_supports_received || 0} Fellow Student Supports
              </div>
              <div className="small text-muted">
                Other students have upvoted your reported complaints, boosting their priority scores in the administration queue.
              </div>
            </div>
          </div>
          <Link to="/student/complaints" className="btn btn-outline-info btn-sm fw-semibold">
            View My Issues
          </Link>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card border-0 shadow-sm bg-white">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0 fs-6">My Recent Complaints</h5>
          <Link to="/student/complaints" className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold">
            View All ({stats?.total_submitted || 0}) <ArrowRight size={14} className="ms-1" />
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
                <th>Status</th>
                <th>Submitted</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading your complaints...
                  </td>
                </tr>
              ) : !stats?.recent_complaints || stats.recent_complaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <p className="mb-2">You haven't submitted any campus complaints yet.</p>
                    <Link to="/submit" className="btn btn-primary btn-sm">
                      Submit Your First Complaint
                    </Link>
                  </td>
                </tr>
              ) : (
                stats.recent_complaints.map((c) => (
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
                    <td className="small text-muted">{formatRelative(c.created_at)}</td>
                    <td className="text-end">
                      <Link to={`/complaints/${c.id}`} className="btn btn-outline-secondary btn-sm py-1 px-2.5">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
