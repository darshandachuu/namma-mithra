import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Tag,
  Calendar,
  User,
  ThumbsUp,
  Camera,
  Wrench,
  CheckCircle2,
  Clock,
  History,
  ShieldAlert,
  Send,
  Upload
} from 'lucide-react'
import complaintService from '../services/complaintService'
import dashboardService from '../services/dashboardService'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import ImagePreviewModal from '../components/ImagePreviewModal'
import { formatDateTime, formatRelative } from '../utils/formatDate'
import { getFullImageUrl } from '../utils/imageUrl'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

const ComplaintDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [supporting, setSupporting] = useState(false)

  // Image modal state
  const [previewImage, setPreviewImage] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Staff/Admin status update state
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Admin assignment state
  const [staffUsers, setStaffUsers] = useState([])
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [assignNotes, setAssignNotes] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    loadComplaint()
    if (user?.role === 'admin') {
      dashboardService.getUsers('staff').then((res) => {
        if (res.success) setStaffUsers(res.data || [])
      }).catch(console.error)
    }
  }, [id])

  const loadComplaint = async () => {
    setLoading(true)
    try {
      const res = await complaintService.getComplaintDetails(id)
      if (res.success) {
        setComplaint(res.data)
        setNewStatus(res.data.status)
      }
    } catch (e) {
      toast.error('Failed to load complaint details')
    } finally {
      setLoading(false)
    }
  }

  // Handle support / upvote
  const handleSupport = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to support this complaint.')
      return
    }

    setSupporting(true)
    try {
      if (complaint.has_supported) {
        const res = await complaintService.unsupportComplaint(complaint.id)
        if (res.success) {
          toast.info('Support removed.')
          loadComplaint()
        }
      } else {
        const res = await complaintService.supportComplaint(complaint.id)
        if (res.success) {
          toast.success('Thank you for supporting this issue!')
          loadComplaint()
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Support action failed')
    } finally {
      setSupporting(false)
    }
  }

  // Handle additional photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const res = await complaintService.uploadComplaintPhoto(complaint.id, file)
      if (res.success) {
        toast.success('Photograph uploaded successfully!')
        loadComplaint()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  // Handle Staff or Admin status update
  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    if (!newStatus) return

    setUpdatingStatus(true)
    try {
      const res = await complaintService.updateStaffStatus(complaint.id, newStatus, remarks)
      if (res.success) {
        toast.success('Status updated successfully!')
        setRemarks('')
        loadComplaint()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Handle Admin Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!selectedStaffId) {
      toast.error('Please select a staff technician.')
      return
    }

    setAssigning(true)
    try {
      const res = await dashboardService.assignComplaint(complaint.id, selectedStaffId, assignNotes)
      if (res.success) {
        toast.success('Assigned technician successfully!')
        setAssignNotes('')
        loadComplaint()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2 small">Loading complaint #{id}...</p>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold">Complaint Not Found</h4>
        <p className="text-muted">The requested complaint #{id} does not exist or has been removed.</p>
        <button className="btn btn-primary btn-sm" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  const { priority } = complaint
  const isAssignedStaff = user?.role === 'staff' && complaint.assignment?.staff_id === user.id
  const canUpdateStatus = isAssignedStaff || user?.role === 'admin'

  return (
    <div className="container-fluid px-3 px-lg-5 py-4" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back button & Title Header */}
      <div className="mb-3">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-link text-decoration-none p-0 d-inline-flex align-items-center gap-1 text-secondary mb-2"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-secondary">Complaint #{complaint.id}</span>
              <PriorityBadge
                level={priority?.priority_level}
                score={priority?.total_priority_score}
              />
              <StatusBadge status={complaint.status} />
            </div>
            <h2 className="fw-bold text-dark mb-1">{complaint.title}</h2>
            <div className="d-flex flex-wrap gap-3 text-muted small mt-2">
              <span className="d-flex align-items-center gap-1">
                <Tag size={14} className="text-primary" /> {complaint.category_name}
              </span>
              <span className="d-flex align-items-center gap-1">
                <MapPin size={14} className="text-danger" /> {complaint.location_name}
              </span>
              <span className="d-flex align-items-center gap-1">
                <User size={14} className="text-secondary" /> {complaint.student_name}
              </span>
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} className="text-secondary" /> {formatDateTime(complaint.created_at)}
              </span>
            </div>
          </div>

          {/* Upvote / Community Support Action */}
          <div className="d-flex align-items-center gap-2">
            <button
              className={`btn d-flex align-items-center gap-2 py-2 px-3 shadow-sm ${
                complaint.has_supported ? 'btn-primary' : 'btn-outline-primary'
              }`}
              onClick={handleSupport}
              disabled={supporting}
            >
              <ThumbsUp size={16} className={complaint.has_supported ? 'fill-current' : ''} />
              <span className="fw-bold">{complaint.support_count}</span>
              <span>{complaint.has_supported ? 'Supported' : 'Support Issue'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Left Column: Description, Photos, Timeline */}
        <div className="col-lg-8">
          {/* Description Card */}
          <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
            <h5 className="fw-bold text-dark mb-2.5 fs-6">Description of Defect</h5>
            <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {complaint.description}
            </p>
          </div>

          {/* Photograph Gallery */}
          <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <Camera size={20} className="text-primary" />
                <h5 className="fw-bold text-dark mb-0 fs-6">
                  Defect Photographs ({complaint.images ? complaint.images.length : 0})
                </h5>
              </div>

              {/* Upload photo button for student owner, staff, or admin */}
              {(user?.role === 'admin' || isAssignedStaff || (user?.role === 'student' && complaint.student_id === user?.id)) && (
                <div>
                  <input
                    type="file"
                    id="addPhotoInput"
                    className="d-none"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                  <label htmlFor="addPhotoInput" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 cursor-pointer">
                    <Upload size={14} />
                    <span>{uploadingPhoto ? 'Uploading...' : 'Add Photo'}</span>
                  </label>
                </div>
              )}
            </div>

            {!complaint.images || complaint.images.length === 0 ? (
              <div className="text-center py-4 bg-light rounded text-muted small">
                No photographs were attached to this complaint.
              </div>
            ) : (
              <div className="row g-2.5">
                {complaint.images.map((img) => {
                  const resolvedUrl = getFullImageUrl(img.image_url)
                  return (
                    <div key={img.id} className="col-6 col-sm-4 col-md-3">
                      <div
                        className="border rounded overflow-hidden shadow-sm position-relative cursor-pointer"
                        style={{ height: '130px', cursor: 'pointer' }}
                        onClick={() => setPreviewImage(resolvedUrl)}
                        title="Click to view full image"
                      >
                        <img
                          src={resolvedUrl}
                          alt={img.file_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
            <div className="d-flex align-items-center gap-2 mb-3">
              <History size={20} className="text-primary" />
              <h5 className="fw-bold text-dark mb-0 fs-6">Work Order & Status Timeline</h5>
            </div>

            <div className="ps-2">
              {complaint.status_history && complaint.status_history.map((h, index) => (
                <div key={h.id || index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="d-flex justify-content-between align-items-baseline">
                    <div className="fw-bold text-dark small">
                      Status changed to <span className="text-primary text-uppercase">{h.new_status.replace('_', ' ')}</span>
                    </div>
                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      {formatRelative(h.created_at)}
                    </span>
                  </div>
                  <div className="text-muted small mt-1">
                    By <strong>{h.changed_by_name}</strong> ({h.changed_by_role})
                  </div>
                  {h.remarks && (
                    <div className="p-2 bg-light rounded mt-1.5 small text-secondary border">
                      "{h.remarks}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column: Priority Engine & Technician Assignment */}
        <div className="col-lg-4">
          {/* Priority Score Breakdown Card */}
          <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
            <div className="d-flex align-items-center gap-2 mb-2">
              <ShieldAlert size={20} className="text-danger" />
              <h5 className="fw-bold text-dark mb-0 fs-6">Rule-Based Priority Score</h5>
            </div>
            <p className="text-muted small mb-3">
              Score calculated out of 100 based on standard institutional maintenance formulas:
              <br />
              <code>P = S + A + T + C</code>
            </p>

            {/* Score Big Display */}
            <div className="p-3 rounded-3 bg-light border text-center mb-3">
              <div className="display-5 fw-bold text-primary mb-1">
                {priority?.total_priority_score} <span className="fs-6 text-muted">/ 100</span>
              </div>
              <PriorityBadge level={priority?.priority_level} showScore={false} />
            </div>

            {/* Breakdown meters */}
            <div className="d-flex flex-column gap-2.5 small">
              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Severity (S):</span>
                  <strong>{priority?.severity_score} / 40</strong>
                </div>
                <div className="priority-meter">
                  <div
                    className="priority-meter-fill bg-danger"
                    style={{ width: `${(priority?.severity_score / 40) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Affected Scope (A):</span>
                  <strong>{priority?.affected_score} / 30</strong>
                </div>
                <div className="priority-meter">
                  <div
                    className="priority-meter-fill bg-warning"
                    style={{ width: `${(priority?.affected_score / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Pending Aging Time (T):</span>
                  <strong>{priority?.pending_score} / 20</strong>
                </div>
                <div className="priority-meter">
                  <div
                    className="priority-meter-fill bg-info"
                    style={{ width: `${(priority?.pending_score / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Community Upvotes (C):</span>
                  <strong>{priority?.support_score} / 10</strong>
                </div>
                <div className="priority-meter">
                  <div
                    className="priority-meter-fill bg-success"
                    style={{ width: `${(priority?.support_score / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Assignment Box */}
          <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Wrench size={20} className="text-primary" />
              <h5 className="fw-bold text-dark mb-0 fs-6">Assigned Technician</h5>
            </div>

            {complaint.assignment ? (
              <div className="p-3 bg-light rounded border">
                <div className="fw-bold text-dark">{complaint.assignment.staff_name}</div>
                <div className="small text-muted mb-2">{complaint.assignment.staff_email}</div>
                {complaint.assignment.notes && (
                  <div className="small text-secondary border-top pt-2">
                    <strong>Admin Note:</strong> {complaint.assignment.notes}
                  </div>
                )}
                <div className="text-muted small mt-2" style={{ fontSize: '0.72rem' }}>
                  Assigned on {formatDateTime(complaint.assignment.assigned_at)}
                </div>
              </div>
            ) : (
              <div className="text-muted small p-3 bg-light rounded text-center">
                Not yet assigned to a technician.
              </div>
            )}

            {/* Admin Quick Assignment Form */}
            {user?.role === 'admin' && (
              <form onSubmit={handleAssignSubmit} className="mt-3 border-top pt-3">
                <label className="form-label small fw-semibold text-secondary">
                  {complaint.assignment ? 'Reassign Staff' : 'Assign to Staff'}
                </label>
                <select
                  className="form-select form-select-sm mb-2"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Maintenance Staff --</option>
                  {staffUsers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.department || 'Maintenance'})
                    </option>
                  ))}
                </select>
                <textarea
                  className="form-control form-control-sm mb-2"
                  rows={2}
                  placeholder="Instructions for technician..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm w-100 fw-semibold"
                  disabled={assigning}
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </form>
            )}
          </div>

          {/* Staff Work Progress Action Card */}
          {canUpdateStatus && (
            <div className="card border-0 shadow-sm p-4 mb-4 bg-white border-top border-primary border-3">
              <h5 className="fw-bold text-dark mb-2 fs-6">Update Work Status</h5>
              <p className="text-muted small mb-3">Record maintenance progress or mark ticket as resolved.</p>

              <form onSubmit={handleStatusSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">New Status</label>
                  <select
                    className="form-select form-select-sm"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Work Progress / Resolution Notes</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    placeholder="Details of parts replaced, repairs completed, or inspection notes..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1.5"
                  disabled={updatingStatus}
                >
                  <Send size={14} />
                  <span>{updatingStatus ? 'Updating...' : 'Update Status & Log'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        show={!!previewImage}
        onHide={() => setPreviewImage(null)}
        imageUrl={previewImage}
        title={`Photograph: ${complaint.title}`}
      />
    </div>
  )
}

export default ComplaintDetails
