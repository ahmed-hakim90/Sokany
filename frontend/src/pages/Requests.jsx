import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  Archive
} from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import FormInput from '../components/common/FormInput'
import toast from 'react-hot-toast'

const Requests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [customers, setCustomers] = useState([])
  const [devices, setDevices] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    date_from: '',
    date_to: ''
  })

  const [createForm, setCreateForm] = useState({
    customer_id: '',
    device_id: '',
    issue: '',
    under_warranty: false,
    service_only: false,
    service_fee: 0,
    service_fee_type: 'free'
  })

  const [assignForm, setAssignForm] = useState({
    technician_id: ''
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const params = {
        ...filters,
        search: filters.search || undefined,
        status: filters.status || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined
      }

      const { data: requestsData } = await api.getMaintenanceRequests(params)
      setRequests(requestsData || [])

      // Load technicians
      const { data: techniciansData } = await api.supabase
        .from('users')
        .select('id, name, role')
        .eq('role', 'technician')
      setTechnicians(techniciansData || [])

      // Load customers
      const { data: customersData } = await api.getCustomers()
      setCustomers(customersData || [])

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await api.createMaintenanceRequest(createForm)
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Request created successfully')
      setShowCreateModal(false)
      setCreateForm({
        customer_id: '',
        device_id: '',
        issue: '',
        under_warranty: false,
        service_only: false,
        service_fee: 0,
        service_fee_type: 'free'
      })
      loadData()
    } catch (error) {
      console.error('Error creating request:', error)
      toast.error('Failed to create request')
    }
  }

  const handleAssignRequest = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await api.assignRequest(
        selectedRequest.id,
        assignForm.technician_id,
        selectedRequest.created_by
      )
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Request assigned successfully')
      setShowAssignModal(false)
      setSelectedRequest(null)
      setAssignForm({ technician_id: '' })
      loadData()
    } catch (error) {
      console.error('Error assigning request:', error)
      toast.error('Failed to assign request')
    }
  }

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const { error } = await api.updateMaintenanceRequest(requestId, { status: newStatus })
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Status updated successfully')
      loadData()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const getStatusIcon = (status) => {
    const icons = {
      new: Plus,
      assigned: UserCheck,
      in_progress: Clock,
      waiting_parts: Package,
      fixed: CheckCircle,
      cannot_repair: XCircle,
      delivered: Truck,
      closed: Archive
    }
    return icons[status] || Clock
  }

  const getStatusColor = (status) => {
    const colors = {
      new: 'info',
      assigned: 'warning',
      in_progress: 'primary',
      waiting_parts: 'warning',
      fixed: 'success',
      cannot_repair: 'error',
      delivered: 'success',
      closed: 'muted'
    }
    return colors[status] || 'primary'
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
      key: 'device',
      header: 'Device',
      accessor: 'devices',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.devices?.name || 'N/A'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {row.devices?.serial_number || ''}
          </div>
        </div>
      )
    },
    {
      key: 'issue',
      header: 'Issue',
      accessor: 'issue',
      render: (row) => (
        <div style={{ maxWidth: '200px' }}>
          {row.issue?.substring(0, 100)}
          {row.issue?.length > 100 && '...'}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const StatusIcon = getStatusIcon(row.status)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StatusIcon size={16} />
            <span className={`status-badge status-${row.status?.replace('_', '-')}`}>
              {row.status?.replace('_', ' ')}
            </span>
          </div>
        )
      }
    },
    {
      key: 'service_only',
      header: 'Service Type',
      accessor: 'service_only',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {row.service_only && (
            <span style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--info)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              Service Only
            </span>
          )}
          {row.under_warranty && (
            <span style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--success)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              Warranty
            </span>
          )}
        </div>
      )
    },
    {
      key: 'assigned_technician',
      header: 'Technician',
      accessor: 'assigned_technician',
      render: (row) => row.assigned_technician?.name || 'Unassigned'
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
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="sm"
            icon={<Eye size={14} />}
            onClick={() => window.location.href = `/requests/${row.id}`}
          >
            View
          </Button>
          {row.status === 'new' && (
            <Button
              variant="primary"
              size="sm"
              icon={<UserCheck size={14} />}
              onClick={() => {
                setSelectedRequest(row)
                setShowAssignModal(true)
              }}
            >
              Assign
            </Button>
          )}
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
        <h1 style={titleStyles}>Maintenance Requests</h1>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          New Request
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
            <option value="new">New</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_parts">Waiting Parts</option>
            <option value="fixed">Fixed</option>
            <option value="cannot_repair">Cannot Repair</option>
            <option value="delivered">Delivered</option>
            <option value="closed">Closed</option>
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
        data={requests}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        onRowClick={(row) => window.location.href = `/requests/${row.id}`}
        emptyMessage="No maintenance requests found"
      />

      {/* Create Request Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Maintenance Request"
        size="lg"
      >
        <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            label="Issue Description"
            name="issue"
            type="textarea"
            value={createForm.issue}
            onChange={(e) => setCreateForm(prev => ({ ...prev, issue: e.target.value }))}
            placeholder="Describe the issue..."
            required
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={createForm.under_warranty}
                onChange={(e) => setCreateForm(prev => ({ ...prev, under_warranty: e.target.checked }))}
              />
              Under Warranty
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={createForm.service_only}
                onChange={(e) => setCreateForm(prev => ({ ...prev, service_only: e.target.checked }))}
              />
              Service Only
            </label>
          </div>

          {createForm.service_only && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <FormInput
                label="Service Fee"
                name="service_fee"
                type="number"
                value={createForm.service_fee}
                onChange={(e) => setCreateForm(prev => ({ ...prev, service_fee: parseFloat(e.target.value) || 0 }))}
                step="0.01"
                min="0"
              />

              <FormInput
                label="Service Fee Type"
                name="service_fee_type"
                type="select"
                value={createForm.service_fee_type}
                onChange={(e) => setCreateForm(prev => ({ ...prev, service_fee_type: e.target.value }))}
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </FormInput>
            </div>
          )}

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
              Create Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Request Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Request"
      >
        <form onSubmit={handleAssignRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Technician"
            name="technician_id"
            type="select"
            value={assignForm.technician_id}
            onChange={(e) => setAssignForm(prev => ({ ...prev, technician_id: e.target.value }))}
            required
          >
            <option value="">Select Technician</option>
            {technicians.map(tech => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </FormInput>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Assign Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Requests