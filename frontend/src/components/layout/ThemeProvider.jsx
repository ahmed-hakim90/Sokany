import React, { createContext, useContext, useEffect, useState } from 'react'
import { getTheme, setTheme, initializeTheme } from '../../theme'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize theme on mount
    initializeTheme()
    const savedTheme = getTheme()
    setThemeState(savedTheme)
    setIsLoading(false)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    setThemeState(newTheme)
  }

  const value = {
    theme,
    toggleTheme,
    isLoading
  }

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}