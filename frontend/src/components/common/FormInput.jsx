import React, { forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const FormInput = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  className = '',
  style = {},
  showPasswordToggle = false,
  icon = null,
  iconPosition = 'left',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%'
  }

  const labelStyles = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  }

  const inputContainerStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  }

  const inputStyles = {
    width: '100%',
    padding: icon && iconPosition === 'left' ? '0.75rem 0.75rem 0.75rem 2.5rem' : 
            showPasswordToggle || (icon && iconPosition === 'right') ? '0.75rem 2.5rem 0.75rem 0.75rem' :
            '0.75rem',
    border: `1px solid ${error ? 'var(--error)' : isFocused ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    backgroundColor: disabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
    color: 'var(--text-primary)',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'inherit',
    ...style
  }

  const iconStyles = {
    position: 'absolute',
    left: iconPosition === 'left' ? '0.75rem' : 'auto',
    right: iconPosition === 'right' ? '0.75rem' : 'auto',
    color: 'var(--text-muted)',
    zIndex: 1
  }

  const passwordToggleStyles = {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  }

  const errorStyles = {
    fontSize: '0.75rem',
    color: 'var(--error)',
    marginTop: '0.25rem'
  }

  const helperTextStyles = {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem'
  }

  const handleFocus = (e) => {
    setIsFocused(true)
    if (onFocus) {
      onFocus(e)
    }
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    if (onBlur) {
      onBlur(e)
    }
  }

  return (
    <div className={`form-input ${className}`} style={containerStyles}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}
      
      <div style={inputContainerStyles}>
        {icon && iconPosition === 'left' && (
          <div style={iconStyles}>
            {React.cloneElement(icon, { size: 16 })}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          style={inputStyles}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div style={iconStyles}>
            {React.cloneElement(icon, { size: 16 })}
          </div>
        )}
        
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={passwordToggleStyles}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      
      {error && (
        <div style={errorStyles}>
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div style={helperTextStyles}>
          {helperText}
        </div>
      )}
    </div>
  )
})

FormInput.displayName = 'FormInput'

export default FormInput