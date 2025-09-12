import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, User, Phone, MapPin, Wrench, Package } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'

const CustomerDetail = () => {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [devices, setDevices] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadCustomerDetails()
    }
  }, [id])

  const loadCustomerDetails = async () => {
    try {
      setLoading(true)
      
      // Load customer details
      const { data: customerData } = await api.supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()
      setCustomer(customerData)

      // Load customer devices
      const { data: devicesData } = await api.getDevicesByCustomer(parseInt(id))
      setDevices(devicesData || [])

      // Load customer requests
      const { data: requestsData } = await api.getMaintenanceRequests({ customer_id: parseInt(id) })
      setRequests(requestsData || [])

    } catch (error) {
      console.error('Error loading customer details:', error)
      toast.error('Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  const deviceColumns = [
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
      key: 'warranty',
      header: 'Warranty',
      accessor: 'warranty',
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
      key: 'created_at',
      header: 'Added',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString()
    }
  ]

  const requestColumns = [
    {
      key: 'id',
      header: 'ID',
      accessor: 'id',
      render: (row) => `#${row.id}`
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
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = `/requests/${row.id}`}
        >
          View
        </Button>
      )
    }
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Customer not found</h2>
        <p>The requested customer could not be found.</p>
        <Button
          variant="primary"
          icon={<ArrowLeft size={16} />}
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Button
          variant="outline"
          icon={<ArrowLeft size={16} />}
          onClick={() => window.history.back()}
        >
          Back
        </Button>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
            {customer.name}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Customer Details
          </p>
        </div>
      </div>

      {/* Customer Information */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Customer Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <User size={16} style={{ color: 'var(--text-muted)' }} />
              <strong>Name:</strong> {customer.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Phone size={16} style={{ color: 'var(--text-muted)' }} />
              <strong>Phone:</strong> {customer.phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
              <strong>Address:</strong> {customer.address || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Type:</strong> 
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: customer.type === 'distributor' ? 'var(--primary)' : 'var(--info)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: '500',
                marginLeft: '0.5rem'
              }}>
                {customer.type}
              </span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Created:</strong> {new Date(customer.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Devices */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Package size={20} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Devices ({devices.length})</h3>
        </div>
        
        <Table
          data={devices}
          columns={deviceColumns}
          pagination={false}
          searchable={false}
          emptyMessage="No devices found"
        />
      </div>

      {/* Maintenance Requests */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Wrench size={20} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Maintenance Requests ({requests.length})</h3>
        </div>
        
        <Table
          data={requests}
          columns={requestColumns}
          pagination={true}
          searchable={false}
          pageSize={10}
          emptyMessage="No maintenance requests found"
        />
      </div>
    </div>
  )
}

export default CustomerDetail