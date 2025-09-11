import React, { useState, useEffect } from 'react'
import { Activity, User, Clock, Database, Filter } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'

const ActivityLog = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    user_id: '',
    entity: '',
    date_from: '',
    date_to: '',
    search: ''
  })

  useEffect(() => {
    loadActivities()
  }, [filters])

  const loadActivities = async () => {
    try {
      setLoading(true)
      
      const params = {
        user_id: filters.user_id || undefined,
        entity: filters.entity || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined
      }

      const { data: activitiesData } = await api.getActivityLog(params)
      setActivities(activitiesData || [])

    } catch (error) {
      console.error('Error loading activities:', error)
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action) => {
    const icons = {
      created: '➕',
      updated: '✏️',
      deleted: '🗑️',
      assigned_request: '👤',
      closed_request: '✅',
      added_stock: '📦',
      issued_stock: '📤',
      returned_stock: '📥',
      marked_scrap: '🗑️',
      created_sale: '💰',
      created_device_replacement: '🔄',
      service_fee_charged: '💳'
    }
    return icons[action] || '📝'
  }

  const getActionColor = (action) => {
    const colors = {
      created: 'var(--success)',
      updated: 'var(--info)',
      deleted: 'var(--error)',
      assigned_request: 'var(--primary)',
      closed_request: 'var(--success)',
      added_stock: 'var(--success)',
      issued_stock: 'var(--warning)',
      returned_stock: 'var(--info)',
      marked_scrap: 'var(--error)',
      created_sale: 'var(--success)',
      created_device_replacement: 'var(--primary)',
      service_fee_charged: 'var(--info)'
    }
    return colors[action] || 'var(--text-muted)'
  }

  const columns = [
    {
      key: 'action',
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>{getActionIcon(row.action)}</span>
          <span style={{ 
            padding: '0.25rem 0.5rem',
            backgroundColor: getActionColor(row.action),
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {row.action?.replace('_', ' ')}
          </span>
        </div>
      )
    },
    {
      key: 'entity',
      header: 'Entity',
      accessor: 'entity',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ textTransform: 'capitalize' }}>
            {row.entity?.replace('_', ' ')}
          </span>
        </div>
      )
    },
    {
      key: 'user',
      header: 'User',
      accessor: 'user',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} style={{ color: 'var(--text-muted)' }} />
          <div>
            <div style={{ fontWeight: '500' }}>{row.user?.name || 'System'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {row.user?.role || ''}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'meta',
      header: 'Details',
      accessor: 'meta',
      render: (row) => {
        if (!row.meta) return 'No details'
        
        const meta = typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta
        const details = []
        
        if (meta.quantity) details.push(`Qty: ${meta.quantity}`)
        if (meta.center_id) details.push(`Center: ${meta.center_id}`)
        if (meta.technician_id) details.push(`Tech: ${meta.technician_id}`)
        if (meta.amount) details.push(`Amount: $${meta.amount}`)
        if (meta.reason) details.push(`Reason: ${meta.reason}`)
        
        return details.length > 0 ? details.join(', ') : 'No details'
      }
    },
    {
      key: 'created_at',
      header: 'Date',
      accessor: 'created_at',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} style={{ color: 'var(--text-muted)' }} />
          <div>
            <div style={{ fontWeight: '500' }}>{new Date(row.created_at).toLocaleDateString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(row.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )
    }
  ]

  const containerStyles = {
    maxWidth: '1400px',
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

  const filtersStyles = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'end'
  }

  const filterGroupStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: '150px'
  }

  const labelStyles = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-primary)'
  }

  const selectStyles = {
    padding: '0.75rem',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none'
  }

  const statsStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  }

  const statCardStyles = {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    textAlign: 'center'
  }

  const statValueStyles = {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem 0'
  }

  const statLabelStyles = {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    margin: 0
  }

  const getStats = () => {
    const totalActivities = activities.length
    const today = activities.filter(activity => {
      const activityDate = new Date(activity.created_at)
      const today = new Date()
      return activityDate.toDateString() === today.toDateString()
    }).length

    const thisWeek = activities.filter(activity => {
      const activityDate = new Date(activity.created_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return activityDate >= weekAgo
    }).length

    return { totalActivities, today, thisWeek }
  }

  const stats = getStats()

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Activity Log</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            icon={<Filter size={16} />}
            onClick={() => {
              const today = new Date().toISOString().split('T')[0]
              setFilters(prev => ({ ...prev, date_from: today, date_to: today }))
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            icon={<Filter size={16} />}
            onClick={() => {
              const today = new Date()
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
              setFilters(prev => ({ 
                ...prev, 
                date_from: weekAgo.toISOString().split('T')[0], 
                date_to: today.toISOString().split('T')[0] 
              }))
            }}
          >
            Last 7 Days
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={statsStyles}>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.totalActivities}</div>
          <div style={statLabelStyles}>Total Activities</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.today}</div>
          <div style={statLabelStyles}>Today</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.thisWeek}</div>
          <div style={statLabelStyles}>This Week</div>
        </div>
      </div>

      {/* Filters */}
      <div style={filtersStyles}>
        <div style={filterGroupStyles}>
          <label style={labelStyles}>Entity</label>
          <select
            value={filters.entity}
            onChange={(e) => setFilters(prev => ({ ...prev, entity: e.target.value }))}
            style={selectStyles}
          >
            <option value="">All Entities</option>
            <option value="customers">Customers</option>
            <option value="devices">Devices</option>
            <option value="maintenance_requests">Maintenance Requests</option>
            <option value="spare_parts">Spare Parts</option>
            <option value="inventory">Inventory</option>
            <option value="sales">Sales</option>
            <option value="scrap_parts">Scrap Parts</option>
            <option value="device_replacements">Device Replacements</option>
            <option value="service_charges">Service Charges</option>
          </select>
        </div>

        <div style={filterGroupStyles}>
          <label style={labelStyles}>Date From</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
            style={selectStyles}
          />
        </div>

        <div style={filterGroupStyles}>
          <label style={labelStyles}>Date To</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
            style={selectStyles}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        data={activities}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No activities found"
      />
    </div>
  )
}

export default ActivityLog