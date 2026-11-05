import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Search, Filter, Layers, ArrowRight } from 'lucide-react'
import complaintService from '../services/complaintService'
import ComplaintCard from '../components/ComplaintCard'
import { toast } from 'react-toastify'

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [supportingId, setSupportingId] = useState(null)

  useEffect(() => {
    loadComplaints()
  }, [])

  const loadComplaints = async () => {
    setLoading(true)
    try {
      const res = await complaintService.getMyComplaints()
      if (res.success) {
        setComplaints(res.data || [])
      }
    } catch (e) {
      toast.error('Failed to load your complaints')
    } finally {
      setLoading(false)
    }
  }

  const handleSupport = async (id) => {
    setSupportingId(id)
    try {
      const target = complaints.find(c => c.id === id)
      if (target?.has_supported) {
        const res = await complaintService.unsupportComplaint(id)
        if (res.success) {
          toast.info('Support removed.')
          setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...res.data } : c))
        }
      } else {
        const res = await complaintService.supportComplaint(id)
        if (res.success) {
          toast.success('Complaint supported!')
          setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...res.data } : c))
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed')
    } finally {
      setSupportingId(null)
    }
  }

  const filtered = complaints.filter(c => {
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchSearch = !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="dashboard-page-content">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Submitted Complaints</h2>
          <p className="text-muted small mb-0">
            View status, timeline, priority score evaluations, and technician notes for your requests.
          </p>
        </div>
        <Link to="/submit" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
          <PlusCircle size={18} />
          <span>New Complaint</span>
        </Link>
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
                placeholder="Search your complaints by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-1 overflow-auto">
              {['', 'pending', 'assigned', 'in_progress', 'resolved', 'closed'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn btn-sm text-nowrap ${
                    statusFilter === s ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s ? s.replace('_', ' ').toUpperCase() : 'ALL'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2 small">Loading your complaints...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-5 border-0 shadow-sm bg-white">
          <div className="card-body">
            <Layers size={48} className="text-muted mb-2" />
            <h5 className="fw-bold">No complaints found</h5>
            <p className="text-muted small">You haven't submitted complaints matching these filters.</p>
            <Link to="/submit" className="btn btn-primary btn-sm mt-2">
              Submit a Complaint
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((c) => (
            <div key={c.id} className="col-md-6 col-lg-4">
              <ComplaintCard
                complaint={c}
                onSupport={handleSupport}
                isSupporting={supportingId === c.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyComplaints
