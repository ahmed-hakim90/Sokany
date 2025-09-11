import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Wrench, 
  Package, 
  Users, 
  ShoppingCart, 
  FileText, 
  Search, 
  Upload, 
  Download,
  Trash2,
  RefreshCw,
  Activity,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useTheme } from './ThemeProvider'

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation()
  const { theme } = useTheme()

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: Home,
      exact: true
    },
    {
      label: 'Maintenance Requests',
      path: '/requests',
      icon: Wrench
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: Package
    },
    {
      label: 'Spare Parts',
      path: '/spare-parts',
      icon: Package
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: Users
    },
    {
      label: 'Sales',
      path: '/sales',
      icon: ShoppingCart
    },
    {
      label: 'Scrap Parts',
      path: '/scrap-parts',
      icon: Trash2
    },
    {
      label: 'Device Replacements',
      path: '/replacements',
      icon: RefreshCw
    },
    {
      label: 'Global Search',
      path: '/search',
      icon: Search
    },
    {
      label: 'Import/Export',
      path: '/import-export',
      icon: Upload
    },
    {
      label: 'Activity Log',
      path: '/activity-log',
      icon: Activity
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: BarChart3
    },
    {
      label: 'Users',
      path: '/users',
      icon: Users
    }
  ]

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div
      style={{
        width: isCollapsed ? '4rem' : '16rem',
        height: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}
      >
        {!isCollapsed && (
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              margin: 0
            }}
          >
            MMS
          </h1>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: '1rem 0',
          overflowY: 'auto'
        }}
      >
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path, item.exact)
            
            return (
              <li key={item.path} style={{ marginBottom: '0.25rem' }}>
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    backgroundColor: active ? 'var(--bg-accent)' : 'transparent',
                    borderRight: active ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem',
                    fontWeight: active ? '500' : '400'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.target.style.backgroundColor = 'var(--bg-accent)'
                      e.target.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  <Icon 
                    size={20} 
                    style={{ 
                      marginRight: isCollapsed ? 0 : '0.75rem',
                      flexShrink: 0
                    }} 
                  />
                  {!isCollapsed && (
                    <span style={{ whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-primary)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}
        >
          MMS v3.0
        </div>
      )}
    </div>
  )
}

export default Sidebar