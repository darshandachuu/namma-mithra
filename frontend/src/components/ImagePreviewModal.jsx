import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { Download, ExternalLink } from 'lucide-react'

const ImagePreviewModal = ({ show, onHide, imageUrl, title = 'Complaint Photograph' }) => {
  if (!imageUrl) return null

  // Ensure full URL if relative
  const fullUrl = imageUrl.startsWith('http') ? imageUrl : imageUrl

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-semibold text-truncate" style={{ maxWidth: '85%' }}>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0 text-center bg-dark">
        <img
          src={fullUrl}
          alt={title}
          style={{
            maxHeight: '75vh',
            maxWidth: '100%',
            objectFit: 'contain'
          }}
          className="img-fluid"
        />
      </Modal.Body>
      <Modal.Footer className="py-2 justify-content-between">
        <span className="text-muted small">CampusCare Upload Verification</span>
        <div>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-secondary btn-sm me-2"
          >
            <ExternalLink size={14} className="me-1" /> Open in New Tab
          </a>
          <Button variant="secondary" size="sm" onClick={onHide}>
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default ImagePreviewModal
