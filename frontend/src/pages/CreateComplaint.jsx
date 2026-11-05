import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import complaintService from '../services/complaintService'
import DuplicateSuggestions from '../components/DuplicateSuggestions'
import { toast } from 'react-toastify'

const CreateComplaint = () => {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [loadingInitial, setLoadingInitial] = useState(true)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [severityScore, setSeverityScore] = useState(25) // 0 - 40
  const [affectedScore, setAffectedScore] = useState(15) // 0 - 30

  // Photographs states
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])

  // Duplicate suggestions state
  const [suggestions, setSuggestions] = useState([])
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [supportingExistingId, setSupportingExistingId] = useState(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          complaintService.getCategories(),
          complaintService.getLocations()
        ])
        if (catRes.success) setCategories(catRes.data || [])
        if (locRes.success) setLocations(locRes.data || [])
      } catch (e) {
        toast.error('Failed to load form options')
      } finally {
        setLoadingInitial(false)
      }
    }
    fetchOptions()
  }, [])

  // Check for similar active complaints whenever category or location changes
  useEffect(() => {
    if (!categoryId && !locationId) {
      setSuggestions([])
      return
    }

    const checkSimilar = async () => {
      setCheckingDuplicates(true)
      try {
        const res = await complaintService.getDuplicateSuggestions(categoryId, locationId)
        if (res.success) {
          setSuggestions(res.data || [])
        }
      } catch (e) {
        // Silent fail
      } finally {
        setCheckingDuplicates(false)
      }
    }

    const timer = setTimeout(checkSimilar, 350)
    return () => clearTimeout(timer)
  }, [categoryId, locationId])

  // Handle Photo selection with validations
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5 MB

    const validFiles = []
    const newPreviews = []

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`"${file.name}" is not a valid format. Only JPG, JPEG, PNG, WEBP are allowed.`)
        continue
      }
      if (file.size > maxSize) {
        toast.error(`"${file.name}" exceeds 5MB size limit.`)
        continue
      }

      validFiles.push(file)
      newPreviews.push({
        name: file.name,
        url: URL.createObjectURL(file)
      })
    }

    setSelectedFiles((prev) => [...prev, ...validFiles])
    setPreviewUrls((prev) => [...prev, ...newPreviews])
    e.target.value = ''
  }

  const handleRemoveImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  // Handle Supporting an existing issue instead of submitting a new one
  const handleSupportExisting = async (existingId) => {
    setSupportingExistingId(existingId)
    try {
      const res = await complaintService.supportComplaint(existingId)
      if (res.success) {
        toast.success('Thank you! You supported this complaint. You will be redirected.')
        navigate(`/complaints/${existingId}`)
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not support complaint')
    } finally {
      setSupportingExistingId(null)
    }
  }

  // Estimated rule-based priority score: P = S + A + T + C
  const estimatedPriority = severityScore + affectedScore // T=0, C=0 for new
  const estimatedLevel =
    estimatedPriority >= 80 ? 'Critical' : estimatedPriority >= 60 ? 'High' : estimatedPriority >= 35 ? 'Medium' : 'Low'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title.')
      return
    }
    if (!description.trim()) {
      toast.error('Please provide a description.')
      return
    }
    if (!categoryId) {
      toast.error('Please select a category.')
      return
    }
    if (!locationId) {
      toast.error('Please select a location.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('category_id', categoryId)
      formData.append('location_id', locationId)
      formData.append('severity_score', severityScore)
      formData.append('affected_score', affectedScore)

      // Append photograph files
      selectedFiles.forEach((file) => {
        formData.append('images', file)
      })

      const res = await complaintService.createComplaint(formData)
      if (res.success) {
        toast.success('Complaint submitted successfully!')
        navigate(`/complaints/${res.data.id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please check form data.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingInitial) {
    return (
      <div className="dashboard-page-content text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-page-content" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Submit Campus Complaint</h2>
        <p className="text-muted small mb-0">
          Report maintenance defects, broken lab equipment, electrical hazards, or facility repairs.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
          <h5 className="fw-bold text-dark mb-3 fs-6">1. Complaint Details</h5>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Complaint Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Overhead projector flickering continuously in Seminar Hall 204"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Facility Category *</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                  const cat = categories.find((c) => c.id === parseInt(e.target.value))
                  if (cat) setSeverityScore(cat.default_severity)
                }}
                required
              >
                <option value="">-- Choose Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (Default Severity: {cat.default_severity}/40)
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Campus Location *</label>
              <select
                className="form-select"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                required
              >
                <option value="">-- Choose Location --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Similar / Duplicate Complaints Drawer */}
          {checkingDuplicates ? (
            <div className="small text-muted py-2 mb-3">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Checking for existing complaints in this area...
            </div>
          ) : (
            <DuplicateSuggestions
              suggestions={suggestions}
              onSupportExisting={handleSupportExisting}
              isSupporting={supportingExistingId !== null}
            />
          )}

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Detailed Description *</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Describe the issue, specific workstation or equipment number, observed danger, or when it started..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Priority Calculation Form Section */}
        <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0 fs-6">2. Priority Estimation (Rule-Based Algorithm)</h5>
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 fw-semibold">
              Estimated Score: {estimatedPriority}/100 [{estimatedLevel}]
            </span>
          </div>

          <p className="text-muted small mb-3">
            Priority is calculated using formula: <strong>P = S (Severity: 40) + A (Affected Users: 30) + T (Pending: 20) + C (Community Support: 10)</strong>.
          </p>

          <div className="row g-4 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary d-flex justify-content-between">
                <span>Severity Level (Safety / Defect Extent):</span>
                <strong>{severityScore} / 40 marks</strong>
              </label>
              <input
                type="range"
                className="form-range"
                min="5"
                max="40"
                step="5"
                value={severityScore}
                onChange={(e) => setSeverityScore(parseInt(e.target.value))}
              />
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                <span>Minor (10)</span>
                <span>Normal (20)</span>
                <span>Substantial (30)</span>
                <span className="text-danger fw-bold">Hazardous (40)</span>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary d-flex justify-content-between">
                <span>Affected Users Scope:</span>
                <strong>{affectedScore} / 30 marks</strong>
              </label>
              <input
                type="range"
                className="form-range"
                min="5"
                max="30"
                step="5"
                value={affectedScore}
                onChange={(e) => setAffectedScore(parseInt(e.target.value))}
              />
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                <span>Individual (10)</span>
                <span>Room / Lab (20)</span>
                <span className="text-danger fw-bold">Entire Wing / Block (30)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
          <h5 className="fw-bold text-dark mb-2 fs-6">3. Upload Defect Photographs</h5>
          <p className="text-muted small mb-3">
            Attach clear photos of the physical issue (JPG, JPEG, PNG, WEBP, max 5MB each). Preview will show below.
          </p>

          <div className="border border-2 border-dashed rounded-3 p-4 text-center bg-light mb-3">
            <UploadCloud size={36} className="text-primary mb-2" />
            <div className="fw-semibold text-dark small mb-1">Click to select photos or drag & drop</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              Supports JPG, JPEG, PNG, WEBP (Up to 5MB)
            </div>
            <input
              type="file"
              className="form-control d-none"
              id="photoUploadInput"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="photoUploadInput" className="btn btn-outline-primary btn-sm mt-3">
              Browse Photographs
            </label>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div>
              <div className="fw-semibold small text-secondary mb-2">Selected Photographs ({previewUrls.length}):</div>
              <div className="image-preview-grid">
                {previewUrls.map((p, index) => (
                  <div key={index} className="image-preview-item shadow-sm">
                    <img src={p.url} alt={p.name} />
                    <button
                      type="button"
                      className="image-preview-remove"
                      onClick={() => handleRemoveImage(index)}
                      title="Remove photograph"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="d-flex justify-content-end gap-2 mb-5">
          <button
            type="button"
            className="btn btn-outline-secondary px-4 py-2"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary px-5 py-2 fw-bold d-flex align-items-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Submitting Complaint...</span>
              </>
            ) : (
              <>
                <span>Submit Complaint</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateComplaint
