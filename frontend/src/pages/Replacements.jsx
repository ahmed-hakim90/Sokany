import React, { useState, useEffect } from 'react'
import { RefreshCw, User, Package, Calendar, ArrowRight } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'

const Replacements = () => {
  const [replacements, setReplacements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    search: ''
  })

  useEffect(() => {
    loadReplacements()
  }, [filters])

  const loadReplacements = async () => {
    try {
      setLoading(true)
      
      const params = {
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined
      }

      const { data: replacementsData } = await api.getDeviceReplacements(params)
      setReplacements(replacementsData || [])

    } catch (error) {
      console.error('Error loading replacements:', error)
      toast.error('Failed to load replacements')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      accessor: 'customers',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.customers?.name || 'N/A'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {row.customers?.phone || ''}
          </div>
        </div>
      )
    },
    {
      key: 'old_device',
      header: 'Old Device',
      accessor: 'old_device',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.old_device?.name || 'N/A'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            SN: {row.old_device?.serial_number || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'arrow',
      header: '',
      render: () => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
      )
    },
    {
      key: 'new_device',
      header: 'New Device',
      accessor: 'new_device',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.new_device?.name || 'N/A'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            SN: {row.new_device?.serial_number || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'reason',
      header: 'Reason',
      accessor: 'reason',
      render: (row) => (
        <div style={{ maxWidth: '200px' }}>
          {row.reason || 'No reason provided'}
        </div>
      )
    },
    {
      key: 'created_by',
      header: 'Created By',
      accessor: 'created_by_user',
      render: (row) => row.created_by_user?.name || 'N/A'
    },
    {
      key: 'center',
      header: 'Center',
      accessor: 'centers',
      render: (row) => row.centers?.name || 'N/A'
    },
    {
      key: 'created_at',
      header: 'Date',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleString()
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
    const totalReplacements = replacements.length
    const thisWeek = replacements.filter(replacement => {
      const replacementDate = new Date(replacement.created_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return replacementDate >= weekAgo
    }).length

    return { totalReplacements, thisWeek }
  }

  const stats = getStats()

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Device Replacements</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            icon={<Calendar size={16} />}
            onClick={() => {
              const today = new Date().toISOString().split('T')[0]
              setFilters(prev => ({ ...prev, date_from: today, date_to: today }))
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            icon={<Calendar size={16} />}
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
          <div style={statValueStyles}>{stats.totalReplacements}</div>
          <div style={statLabelStyles}>Total Replacements</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.thisWeek}</div>
          <div style={statLabelStyles}>This Week</div>
        </div>
      </div>

      {/* Filters */}
      <div style={filtersStyles}>
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
        data={replacements}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No device replacements found"
      />
    </div>
  )
}

export default Replacements