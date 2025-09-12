import React, { useState, useEffect } from 'react'
import { Plus, Package, User, Calendar, Shield } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import FormInput from '../components/common/FormInput'
import toast from 'react-hot-toast'

const Devices = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customers, setCustomers] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    warranty: '',
    search: ''
  })

  const [createForm, setCreateForm] = useState({
    customer_id: '',
    name: '',
    serial_number: '',
    warranty: false,
    warranty_expiry: '',
    accessories: []
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      
      let query = api.supabase
        .from('devices')
        .select(`
          *,
          customers(name, phone, type)
        `)
        .order('created_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.warranty !== '') {
        query = query.eq('warranty', filters.warranty === 'true')
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%,customers.name.ilike.%${filters.search}%`)
      }

      const { data: devicesData } = await query
      setDevices(devicesData || [])

      // Load customers for form
      const { data: customersData } = await api.getCustomers()
      setCustomers(customersData || [])

    } catch (error) {
      console.error('Error loading devices:', error)
      toast.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDevice = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await api.createDevice(createForm)
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Device created successfully')
      setShowCreateModal(false)
      setCreateForm({ customer_id: '', name: '', serial_number: '', warranty: false, warranty_expiry: '', accessories: [] })
      loadData()
    } catch (error) {
      console.error('Error creating device:', error)
      toast.error('Failed to create device')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Device',
      accessor: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            SN: {row.serial_number}
          </div>
        </div>
      )
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
      key: 'warranty',
      header: 'Warranty',
      render: (row) => (
        <div>
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
          {row.warranty_expiry && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Expires: {new Date(row.warranty_expiry).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: row.status === 'active' ? 'var(--success)' : 
                          row.status === 'replaced' ? 'var(--warning)' : 'var(--muted)',
          color: 'white',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          {row.status}
        </span>
      )
    },
    {
      key: 'accessories',
      header: 'Accessories',
      accessor: 'accessories',
      render: (row) => (
        <div style={{ fontSize: '0.75rem' }}>
          {row.accessories?.length > 0 ? row.accessories.join(', ') : 'None'}
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Added',
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
        <h1 style={titleStyles}>Devices</h1>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          New Device
        </Button>
      </div>

      {/* Filters */}
      <div style={filtersStyles}>
        <div style={filterGroupStyles}>
          <label style={labelStyles}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={selectStyles}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="replaced">Replaced</option>
            <option value="archived">Archived</option>
          </select>
        </div>

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
        data={devices}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No devices found"
      />

      {/* Create Device Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Device"
        size="lg"
      >
        <form onSubmit={handleCreateDevice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Customer"
            name="customer_id"
            type="select"
            value={createForm.customer_id}
            onChange={(e) => setCreateForm(prev => ({ ...prev, customer_id: e.target.value }))}
            required
          >
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </option>
            ))}
          </FormInput>

          <FormInput
            label="Device Name"
            name="name"
            type="text"
            value={createForm.name}
            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter device name"
            required
          />

          <FormInput
            label="Serial Number"
            name="serial_number"
            type="text"
            value={createForm.serial_number}
            onChange={(e) => setCreateForm(prev => ({ ...prev, serial_number: e.target.value }))}
            placeholder="Enter serial number"
            required
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={createForm.warranty}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, warranty: e.target.checked }))}
                />
                <span style={labelStyles}>Under Warranty</span>
              </label>
            </div>

            {createForm.warranty && (
              <div style={{ flex: 1 }}>
                <FormInput
                  label="Warranty Expiry"
                  name="warranty_expiry"
                  type="date"
                  value={createForm.warranty_expiry}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, warranty_expiry: e.target.value }))}
                />
              </div>
            )}
          </div>

          <FormInput
            label="Accessories (comma-separated)"
            name="accessories"
            type="text"
            value={createForm.accessories.join(', ')}
            onChange={(e) => setCreateForm(prev => ({ 
              ...prev, 
              accessories: e.target.value.split(',').map(item => item.trim()).filter(item => item)
            }))}
            placeholder="charger, case, manual"
          />

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
              Create Device
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Devices