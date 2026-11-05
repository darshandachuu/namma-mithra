import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  CheckSquare,
  Users,
  FolderTree,
  MapPin,
  BarChart3,
  Globe,
  Settings
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const Sidebar = () => {
  const { user } = useAuth()
  if (!user) return null

  const navLinkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded text-decoration-none fw-medium mb-1 transition-all ${
      isActive
        ? 'bg-primary text-white shadow-sm'
        : 'text-secondary hover-bg-light hover-text-dark'
    }`

  return (
    <div className="sidebar shadow-sm">
      <div className="d-flex align-items-center gap-2.5 mb-3 pb-3 border-bottom px-2">
        <img src="/logo.png" alt="Namma Mithra" style={{ height: '38px', width: 'auto' }} />
        <div className="fw-bold text-dark fs-6">Namma Mithra</div>
      </div>
      <div className="mb-2 px-2">
        <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
          {user.role} Navigation
        </span>
      </div>

      <nav className="nav flex-column flex-grow-1">
        {/* Student Links */}
        {user.role === 'student' && (
          <>
            <NavLink to="/student" end className={navLinkClass}>
              <LayoutDashboard size={18} />
              <span>Student Overview</span>
            </NavLink>
            <NavLink to="/submit" className={navLinkClass}>
              <PlusCircle size={18} />
              <span>Submit Complaint</span>
            </NavLink>
            <NavLink to="/student/complaints" className={navLinkClass}>
              <FileText size={18} />
              <span>My Complaints</span>
            </NavLink>
            <NavLink to="/" end className={navLinkClass}>
              <Globe size={18} />
              <span>Campus Public Feed</span>
            </NavLink>
          </>
        )}

        {/* Staff Links */}
        {user.role === 'staff' && (
          <>
            <NavLink to="/staff" end className={navLinkClass}>
              <LayoutDashboard size={18} />
              <span>Staff Overview</span>
            </NavLink>
            <NavLink to="/staff/tasks" className={navLinkClass}>
              <CheckSquare size={18} />
              <span>Assigned Work Orders</span>
            </NavLink>
            <NavLink to="/" end className={navLinkClass}>
              <Globe size={18} />
              <span>All Campus Issues</span>
            </NavLink>
          </>
        )}

        {/* Admin Links */}
        {user.role === 'admin' && (
          <>
            <NavLink to="/admin" end className={navLinkClass}>
              <LayoutDashboard size={18} />
              <span>Admin Overview</span>
            </NavLink>
            <NavLink to="/admin/complaints" className={navLinkClass}>
              <FileText size={18} />
              <span>All Complaints</span>
            </NavLink>
            <NavLink to="/admin/reports" className={navLinkClass}>
              <BarChart3 size={18} />
              <span>Reports & Analytics</span>
            </NavLink>
            <NavLink to="/admin/users" className={navLinkClass}>
              <Users size={18} />
              <span>Manage Users</span>
            </NavLink>
            <NavLink to="/admin/categories" className={navLinkClass}>
              <FolderTree size={18} />
              <span>Manage Categories</span>
            </NavLink>
            <NavLink to="/admin/locations" className={navLinkClass}>
              <MapPin size={18} />
              <span>Manage Locations</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User profile footer card */}
      <div className="pt-3 border-top mt-auto px-2">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px' }}>
            {user.full_name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="fw-semibold text-truncate small">{user.full_name}</div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{user.department || user.role}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
