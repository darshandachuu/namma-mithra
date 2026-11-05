import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, User, LogOut, PlusCircle, Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import dashboardService from '../services/dashboardService'
import { formatRelative } from '../utils/formatDate'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifMenu, setShowNotifMenu] = useState(false)

  // Fetch notifications if authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    const loadNotifications = async () => {
      try {
        const countRes = await dashboardService.getUnreadCount()
        if (countRes.success) {
          setUnreadCount(countRes.data.unread_count || 0)
        }
      } catch (e) {
        // Silent fail
      }
    }

    loadNotifications()
    const timer = setInterval(loadNotifications, 30000)
    return () => clearInterval(timer)
  }, [isAuthenticated])

  const handleOpenNotifications = async () => {
    setShowNotifMenu(!showNotifMenu)
    if (!showNotifMenu) {
      try {
        const notifRes = await dashboardService.getNotifications()
        if (notifRes.success) {
          setNotifications(notifRes.data || [])
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await dashboardService.markAllNotificationsRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getDashboardPath = () => {
    if (!user) return '/'
    if (user.role === 'admin') return '/admin'
    if (user.role === 'staff') return '/staff'
    return '/student'
  }

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top shadow px-3 py-2"
      style={{
        background: 'linear-gradient(90deg, #450a0a 0%, #7f1d1d 40%, #991b1b 100%)',
        borderBottom: '2px solid #f59e0b'
      }}
    >
      <div className="container-fluid">
        {/* Brand with Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2.5 text-white fw-bold text-decoration-none" to={getDashboardPath()}>
          <div className="bg-white rounded-3 p-1 d-flex align-items-center justify-content-center shadow-sm">
            <img src="/logo.png" alt="Namma Mithra" className="brand-logo-img" />
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="brand-title-kan">ನಮ್ಮ ಮಿತ್ರ</span>
            <span className="text-white-50">|</span>
            <span className="brand-title-eng">Namma Mithra</span>
          </div>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          {/* Left links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center ms-lg-3">
            <li className="nav-item">
              <Link className="nav-link text-white-50 hover-text-white fw-medium" to="/">
                Campus Live Feed
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link text-white-50 hover-text-white fw-medium" to={getDashboardPath()}>
                  My Dashboard
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'student' && (
              <li className="nav-item">
                <Link className="nav-link text-white-50 hover-text-white fw-medium" to="/student/complaints">
                  My Complaints
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white-50 hover-text-white fw-medium" to="/admin/reports">
                    Reports & Analytics
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white-50 hover-text-white fw-medium" to="/admin/users">
                    Manage Users
                  </Link>
                </li>
              </>
            )}
            {isAuthenticated && user?.role === 'staff' && (
              <li className="nav-item">
                <Link className="nav-link text-white-50 hover-text-white fw-medium" to="/staff/tasks">
                  Assigned Work Orders
                </Link>
              </li>
            )}
          </ul>

          {/* Right action controls */}
          <div className="d-flex align-items-center gap-2.5">
            {/* New Complaint Button */}
            {(!isAuthenticated || user?.role === 'student') && (
              <Link to="/submit" className="btn btn-gold btn-sm d-flex align-items-center gap-1.5 shadow-sm text-dark fw-bold">
                <PlusCircle size={15} />
                <span>Submit Complaint</span>
              </Link>
            )}

            {/* Authenticated Controls */}
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="position-relative">
                  <button
                    className="btn btn-outline-light btn-sm text-white position-relative border-0 p-2 rounded-circle"
                    onClick={handleOpenNotifications}
                    title="Notifications"
                    type="button"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark fw-bold" style={{ fontSize: '0.68rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications popup dropdown */}
                  {showNotifMenu && (
                    <div
                      className="card position-absolute end-0 mt-2 shadow-lg border-0 bg-white"
                      style={{ width: '330px', zIndex: 1050, top: '100%', maxHeight: '400px', overflowY: 'auto' }}
                    >
                      <div className="card-header bg-light d-flex justify-content-between align-items-center py-2 px-3">
                        <span className="fw-bold small text-dark">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            className="btn btn-link btn-sm p-0 text-decoration-none text-danger small fw-semibold"
                            onClick={handleMarkAllRead}
                          >
                            <Check size={12} className="me-1" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="list-group list-group-flush">
                        {notifications.length === 0 ? (
                          <div className="p-3 text-center text-muted small">No notifications yet.</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`list-group-item p-2.5 ${n.is_read ? 'bg-white' : 'bg-danger bg-opacity-10'}`}
                            >
                              <div className="fw-semibold small text-dark">{n.title}</div>
                              <div className="text-muted small" style={{ fontSize: '0.8rem' }}>{n.message}</div>
                              <div className="text-muted text-end mt-1" style={{ fontSize: '0.7rem' }}>
                                {formatRelative(n.created_at)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu / Role pill */}
                <div className="d-flex align-items-center gap-2 border-start ps-2.5 border-danger border-opacity-50">
                  <div className="text-end d-none d-md-block">
                    <div className="text-white fw-bold small" style={{ lineHeight: '1.2' }}>{user.full_name}</div>
                    <span className="badge bg-warning text-dark text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    className="btn btn-outline-light btn-sm p-1.5 rounded-circle border-0"
                    onClick={handleLogout}
                    title="Sign Out"
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm fw-semibold">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-gold btn-sm text-dark fw-bold">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
