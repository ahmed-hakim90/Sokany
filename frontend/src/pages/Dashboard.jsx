import React, { useState, useEffect } from 'react'
import { 
  Wrench, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Plus,
  Eye
} from 'lucide-react'
import { api } from '../lib/supabase'
import DashboardWidget from '../components/common/DashboardWidget'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load dashboard stats
      const { data: statsData } = await api.getDashboardStats()
      setStats(statsData)

      // Load recent requests
      const { data: requestsData } = await api.getMaintenanceRequests({ limit: 5 })
      setRecentRequests(requestsData || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequest = () => {
    // Navigate to create request page
    window.location.href = '/requests?create=true'
  }

  const handleViewAll = (path) => {
    window.location.href = path
  }

  const requestColumns = [
    {
      key: 'id',
      header: 'ID',
      accessor: 'id',
      render: (row) => `#${row.id}`
    },
    {
      key: 'customer',
      header: 'Customer',
      accessor: 'customers',
      render: (row) => row.customers?.name || 'N/A'
    },
    {
      key: 'device',
      header: 'Device',
      accessor: 'devices',
      render: (row) => row.devices?.name || 'N/A'
    },
    {
      key: 'issue',
      header: 'Issue',
      accessor: 'issue',
      render: (row) => row.issue?.substring(0, 50) + (row.issue?.length > 50 ? '...' : '')
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`status-badge status-${row.status?.replace('_', '-')}`}>
          {row.status?.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString()
    }
  ]

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto'
  }

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem'
  }

  const titleStyles = {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  }

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  }

  const sectionStyles = {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    border: '1px solid var(--border-primary)',
    boxShadow: 'var(--shadow-sm)'
  }

  const sectionHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  }

  const sectionTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0
  }

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px'
        }}>
          <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Dashboard</h1>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={handleCreateRequest}
        >
          New Request
        </Button>
      </div>

      {/* Stats Grid */}
      <div style={statsGridStyles}>
        <DashboardWidget
          title="Total Requests"
          value={stats?.total_requests || 0}
          icon={Wrench}
          color="primary"
          onClick={() => handleViewAll('/requests')}
        />
        
        <DashboardWidget
          title="Open Requests"
          value={stats?.open_requests || 0}
          icon={AlertTriangle}
          color="warning"
          onClick={() => handleViewAll('/requests?status=new,assigned,in_progress,waiting_parts')}
        />
        
        <DashboardWidget
          title="Completed"
          value={stats?.completed_requests || 0}
          icon={TrendingUp}
          color="success"
          onClick={() => handleViewAll('/requests?status=fixed,delivered,closed')}
        />
        
        <DashboardWidget
          title="Customers"
          value={stats?.total_customers || 0}
          icon={Users}
          color="info"
          onClick={() => handleViewAll('/customers')}
        />
        
        <DashboardWidget
          title="Low Stock Items"
          value={stats?.low_stock_parts || 0}
          icon={Package}
          color="error"
          onClick={() => handleViewAll('/inventory?low_stock=true')}
        />
        
        <DashboardWidget
          title="Recent Activity"
          value={stats?.recent_activity || 0}
          icon={Activity}
          color="primary"
          onClick={() => handleViewAll('/activity-log')}
        />
      </div>

      {/* Recent Requests */}
      <div style={sectionStyles}>
        <div style={sectionHeaderStyles}>
          <h2 style={sectionTitleStyles}>Recent Maintenance Requests</h2>
          <Button
            variant="outline"
            size="sm"
            icon={<Eye size={14} />}
            onClick={() => handleViewAll('/requests')}
          >
            View All
          </Button>
        </div>
        
        <Table
          data={recentRequests}
          columns={requestColumns}
          onRowClick={(row) => window.location.href = `/requests/${row.id}`}
          pagination={false}
          searchable={false}
          emptyMessage="No recent requests found"
        />
      </div>
    </div>
  )
}

export default Dashboard