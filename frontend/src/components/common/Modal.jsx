import React, { useEffect } from 'react'
import { X } from 'lucide-react'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  style = {}
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1000px' },
    full: { maxWidth: '95vw', height: '95vh' }
  }

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  }

  const modalStyles = {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...sizes[size],
    ...style
  }

  const headerStyles = {
    padding: '1.5rem 1.5rem 0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: title ? '1px solid var(--border-primary)' : 'none',
    marginBottom: title ? '1rem' : 0
  }

  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0
  }

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  }

  const contentStyles = {
    padding: '0 1.5rem 1.5rem 1.5rem',
    overflow: 'auto',
    flex: 1
  }

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={`modal-overlay ${className}`}
      style={overlayStyles}
      onClick={handleOverlayClick}
    >
      <div className="modal" style={modalStyles}>
        <div style={headerStyles}>
          {title && <h2 style={titleStyles}>{title}</h2>}
          {showCloseButton && (
            <button
              onClick={onClose}
              style={closeButtonStyles}
              aria-label="Close modal"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--bg-secondary)'
                e.target.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <div style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal