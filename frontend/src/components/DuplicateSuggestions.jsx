import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ThumbsUp, CheckCircle, ExternalLink } from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

const DuplicateSuggestions = ({ suggestions, onSupportExisting, isSupporting }) => {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className="card border-warning bg-warning bg-opacity-10 mb-4 shadow-sm">
      <div className="card-body p-3.5">
        <div className="d-flex align-items-center gap-2 mb-2">
          <AlertCircle className="text-warning flex-shrink-0" size={20} />
          <h6 className="card-title mb-0 fw-bold text-dark">
            Existing Open Complaints In This Area ({suggestions.length})
          </h6>
        </div>
        <p className="small text-muted mb-3">
          We found open issues for this category or location. If your issue is already described below, supporting it will increase its priority and avoid duplicate tickets!
        </p>

        <div className="d-flex flex-column gap-2.5">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white rounded border d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2.5"
            >
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-secondary text-white small" style={{ fontSize: '0.7rem' }}>
                    {item.match_type}
                  </span>
                  <PriorityBadge level={item.priority?.priority_level} score={item.priority?.total_priority_score} />
                  <StatusBadge status={item.status} />
                </div>
                <h6 className="mb-1 fw-bold text-dark">
                  #{item.id} - {item.title}
                </h6>
                <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '450px' }}>
                  {item.description}
                </p>
                <div className="text-muted small mt-1">
                  <em>{item.location_name} • {item.support_count} students supported</em>
                </div>
              </div>

              <div className="d-flex gap-2 flex-shrink-0 align-self-end align-self-md-center">
                <Link
                  to={`/complaints/${item.id}`}
                  target="_blank"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                >
                  <ExternalLink size={13} /> View
                </Link>
                <button
                  type="button"
                  className={`btn btn-sm d-flex align-items-center gap-1 ${
                    item.has_supported ? 'btn-success' : 'btn-primary'
                  }`}
                  onClick={() => onSupportExisting && onSupportExisting(item.id)}
                  disabled={isSupporting || item.has_supported}
                >
                  {item.has_supported ? (
                    <>
                      <CheckCircle size={14} /> Supported!
                    </>
                  ) : (
                    <>
                      <ThumbsUp size={14} /> Support Instead (+1)
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DuplicateSuggestions
