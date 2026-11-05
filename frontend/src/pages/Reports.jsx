import React, { useState, useEffect } from 'react'
import { BarChart3, Printer, CheckCircle2, AlertTriangle, Layers, UserCheck } from 'lucide-react'
import dashboardService from '../services/dashboardService'
import { toast } from 'react-toastify'

const Reports = () => {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const res = await dashboardService.getAdminReports()
      if (res.success) {
        setReports(res.data)
      }
    } catch (e) {
      toast.error('Failed to generate reports')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="dashboard-page-content text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2 small">Generating facility performance reports...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page-content" id="printable-report">
      {/* Header with Namma Mithra Logo */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <img src="/logo.png" alt="Namma Mithra" style={{ height: '54px', width: 'auto' }} />
          <div>
            <h3 className="fw-bold text-dark mb-0">ನಮ್ಮ ಮಿತ್ರ (Namma Mithra)</h3>
            <p className="text-muted small mb-0">
              Facility Audit & Resolution Performance Report
            </p>
          </div>
        </div>
        <button className="btn btn-outline-danger d-flex align-items-center gap-2 fw-semibold" onClick={handlePrint}>
          <Printer size={16} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3.5 bg-white text-center">
            <div className="text-muted small fw-semibold text-uppercase">Total Logged Tickets</div>
            <div className="display-6 fw-bold text-dark my-1">{reports?.total_complaints || 0}</div>
            <span className="small text-muted">Across all campus departments</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3.5 bg-white text-center">
            <div className="text-muted small fw-semibold text-uppercase">Total Resolved Issues</div>
            <div className="display-6 fw-bold text-success my-1">{reports?.resolved_count || 0}</div>
            <span className="small text-success fw-semibold">Fixed & Verified by Staff</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3.5 bg-white text-center">
            <div className="text-muted small fw-semibold text-uppercase">Institutional Resolution Rate</div>
            <div className="display-6 fw-bold text-primary my-1">{reports?.resolution_rate || 0}%</div>
            <span className="small text-muted">Efficiency ratio</span>
          </div>
        </div>
      </div>

      {/* Severity Breakdown Table */}
      <div className="card border-0 shadow-sm bg-white mb-4">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="fw-bold text-dark mb-0 fs-6">1. Rule-Based Priority Tier Breakdown</h5>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th>Priority Level</th>
                <th>Score Range</th>
                <th>Action Standard</th>
                <th className="text-end">Ticket Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge bg-danger">Critical</span></td>
                <td>80 - 100 points</td>
                <td className="small text-secondary">Immediate safety or campus-wide blackout hazard. Requires 4-hour SLA.</td>
                <td className="text-end fw-bold fs-6">{reports?.severity_breakdown?.['Critical (80-100)'] || 0}</td>
              </tr>
              <tr>
                <td><span className="badge bg-warning text-dark">High</span></td>
                <td>60 - 79 points</td>
                <td className="small text-secondary">Major lecture hall or lab obstruction. Requires 24-hour SLA.</td>
                <td className="text-end fw-bold fs-6">{reports?.severity_breakdown?.['High (60-79)'] || 0}</td>
              </tr>
              <tr>
                <td><span className="badge bg-info text-dark">Medium</span></td>
                <td>35 - 59 points</td>
                <td className="small text-secondary">Standard repair (faucet, broken armrest, Wi-Fi booster). Requires 48-hour SLA.</td>
                <td className="text-end fw-bold fs-6">{reports?.severity_breakdown?.['Medium (35-59)'] || 0}</td>
              </tr>
              <tr>
                <td><span className="badge bg-secondary">Low</span></td>
                <td>0 - 34 points</td>
                <td className="small text-secondary">Minor aesthetic repair or scheduled maintenance overhaul.</td>
                <td className="text-end fw-bold fs-6">{reports?.severity_breakdown?.['Low (0-34)'] || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Performance Table */}
      <div className="card border-0 shadow-sm bg-white mb-4">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="fw-bold text-dark mb-0 fs-6">2. Infrastructure Domain Performance</h5>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th>Category</th>
                <th>Total Reported</th>
                <th>Resolved</th>
                <th>Pending / Active</th>
                <th>Resolution Velocity</th>
              </tr>
            </thead>
            <tbody>
              {reports?.category_metrics && reports.category_metrics.map((cm, idx) => {
                const rate = cm.total_complaints > 0 ? Math.round((cm.resolved_complaints / cm.total_complaints) * 100) : 0
                return (
                  <tr key={idx}>
                    <td className="fw-bold text-dark">{cm.category_name}</td>
                    <td>{cm.total_complaints}</td>
                    <td className="text-success fw-semibold">{cm.resolved_complaints}</td>
                    <td className="text-warning fw-semibold">{cm.pending_complaints}</td>
                    <td style={{ width: '220px' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: '6px' }}>
                          <div className="progress-bar bg-success" style={{ width: `${rate}%` }}></div>
                        </div>
                        <span className="small text-muted fw-semibold">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Technician Performance Table */}
      <div className="card border-0 shadow-sm bg-white mb-4">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="fw-bold text-dark mb-0 fs-6">3. Staff Technician Workload & Closures</h5>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light small text-muted text-uppercase">
              <tr>
                <th>Technician Name</th>
                <th>Staff Email</th>
                <th>Total Assigned</th>
                <th>In Progress</th>
                <th>Successfully Resolved</th>
              </tr>
            </thead>
            <tbody>
              {reports?.staff_metrics && reports.staff_metrics.map((sm, idx) => (
                <tr key={idx}>
                  <td className="fw-bold text-dark">{sm.staff_name}</td>
                  <td className="small text-muted">{sm.email}</td>
                  <td><span className="badge bg-light text-primary border">{sm.assigned} tasks</span></td>
                  <td><span className="badge bg-warning bg-opacity-25 text-dark">{sm.in_progress} in progress</span></td>
                  <td><span className="badge bg-success bg-opacity-25 text-success fw-bold">{sm.resolved} resolved</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
