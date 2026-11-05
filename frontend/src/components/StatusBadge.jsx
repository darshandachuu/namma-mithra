import React from 'react'
import { STATUS_CONFIG } from '../utils/constants'

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status ? status.replace('_', ' ').toUpperCase() : 'UNKNOWN',
    bg: '#f1f5f9',
    color: '#475569'
  }

  return (
    <span
      className="badge px-2.5 py-1.5 rounded-pill font-monospace"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.8rem',
        border: `1px solid ${config.color}33`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color
        }}
      />
      {config.label}
    </span>
  )
}

export default StatusBadge
