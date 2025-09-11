import React, { useState, useEffect } from 'react'
import { Plus, User, Phone, MapPin, Building, UserCheck } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import FormInput from '../components/common/FormInput'
import toast from 'react-hot-toast'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    search: ''
  })

  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    address: '',
    type: 'consumer'
  })

  useEffect(() => {
    loadCustomers()
  }, [filters])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      
      const params = {
        type: filters.type || undefined,
        search: filters.search || undefined
      }

      const { data: customersData } = await api.getCustomers(params)
      setCustomers(customersData || [])

    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await api.createCustomer(createForm)
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Customer created successfully')
      setShowCreateModal(false)
      setCreateForm({ name: '', phone: '', address: '', type: 'consumer' })
      loadCustomers()
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('Failed to create customer')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} style={{ color: 'var(--text-muted)' }} />
          {row.name}
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      accessor: 'phone',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Phone size={16} style={{ color: 'var(--text-muted)' }} />
          {row.phone}
        </div>
      )
    },
    {
      key: 'address',
      header: 'Address',
      accessor: 'address',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
          {row.address || 'N/A'}
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{
            padding: '0.25rem 0.5rem',
            backgroundColor: row.type === 'distributor' ? 'var(--primary)' : 'var(--info)',
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {row.type}
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            icon={<UserCheck size={14} />}
            onClick={() => window.location.href = `/customers/${row.id}`}
          >
            View
          </Button>
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

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Customers</h1>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          New Customer
        </Button>
      </div>

      {/* Filters */}
      <div style={filtersStyles}>
        <div style={filterGroupStyles}>
          <label style={labelStyles}>Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            style={selectStyles}
          >
            <option value="">All Types</option>
            <option value="consumer">Consumer</option>
            <option value="distributor">Distributor</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        data={customers}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        onRowClick={(row) => window.location.href = `/customers/${row.id}`}
        emptyMessage="No customers found"
      />

      {/* Create Customer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Customer"
        size="md"
      >
        <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Name"
            name="name"
            type="text"
            value={createForm.name}
            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter customer name"
            required
          />

          <FormInput
            label="Phone"
            name="phone"
            type="tel"
            value={createForm.phone}
            onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter phone number"
            required
          />

          <FormInput
            label="Address"
            name="address"
            type="text"
            value={createForm.address}
            onChange={(e) => setCreateForm(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter address"
          />

          <FormInput
            label="Type"
            name="type"
            type="select"
            value={createForm.type}
            onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
            required
          >
            <option value="consumer">Consumer</option>
            <option value="distributor">Distributor</option>
          </FormInput>

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
              Create Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Customers