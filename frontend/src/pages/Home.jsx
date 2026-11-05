import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, PlusCircle, Search, Filter, Layers, CheckCircle2, AlertTriangle, Users } from 'lucide-react'
import complaintService from '../services/complaintService'
import dashboardService from '../services/dashboardService'
import ComplaintCard from '../components/ComplaintCard'
import { toast } from 'react-toastify'
import { useAuth } from '../hooks/useAuth'

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [categories, setCategories] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [supportingId, setSupportingId] = useState(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [compRes, catRes, sumRes] = await Promise.all([
        complaintService.getComplaints(),
        complaintService.getCategories(),
        dashboardService.getSummary()
      ])

      if (compRes.success) setComplaints(compRes.data || [])
      if (catRes.success) setCategories(catRes.data || [])
      if (sumRes.success) setSummary(sumRes.data || null)
    } catch (e) {
      toast.error('Failed to load campus issues')
    } finally {
      setLoading(false)
    }
  }

  const handleSupport = async (id) => {
    if (!isAuthenticated) {
      toast.info('Please sign in as a student to support complaints.')
      return
    }

    setSupportingId(id)
    try {
      const target = complaints.find(c => c.id === id)
      if (target?.has_supported) {
        const res = await complaintService.unsupportComplaint(id)
        if (res.success) {
          toast.info('Support removed.')
          updateComplaintInList(res.data)
        }
      } else {
        const res = await complaintService.supportComplaint(id)
        if (res.success) {
          toast.success('Thank you! Complaint supported & priority updated.')
          updateComplaintInList(res.data)
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not update support vote')
    } finally {
      setSupportingId(null)
    }
  }

  const updateComplaintInList = (updated) => {
    setComplaints(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))
  }

  // Filtered complaints
  const filtered = complaints.filter(c => {
    const matchesSearch = !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !selectedCategory || c.category_id === parseInt(selectedCategory)
    const matchesStatus = !selectedStatus || c.status === selectedStatus
    const matchesPriority = !selectedPriority || c.priority?.priority_level === selectedPriority

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority
  })

  return (
    <div className="container-fluid px-3 px-lg-5 py-4">
      {/* Hero Banner with Namma Mithra Branding & Logo */}
      <div
        className="card text-white border-0 shadow-lg mb-4 overflow-hidden position-relative"
        style={{
          background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 30%, #991b1b 65%, #b91c1c 85%, #ea580c 100%)',
          borderRadius: '18px'
        }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-warning text-dark px-3 py-1.5 rounded-pill fw-bold" style={{ letterSpacing: '0.5px' }}>
                  ನಮ್ಮ ಮಿತ್ರ • NAMMA MITHRA
                </span>
              </div>
              <h1 className="display-5 fw-bold mb-3 text-white">
                ನಮ್ಮ ಮಿತ್ರ (Namma Mithra)
              </h1>
              <p className="lead text-white-50 mb-4" style={{ fontSize: '1.05rem', maxWidth: '650px', lineHeight: '1.6' }}>
                Report maintenance issues with photographs, prevent duplicates by supporting active requests, and track rapid technician resolution with explainable priority scores.
              </p>
              <div className="d-flex flex-wrap gap-2.5">
                <Link to="/submit" className="btn btn-gold px-4 py-2.5 d-flex align-items-center gap-2 shadow text-dark fw-bold">
                  <PlusCircle size={18} /> Submit a Complaint
                </Link>
                {!isAuthenticated ? (
                  <Link to="/login" className="btn btn-outline-light px-4 py-2.5 fw-semibold">
                    Sign In
                  </Link>
                ) : (
                  <Link to={user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/student'} className="btn btn-outline-light px-4 py-2.5 fw-semibold">
                    Go to {user?.role.toUpperCase()} Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="col-lg-4 text-center mt-4 mt-lg-0">
              <div className="p-4 bg-white bg-opacity-15 rounded-4 border border-white border-opacity-25 shadow-sm backdrop-blur">
                <div className="bg-white p-3 rounded-3 shadow mb-3 d-inline-block">
                  <img src="/logo.png" alt="Namma Mithra Logo" className="brand-logo-img-lg" />
                </div>
                <div className="text-warning display-5 fw-bold mb-0">{summary?.total_complaints || 0}</div>
                <div className="text-white-50 small mb-3 fw-medium">Active Campus Tickets</div>
                <div className="d-flex justify-content-around text-start border-top border-white border-opacity-20 pt-3">
                  <div>
                    <div className="fw-bold fs-5 text-warning">{summary?.pending || 0}</div>
                    <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>Pending</div>
                  </div>
                  <div>
                    <div className="fw-bold fs-5 text-info">{summary?.in_progress || 0}</div>
                    <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>In Progress</div>
                  </div>
                  <div>
                    <div className="fw-bold fs-5 text-success">{summary?.resolved || 0}</div>
                    <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>Resolved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Campus Feed Header & Filter Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Live Campus Feed</h3>
          <p className="text-muted small mb-0">
            Browse active maintenance tickets across departments, classrooms, labs, and student hostels.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-secondary border px-3 py-2">
            Showing {filtered.length} of {complaints.length} tickets
          </span>
        </div>
      </div>

      {/* Search & Filters */}
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
                placeholder="Search by title, location or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select bg-light"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select bg-light"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical (80-100)</option>
              <option value="High">High (60-79)</option>
              <option value="Medium">Medium (35-59)</option>
              <option value="Low">Low (0-34)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading issues...</span>
          </div>
          <p className="text-muted mt-2 small">Loading campus complaints...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-5 border-0 shadow-sm bg-white">
          <div className="card-body">
            <Layers size={48} className="text-muted mb-2" />
            <h5 className="fw-bold">No complaints match your filters</h5>
            <p className="text-muted small">Try clearing your filters or search terms.</p>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setSelectedStatus('')
                setSelectedPriority('')
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((complaint) => (
            <div key={complaint.id} className="col-md-6 col-lg-4">
              <ComplaintCard
                complaint={complaint}
                onSupport={handleSupport}
                isSupporting={supportingId === complaint.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
