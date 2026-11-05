import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Clock, AlertTriangle, CheckCircle2, ArrowRight, Eye, Wrench } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import complaintService from '../services/complaintService'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { formatRelative } from '../utils/formatDate'

const StaffDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStaffDashboard()
  }, [])

  const loadStaffDashboard = async () => {
    setLoading(true)
    try {
      const res = await complaintService.getStaffDashboard()
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
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Staff Maintenance Operations</h2>
          <p className="text-muted small mb-0">
            Welcome, <strong>{user?.full_name}</strong>. Here are your assigned work orders and priority repairs.
          </p>
        </div>
        <Link to="/staff/tasks" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
          <CheckSquare size={18} />
          <span>View All Work Orders</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Total Assigned</div>
              <div className="fs-3 fw-bold text-dark">{stats?.total_assigned || 0}</div>
            </div>
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <CheckSquare size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Pending Inspection</div>
              <div className="fs-3 fw-bold text-warning">{stats?.pending_tasks || 0}</div>
            </div>
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Currently In Progress</div>
              <div className="fs-3 fw-bold text-info">{stats?.in_progress_tasks || 0}</div>
            </div>
            <div className="stat-icon bg-info bg-opacity-10 text-info">
              <Wrench size={22} />
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-medium">Resolved Work Orders</div>
              <div className="fs-3 fw-bold text-success">{stats?.resolved_tasks || 0}</div>
            </div>
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Priority Work Orders Table */}
      <div className="card border-0 shadow-sm bg-white">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0 fs-6">High Priority Assigned Complaints</h5>
          <Link to="/staff/tasks" className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold">
            All Work Orders <ArrowRight size={14} className="ms-1" />
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
                <th>Current Status</th>
                <th>Reported</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading tasks...
                  </td>
                </tr>
              ) : !stats?.recent_tasks || stats.recent_tasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No work orders currently assigned to you.
                  </td>
                </tr>
              ) : (
                stats.recent_tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="fw-bold text-muted">#{task.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{task.title}</div>
                      <div className="small text-muted">{task.category_name}</div>
                    </td>
                    <td className="small text-secondary">{task.location_name}</td>
                    <td>
                      <PriorityBadge
                        level={task.priority?.priority_level}
                        score={task.priority?.total_priority_score}
                      />
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="small text-muted">{formatRelative(task.created_at)}</td>
                    <td className="text-end">
                      <Link to={`/complaints/${task.id}`} className="btn btn-primary btn-sm py-1 px-3">
                        Manage Task
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

export default StaffDashboard
