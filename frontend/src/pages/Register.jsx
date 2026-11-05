import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, User, Mail, Lock, Phone, GraduationCap, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: 'Computer Applications (MCA)',
    phone: '',
    password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match!')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        department: formData.department,
        phone: formData.phone,
        password: formData.password,
        role: 'student'
      }
      const res = await register(payload)
      toast.success(res.message || 'Account created successfully!')
      navigate('/student')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="card border-0 shadow-lg p-4 p-md-5" style={{ maxWidth: '520px', width: '100%', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <div className="bg-light border rounded-3 p-2 mb-2.5 d-inline-block shadow-sm">
            <img src="/logo.png" alt="Namma Mithra" style={{ height: '76px', width: 'auto' }} />
          </div>
          <h4 className="fw-bold text-dark mb-1">ನಮ್ಮ ಮಿತ್ರ (Namma Mithra)</h4>
          <p className="text-muted small mb-0">Student Registration</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <User size={16} className="text-muted" />
              </span>
              <input
                type="text"
                name="full_name"
                className="form-control bg-light border-start-0"
                placeholder="e.g. John Doe"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Campus Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Mail size={16} className="text-muted" />
              </span>
              <input
                type="email"
                name="email"
                className="form-control bg-light border-start-0"
                placeholder="e.g. john.doe@campuscare.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row g-2.5 mb-3">
            <div className="col-md-7">
              <label className="form-label small fw-semibold text-secondary">Department / Course</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <GraduationCap size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  name="department"
                  className="form-control bg-light border-start-0"
                  placeholder="e.g. MCA, Computer Science"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-5">
              <label className="form-label small fw-semibold text-secondary">Mobile Phone</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Phone size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  name="phone"
                  className="form-control bg-light border-start-0"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="row g-2.5 mb-4">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control bg-light border-start-0"
                  placeholder="At least 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  name="confirm_password"
                  className="form-control bg-light border-start-0"
                  placeholder="Re-enter password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="text-center small text-muted">
          Already registered?{' '}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
