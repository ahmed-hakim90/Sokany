import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const DashboardWidget = ({
  title,
  value,
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  color = 'primary',
  loading = false,
  onClick,
  className = '',
  style = {}
}) => {
  const colors = {
    primary: 'var(--accent-primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
    info: 'var(--info)'
  }

  const changeColors = {
    positive: 'var(--success)',
    negative: 'var(--error)',
    neutral: 'var(--text-muted)'
  }

  const changeIcons = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus
  }

  const widgetStyles = {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s ease',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    ...style
  }

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  }

  const titleStyles = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    margin: 0
  }

  const iconStyles = {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: `${colors[color]}20`,
    color: colors[color],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const valueStyles = {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1
  }

  const changeStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: changeColors[changeType],
    marginTop: '0.5rem'
  }

  const loadingStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '120px'
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleMouseEnter = (e) => {
    if (onClick) {
      e.target.style.transform = 'translateY(-2px)'
      e.target.style.boxShadow = 'var(--shadow-md)'
    }
  }

  const handleMouseLeave = (e) => {
    if (onClick) {
      e.target.style.transform = 'translateY(0)'
      e.target.style.boxShadow = 'var(--shadow-sm)'
    }
  }

  if (loading) {
    return (
      <div 
        className={`dashboard-widget loading ${className}`}
        style={{ ...widgetStyles, ...loadingStyles }}
      >
        <div className="spinner" />
      </div>
    )
  }

  const ChangeIcon = changeIcons[changeType]

  return (
    <div
      className={`dashboard-widget ${className}`}
      style={widgetStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={headerStyles}>
        <h3 style={titleStyles}>{title}</h3>
        {Icon && (
          <div style={iconStyles}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div>
        <h2 style={valueStyles}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h2>
        
        {change !== undefined && change !== null && (
          <div style={changeStyles}>
            <ChangeIcon size={14} />
            <span>
              {typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardWidget