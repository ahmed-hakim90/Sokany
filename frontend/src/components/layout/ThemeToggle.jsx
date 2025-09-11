import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: '2.5rem',
        height: '2.5rem'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'var(--bg-accent)'
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'var(--bg-secondary)'
      }}
    >
      {theme === 'light' ? (
        <Moon size={18} />
      ) : (
        <Sun size={18} />
      )}
    </button>
  )
}

export default ThemeToggle