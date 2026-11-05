import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-white border-top py-3 mt-auto shadow-sm">
      <div className="container-fluid px-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-muted">
        <div className="d-flex align-items-center gap-2">
          <img src="/logo.png" alt="Namma Mithra" style={{ height: '26px', width: 'auto' }} />
          <span className="fw-bold text-dark">ನಮ್ಮ ಮಿತ್ರ (Namma Mithra)</span>
        </div>
        <div>
          <span>MCA Final Year Project</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
