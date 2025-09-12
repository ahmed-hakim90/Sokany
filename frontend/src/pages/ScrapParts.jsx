import React, { useState, useEffect } from 'react'
import { Trash2, Package, AlertTriangle, RotateCcw } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'

const ScrapParts = () => {
  const [scrapParts, setScrapParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    search: ''
  })

  useEffect(() => {
    loadScrapParts()
  }, [filters])

  const loadScrapParts = async () => {
    try {
      setLoading(true)
      
      const params = {
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined
      }

      const { data: scrapData } = await api.getScrapParts(params)
      setScrapParts(scrapData || [])

    } catch (error) {
      console.error('Error loading scrap parts:', error)
      toast.error('Failed to load scrap parts')
    } finally {
      setLoading(false)
    }
  }

  const handleReturnStock = async (scrapPart) => {
    try {
      const { data, error } = await api.returnStock(
        scrapPart.part_id,
        scrapPart.center_id,
        scrapPart.quantity,
        '00000000-0000-0000-0000-000000000000', // Placeholder user ID
        scrapPart.related_request_id
      )
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Stock returned successfully')
      loadScrapParts()
    } catch (error) {
      console.error('Error returning stock:', error)
      toast.error('Failed to return stock')
    }
  }

  const columns = [
    {
      key: 'part',
      header: 'Part',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.spare_parts?.name || 'N/A'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Code: {row.spare_parts?.code || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'center',
      header: 'Center',
      accessor: 'centers',
      render: (row) => row.centers?.name || 'N/A'
    },
    {
      key: 'quantity',
      header: 'Quantity',
      accessor: 'quantity',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: '600' }}>{row.quantity}</span>
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
      key: 'created_at',
      header: 'Date',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={<RotateCcw size={14} />}
          onClick={() => handleReturnStock(row)}
          title="Return to Stock"
        >
          Return
        </Button>
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
    const totalScrap = scrapParts.length
    const totalQuantity = scrapParts.reduce((sum, part) => sum + part.quantity, 0)
    const totalValue = scrapParts.reduce((sum, part) => 
      sum + (part.quantity * (part.spare_parts?.price || 0)), 0
    )

    return { totalScrap, totalQuantity, totalValue }
  }

  const stats = getStats()

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Scrap Parts</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            icon={<AlertTriangle size={16} />}
            onClick={() => {
              const today = new Date().toISOString().split('T')[0]
              setFilters(prev => ({ ...prev, date_from: today, date_to: today }))
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            icon={<AlertTriangle size={16} />}
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
          <div style={statValueStyles}>{stats.totalScrap}</div>
          <div style={statLabelStyles}>Total Scrap Entries</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.totalQuantity}</div>
          <div style={statLabelStyles}>Total Quantity Scrapped</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>${stats.totalValue.toFixed(2)}</div>
          <div style={statLabelStyles}>Total Value Lost</div>
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
        data={scrapParts}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No scrap parts found"
      />
    </div>
  )
}

export default ScrapParts