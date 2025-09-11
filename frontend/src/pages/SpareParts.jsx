import React, { useState, useEffect } from 'react'
import { Plus, Package, DollarSign, Shield, Search } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import FormInput from '../components/common/FormInput'
import toast from 'react-hot-toast'

const SpareParts = () => {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState({
    warranty: '',
    search: ''
  })

  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    price: '',
    warranty: false
  })

  useEffect(() => {
    loadParts()
  }, [filters])

  const loadParts = async () => {
    try {
      setLoading(true)
      
      const params = {
        warranty: filters.warranty !== '' ? filters.warranty === 'true' : undefined,
        search: filters.search || undefined
      }

      const { data: partsData } = await api.getSpareParts(params)
      setParts(partsData || [])

    } catch (error) {
      console.error('Error loading spare parts:', error)
      toast.error('Failed to load spare parts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePart = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await api.createSparePart(createForm)
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Spare part created successfully')
      setShowCreateModal(false)
      setCreateForm({ code: '', name: '', price: '', warranty: false })
      loadParts()
    } catch (error) {
      console.error('Error creating spare part:', error)
      toast.error('Failed to create spare part')
    }
  }

  const columns = [
    {
      key: 'code',
      header: 'Code',
      accessor: 'code',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{row.code}</span>
        </div>
      )
    },
    {
      key: 'name',
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.name}</div>
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
      key: 'warranty',
      header: 'Warranty',
      accessor: 'warranty',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{
            padding: '0.25rem 0.5rem',
            backgroundColor: row.warranty ? 'var(--success)' : 'var(--muted)',
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {row.warranty ? 'Yes' : 'No'}
          </span>
        </div>
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

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Spare Parts</h1>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          New Part
        </Button>
      </div>

      {/* Filters */}
      <div style={filtersStyles}>
        <div style={filterGroupStyles}>
          <label style={labelStyles}>Warranty</label>
          <select
            value={filters.warranty}
            onChange={(e) => setFilters(prev => ({ ...prev, warranty: e.target.value }))}
            style={selectStyles}
          >
            <option value="">All</option>
            <option value="true">With Warranty</option>
            <option value="false">No Warranty</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        data={parts}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No spare parts found"
      />

      {/* Create Part Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Spare Part"
        size="md"
      >
        <form onSubmit={handleCreatePart} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Part Code"
            name="code"
            type="text"
            value={createForm.code}
            onChange={(e) => setCreateForm(prev => ({ ...prev, code: e.target.value }))}
            placeholder="Enter part code (e.g., SP001)"
            required
          />

          <FormInput
            label="Part Name"
            name="name"
            type="text"
            value={createForm.name}
            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter part name"
            required
          />

          <FormInput
            label="Price"
            name="price"
            type="number"
            value={createForm.price}
            onChange={(e) => setCreateForm(prev => ({ ...prev, price: e.target.value }))}
            placeholder="Enter price"
            step="0.01"
            min="0"
            required
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={createForm.warranty}
              onChange={(e) => setCreateForm(prev => ({ ...prev, warranty: e.target.checked }))}
            />
            <span style={labelStyles}>Under Warranty</span>
          </label>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Create Part
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SpareParts