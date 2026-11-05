import React from 'react'
import { PRIORITY_CONFIG } from '../utils/constants'

const PriorityBadge = ({ level, score, showScore = true }) => {
  const config = PRIORITY_CONFIG[level] || PRIORITY_CONFIG['Medium']

  return (
    <span
      className={`badge px-2.5 py-1.5 rounded-pill ${config.badgeClass}`}
      style={{
        fontWeight: 600,
        fontSize: '0.8rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}
      title={`Rule-based Score: ${score || 'N/A'}/100`}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: config.color
        }}
      />
      <span>{level || 'Normal'}</span>
      {showScore && score !== undefined && (
        <span
          className="badge bg-white text-dark ms-1 shadow-sm"
          style={{ fontSize: '0.72rem', padding: '2px 5px', borderRadius: '4px' }}
        >
          {score} pts
        </span>
      )}
    </span>
  )
}

export default PriorityBadge
