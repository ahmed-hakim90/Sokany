import React, { useState, useEffect } from 'react'
import { ShoppingCart, User, Package, DollarSign, Calendar } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'

const Sales = () => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    search: ''
  })

  useEffect(() => {
    loadSales()
  }, [filters])

  const loadSales = async () => {
    try {
      setLoading(true)
      
      const params = {
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined
      }

      const { data: salesData } = await api.getSales(params)
      setSales(salesData || [])

    } catch (error) {
      console.error('Error loading sales:', error)
      toast.error('Failed to load sales')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
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
      key: 'part',
      header: 'Part',
      accessor: 'spare_parts',
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
      key: 'price',
      header: 'Price',
      accessor: 'price',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: '600' }}>${row.price?.toFixed(2) || '0.00'}</span>
        </div>
      )
    },
    {
      key: 'discount',
      header: 'Discount',
      accessor: 'discount',
      render: (row) => (
        <span style={{ color: row.discount > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
          ${row.discount?.toFixed(2) || '0.00'}
        </span>
      )
    },
    {
      key: 'total',
      header: 'Total',
      accessor: 'total',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>
            ${row.total?.toFixed(2) || '0.00'}
          </span>
        </div>
      )
    },
    {
      key: 'created_by',
      header: 'Sold By',
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
      render: (row) => new Date(row.created_at).toLocaleDateString()
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
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0)
    const totalDiscount = sales.reduce((sum, sale) => sum + (sale.discount || 0), 0)
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0

    return { totalSales, totalRevenue, totalDiscount, averageSale }
  }

  const stats = getStats()

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Sales</h1>
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
          <div style={statValueStyles}>{stats.totalSales}</div>
          <div style={statLabelStyles}>Total Sales</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>${stats.totalRevenue.toFixed(2)}</div>
          <div style={statLabelStyles}>Total Revenue</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>${stats.totalDiscount.toFixed(2)}</div>
          <div style={statLabelStyles}>Total Discount</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>${stats.averageSale.toFixed(2)}</div>
          <div style={statLabelStyles}>Average Sale</div>
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
        data={sales}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No sales found"
      />
    </div>
  )
}

export default Sales