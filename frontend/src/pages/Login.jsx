import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import FormInput from '../components/common/FormInput'
import toast from 'react-hot-toast'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await api.signIn(formData.email, formData.password)
      
      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        // Get user profile
        const { data: profile } = await api.getCurrentUserProfile()
        onLogin(profile)
        toast.success('Welcome back!')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-primary)',
    padding: '1rem'
  }

  const cardStyles = {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-xl)',
    padding: '2rem',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-primary)'
  }

  const headerStyles = {
    textAlign: 'center',
    marginBottom: '2rem'
  }

  const titleStyles = {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem 0'
  }

  const subtitleStyles = {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    margin: 0
  }

  const formStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  }

  const footerStyles = {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '0.875rem',
    color: 'var(--text-muted)'
  }

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>MMS</h1>
          <p style={subtitleStyles}>Maintenance Management System</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyles}>
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            icon={<Mail size={16} />}
            iconPosition="left"
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            showPasswordToggle
            icon={<Lock size={16} />}
            iconPosition="left"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!formData.email || !formData.password}
          >
            Sign In
          </Button>
        </form>

        <div style={footerStyles}>
          <p>Version 3.0 with Service-Only Support</p>
        </div>
      </div>
    </div>
  )
}

export default Login