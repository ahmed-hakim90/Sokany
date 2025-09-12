import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, User, Clock, Package, CheckCircle, XCircle, Printer } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import FormInput from '../components/common/FormInput'
import toast from 'react-hot-toast'

const RequestDetail = () => {
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [followups, setFollowups] = useState([])
  const [partsUsed, setPartsUsed] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFollowupModal, setShowFollowupModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [technicians, setTechnicians] = useState([])

  const [followupForm, setFollowupForm] = useState({
    status: '',
    note: ''
  })

  const [assignForm, setAssignForm] = useState({
    technician_id: ''
  })

  useEffect(() => {
    if (id) {
      loadRequestDetails()
    }
  }, [id])

  const loadRequestDetails = async () => {
    try {
      setLoading(true)
      
      const { data: requestData } = await api.getRequestDetails(parseInt(id))
      if (requestData) {
        setRequest(requestData.request)
        setFollowups(requestData.followups || [])
        setPartsUsed(requestData.parts_used || [])
      }

      // Load technicians for assignment
      const { data: techniciansData } = await api.supabase
        .from('users')
        .select('id, name, role')
        .eq('role', 'technician')
      setTechnicians(techniciansData || [])

    } catch (error) {
      console.error('Error loading request details:', error)
      toast.error('Failed to load request details')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFollowup = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await api.addFollowup({
        request_id: parseInt(id),
        technician_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        status: followupForm.status,
        note: followupForm.note
      })
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Follow-up added successfully')
      setShowFollowupModal(false)
      setFollowupForm({ status: '', note: '' })
      loadRequestDetails()
    } catch (error) {
      console.error('Error adding follow-up:', error)
      toast.error('Failed to add follow-up')
    }
  }

  const handleAssignRequest = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await api.assignRequest(
        parseInt(id),
        assignForm.technician_id,
        '00000000-0000-0000-0000-000000000000' // Placeholder
      )
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Request assigned successfully')
      setShowAssignModal(false)
      setAssignForm({ technician_id: '' })
      loadRequestDetails()
    } catch (error) {
      console.error('Error assigning request:', error)
      toast.error('Failed to assign request')
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const { error } = await api.updateMaintenanceRequest(parseInt(id), { status: newStatus })
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Status updated successfully')
      loadRequestDetails()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handlePrint = () => {
    window.open(`/print/request/${id}`, '_blank')
  }

  const getStatusIcon = (status) => {
    const icons = {
      new: Package,
      assigned: User,
      in_progress: Clock,
      waiting_parts: Package,
      fixed: CheckCircle,
      cannot_repair: XCircle,
      delivered: CheckCircle,
      closed: CheckCircle
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

  const followupColumns = [
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
      key: 'note',
      header: 'Note',
      accessor: 'note',
      render: (row) => row.note || 'No note'
    },
    {
      key: 'technician',
      header: 'Technician',
      accessor: 'technician',
      render: (row) => row.technician?.name || 'N/A'
    },
    {
      key: 'created_at',
      header: 'Date',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleString()
    }
  ]

  const partsColumns = [
    {
      key: 'part',
      header: 'Part',
      render: (row) => (
        <div>
          <div style={{ fontWeight: '500' }}>{row.part?.name || 'N/A'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Code: {row.part?.code || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      render: (row) => (
        <span style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: row.type === 'add' ? 'var(--success)' : 
                          row.type === 'issue' ? 'var(--warning)' :
                          row.type === 'return' ? 'var(--info)' : 'var(--error)',
          color: 'white',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          {row.type}
        </span>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      accessor: 'quantity',
      render: (row) => (row.quantity > 0 ? '+' : '') + row.quantity
    },
    {
      key: 'created_at',
      header: 'Date',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleString()
    }
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
      </div>
    )
  }

  if (!request) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Request not found</h2>
        <p>The requested maintenance request could not be found.</p>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button
            variant="outline"
            icon={<ArrowLeft size={16} />}
            onClick={() => window.history.back()}
          >
            Back
          </Button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
              Request #{request.id}
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {request.customer?.name} - {request.device?.name}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            icon={<Printer size={16} />}
            onClick={handlePrint}
          >
            Print
          </Button>
          {request.status === 'new' && (
            <Button
              variant="primary"
              icon={<User size={16} />}
              onClick={() => setShowAssignModal(true)}
            >
              Assign
            </Button>
          )}
        </div>
      </div>

      {/* Request Details */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Request Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <strong>Issue:</strong> {request.issue}
              </div>
              <div>
                <strong>Status:</strong> 
                <span className={`status-badge status-${request.status?.replace('_', '-')}`} style={{ marginLeft: '0.5rem' }}>
                  {request.status?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <strong>Under Warranty:</strong> {request.under_warranty ? 'Yes' : 'No'}
              </div>
              {request.service_only && (
                <div>
                  <strong>Service Only:</strong> Yes
                  {request.service_fee > 0 && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      (Fee: ${request.service_fee})
                    </span>
                  )}
                </div>
              )}
              <div>
                <strong>Created:</strong> {new Date(request.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Customer Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <strong>Name:</strong> {request.customer?.name || 'N/A'}
              </div>
              <div>
                <strong>Phone:</strong> {request.customer?.phone || 'N/A'}
              </div>
              <div>
                <strong>Type:</strong> {request.customer?.type || 'N/A'}
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Device Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <strong>Name:</strong> {request.device?.name || 'N/A'}
              </div>
              <div>
                <strong>Serial Number:</strong> {request.device?.serial_number || 'N/A'}
              </div>
              <div>
                <strong>Warranty:</strong> {request.device?.warranty ? 'Yes' : 'No'}
              </div>
              {request.device?.warranty_expiry && (
                <div>
                  <strong>Warranty Expiry:</strong> {new Date(request.device.warranty_expiry).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Follow-ups */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Follow-ups</h3>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setShowFollowupModal(true)}
          >
            Add Follow-up
          </Button>
        </div>
        
        <Table
          data={followups}
          columns={followupColumns}
          pagination={false}
          searchable={false}
          emptyMessage="No follow-ups yet"
        />
      </div>

      {/* Parts Used */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-primary)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Parts Used</h3>
        
        <Table
          data={partsUsed}
          columns={partsColumns}
          pagination={false}
          searchable={false}
          emptyMessage="No parts used yet"
        />
      </div>

      {/* Add Follow-up Modal */}
      <Modal
        isOpen={showFollowupModal}
        onClose={() => setShowFollowupModal(false)}
        title="Add Follow-up"
      >
        <form onSubmit={handleAddFollowup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Status"
            name="status"
            type="select"
            value={followupForm.status}
            onChange={(e) => setFollowupForm(prev => ({ ...prev, status: e.target.value }))}
            required
          >
            <option value="">Select Status</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_parts">Waiting Parts</option>
            <option value="fixed">Fixed</option>
            <option value="cannot_repair">Cannot Repair</option>
          </FormInput>

          <FormInput
            label="Note"
            name="note"
            type="textarea"
            value={followupForm.note}
            onChange={(e) => setFollowupForm(prev => ({ ...prev, note: e.target.value }))}
            placeholder="Add your notes..."
            required
          />

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFollowupModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Add Follow-up
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

export default RequestDetail