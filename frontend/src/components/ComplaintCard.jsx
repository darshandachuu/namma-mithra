import React from 'react'
import { Link } from 'react-router-dom'
import { ThumbsUp, MapPin, Tag, Calendar, Camera, ArrowRight } from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import { formatRelative } from '../utils/formatDate'
import { getFullImageUrl } from '../utils/imageUrl'

const ComplaintCard = ({ complaint, onSupport, isSupporting = false }) => {
  const {
    id,
    title,
    description,
    category_name,
    location_name,
    status,
    priority,
    support_count = 0,
    has_supported = false,
    images = [],
    created_at
  } = complaint

  const thumbnail = images && images.length > 0 ? getFullImageUrl(images[0].image_url) : null

  return (
    <div className="card h-100 border-0 shadow-sm overflow-hidden">
      <div className="card-body p-3.5 d-flex flex-column">
        {/* Header badges */}
        <div className="d-flex justify-content-between align-items-center mb-2.5">
          <PriorityBadge
            level={priority?.priority_level}
            score={priority?.total_priority_score}
          />
          <StatusBadge status={status} />
        </div>

        {/* Title */}
        <h5 className="card-title fw-bold text-dark mb-1.5" style={{ fontSize: '1.05rem', lineHeight: '1.35' }}>
          <Link to={`/complaints/${id}`} className="text-decoration-none text-dark hover-primary">
            #{id} - {title}
          </Link>
        </h5>

        {/* Metadata info pills */}
        <div className="d-flex flex-wrap gap-2 text-muted small my-2">
          <span className="d-inline-flex align-items-center" title="Category">
            <Tag size={13} className="me-1 text-primary" />
            <strong className="text-secondary">{category_name}</strong>
          </span>
          <span className="text-muted">•</span>
          <span className="d-inline-flex align-items-center text-truncate" style={{ maxWidth: '200px' }} title="Location">
            <MapPin size={13} className="me-1 text-danger" />
            {location_name}
          </span>
        </div>

        {/* Description snippet */}
        <p className="card-text text-muted small flex-grow-1 mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description}
        </p>

        {/* Thumbnail preview if exists */}
        {thumbnail && (
          <div className="mb-3 position-relative rounded overflow-hidden" style={{ height: '110px', background: '#00000010' }}>
            <img
              src={thumbnail}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {images.length > 1 && (
              <span className="position-absolute bottom-0 end-0 bg-dark text-white px-2 py-0.5 rounded-top-start small" style={{ fontSize: '0.7rem' }}>
                <Camera size={11} className="me-1" />+{images.length - 1} photos
              </span>
            )}
          </div>
        )}

        {/* Footer controls: Support and Details */}
        <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
          <button
            className={`btn btn-sm d-inline-flex align-items-center gap-1.5 ${
              has_supported
                ? 'btn-primary'
                : 'btn-outline-primary'
            }`}
            onClick={() => onSupport && onSupport(id)}
            disabled={isSupporting}
            title={has_supported ? 'You supported this complaint' : 'Click to support this issue'}
          >
            <ThumbsUp size={14} className={has_supported ? 'fill-current' : ''} />
            <span className="fw-semibold">{support_count}</span>
            <span className="d-none d-sm-inline">{has_supported ? 'Supported' : 'Support'}</span>
          </button>

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small" title={created_at}>
              {formatRelative(created_at)}
            </span>
            <Link to={`/complaints/${id}`} className="btn btn-outline-secondary btn-sm p-1.5" title="View Details">
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplaintCard
