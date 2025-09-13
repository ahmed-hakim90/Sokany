import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './components/layout/ThemeProvider'
import { api } from './lib/supabase'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Requests from './pages/Requests'
import RequestDetail from './pages/RequestDetail'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Devices from './pages/Devices'
import Inventory from './pages/Inventory'
import SpareParts from './pages/SpareParts'
import Sales from './pages/Sales'
import ScrapParts from './pages/ScrapParts'
import Replacements from './pages/Replacements'
import GlobalSearch from './pages/GlobalSearch'
import ImportExport from './pages/ImportExport'
import ActivityLog from './pages/ActivityLog'
import Reports from './pages/Reports'
import Users from './pages/Users'

// Layout
import AppLayout from './components/layout/AppLayout'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        console.log('Checking user...')
        const { data, error } = await api.getCurrentUser()
        console.log('Auth response:', { data, error })
        
        if (data?.user) {
          console.log('User found, getting profile...')
          // Get user profile
          const { data: profile, error: profileError } = await api.getCurrentUserProfile()
          console.log('Profile response:', { profile, profileError })
          
          if (profileError) {
            console.error('Error getting user profile:', profileError)
            // If profile doesn't exist, user might need to complete setup
            setUser(null)
          } else {
            setUser(profile)
          }
        } else {
          console.log('No user found')
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const authStateChange = api.supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', { event, session })
        if (session?.user) {
          const { data: profile, error: profileError } = await api.getCurrentUserProfile()
          if (profileError) {
            console.error('Error getting user profile:', profileError)
            setUser(null)
          } else {
            setUser(profile)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      if (authStateChange?.data?.subscription) {
        authStateChange.data.subscription.unsubscribe()
      }
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await api.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <ThemeProvider>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}>
          <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              },
            }}
          />
          
          <Routes>
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />
              } 
            />
            
            <Route
              path="/*"
              element={
                user ? (
                  <AppLayout user={user} onSignOut={handleSignOut}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/requests" element={<Requests />} />
                      <Route path="/requests/:id" element={<RequestDetail />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/:id" element={<CustomerDetail />} />
                      <Route path="/devices" element={<Devices />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/spare-parts" element={<SpareParts />} />
                      <Route path="/sales" element={<Sales />} />
                      <Route path="/scrap-parts" element={<ScrapParts />} />
                      <Route path="/replacements" element={<Replacements />} />
                      <Route path="/search" element={<GlobalSearch />} />
                      <Route path="/import-export" element={<ImportExport />} />
                      <Route path="/activity-log" element={<ActivityLog />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AppLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App