import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const res = await login(email, password)
      toast.success(res.message || 'Logged in successfully!')
      const userRole = res.data?.user?.role
      if (userRole === 'admin') navigate('/admin')
      else if (userRole === 'staff') navigate('/staff')
      else navigate('/student')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Quick fill demo credentials
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="card border-0 shadow-lg p-4 p-md-5" style={{ maxWidth: '480px', width: '100%', borderRadius: '16px' }}>
        <div className="text-center mb-4">
          <div className="bg-light border rounded-3 p-2 mb-2.5 d-inline-block shadow-sm">
            <img src="/logo.png" alt="Namma Mithra" style={{ height: '76px', width: 'auto' }} />
          </div>
          <h4 className="fw-bold text-dark mb-1">ನಮ್ಮ ಮಿತ್ರ (Namma Mithra)</h4>
          <p className="text-muted small mb-0">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Campus Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Mail size={16} className="text-muted" />
              </span>
              <input
                type="email"
                className="form-control bg-light border-start-0"
                placeholder="e.g. student@campuscare.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Lock size={16} className="text-muted" />
              </span>
              <input
                type="password"
                className="form-control bg-light border-start-0"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Box */}
        <div className="bg-light p-3 rounded-3 border mb-3">
          <div className="d-flex align-items-center gap-1.5 mb-2 text-dark small fw-bold">
            <UserCheck size={16} className="text-primary" />
            <span>Instant Demo Logins (Click to autofill)</span>
          </div>
          <div className="d-flex flex-column gap-1.5">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm text-start py-1 px-2.5 d-flex justify-content-between align-items-center"
              onClick={() => fillCredentials('student@campuscare.edu', 'password123')}
            >
              <span>Student: <strong>student@campuscare.edu</strong></span>
              <span className="badge bg-primary text-white">Student</span>
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm text-start py-1 px-2.5 d-flex justify-content-between align-items-center"
              onClick={() => fillCredentials('staff@campuscare.edu', 'password123')}
            >
              <span>Staff: <strong>staff@campuscare.edu</strong></span>
              <span className="badge bg-secondary text-white">Staff</span>
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm text-start py-1 px-2.5 d-flex justify-content-between align-items-center"
              onClick={() => fillCredentials('admin@campuscare.edu', 'password123')}
            >
              <span>Admin: <strong>admin@campuscare.edu</strong></span>
              <span className="badge bg-danger text-white">Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center small text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary fw-semibold text-decoration-none">
            Create Student Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
