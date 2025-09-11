import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  style = {},
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontWeight: '500',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    fontFamily: 'inherit',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.6 : 1,
    ...style
  }

  const variants = {
    primary: {
      backgroundColor: 'var(--accent-primary)',
      color: 'white',
      '&:hover': {
        backgroundColor: 'var(--accent-hover)'
      }
    },
    secondary: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-primary)',
      '&:hover': {
        backgroundColor: 'var(--bg-accent)'
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--accent-primary)',
      border: '1px solid var(--accent-primary)',
      '&:hover': {
        backgroundColor: 'var(--accent-primary)',
        color: 'white'
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      '&:hover': {
        backgroundColor: 'var(--bg-secondary)'
      }
    },
    danger: {
      backgroundColor: 'var(--error)',
      color: 'white',
      '&:hover': {
        backgroundColor: '#dc2626'
      }
    },
    success: {
      backgroundColor: 'var(--success)',
      color: 'white',
      '&:hover': {
        backgroundColor: '#059669'
      }
    },
    warning: {
      backgroundColor: 'var(--warning)',
      color: 'white',
      '&:hover': {
        backgroundColor: '#d97706'
      }
    }
  }

  const sizes = {
    xs: {
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem',
      height: '1.75rem'
    },
    sm: {
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      height: '2rem'
    },
    md: {
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      height: '2.5rem'
    },
    lg: {
      padding: '0.875rem 1.5rem',
      fontSize: '1rem',
      height: '3rem'
    },
    xl: {
      padding: '1rem 2rem',
      fontSize: '1.125rem',
      height: '3.5rem'
    }
  }

  const buttonStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size]
  }

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    if (onClick) {
      onClick(e)
    }
  }

  const renderIcon = () => {
    if (!icon) return null
    
    const iconElement = React.cloneElement(icon, {
      size: size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 18 : size === 'xl' ? 20 : 16
    })

    return iconElement
  }

  return (
    <button
      type={type}
      className={`button button-${variant} button-${size} ${className}`}
      style={buttonStyles}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="spinner" style={{ marginRight: children ? '0.5rem' : 0 }} />
      )}
      
      {icon && iconPosition === 'left' && renderIcon()}
      
      {children && (
        <span>{children}</span>
      )}
      
      {icon && iconPosition === 'right' && renderIcon()}
    </button>
  )
}

export default Button