import React, { useState, useEffect } from 'react'
import { Plus, User, Shield, UserCog, Wrench, Package, ShoppingCart, Users as UsersIcon } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import FormInput from '../components/common/FormInput'
import toast from 'react-hot-toast'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [centers, setCenters] = useState([])
  const [filters, setFilters] = useState({
    role: '',
    center_id: '',
    search: ''
  })

  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    address: '',
    role: 'customer',
    center_id: ''
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      
      let query = api.supabase
        .from('users')
        .select(`
          *,
          centers(name)
        `)
        .order('created_at', { ascending: false })

      if (filters.role) {
        query = query.eq('role', filters.role)
      }

      if (filters.center_id) {
        query = query.eq('center_id', filters.center_id)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
      }

      const { data: usersData } = await query
      setUsers(usersData || [])

      // Load centers for form
      const { data: centersData } = await api.supabase
        .from('centers')
        .select('id, name')
      setCenters(centersData || [])

    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    try {
      // In a real app, you'd create the user through Supabase Auth first
      // then create the profile record
      toast.success('User creation would be implemented here')
      setShowCreateModal(false)
      setCreateForm({ name: '', phone: '', address: '', role: 'customer', center_id: '' })
      loadData()
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    }
  }

  const getRoleIcon = (role) => {
    const icons = {
      super_admin: Shield,
      center_manager: UserCog,
      receptionist: User,
      technician: Wrench,
      storekeeper: Package,
      customer: UsersIcon
    }
    return icons[role] || User
  }

  const getRoleColor = (role) => {
    const colors = {
      super_admin: 'var(--error)',
      center_manager: 'var(--primary)',
      receptionist: 'var(--info)',
      technician: 'var(--warning)',
      storekeeper: 'var(--success)',
      customer: 'var(--muted)'
    }
    return colors[role] || 'var(--muted)'
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} style={{ color: 'var(--text-muted)' }} />
          <div>
            <div style={{ fontWeight: '500' }}>{row.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {row.phone || 'No phone'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      accessor: 'role',
      render: (row) => {
        const RoleIcon = getRoleIcon(row.role)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RoleIcon size={16} style={{ color: getRoleColor(row.role) }} />
            <span style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: getRoleColor(row.role),
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {row.role?.replace('_', ' ')}
            </span>
          </div>
        )
      }
    },
    {
      key: 'center',
      header: 'Center',
      accessor: 'centers',
      render: (row) => row.centers?.name || 'N/A'
    },
    {
      key: 'address',
      header: 'Address',
      accessor: 'address',
      render: (row) => row.address || 'N/A'
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
            onClick={() => {
              // Edit user functionality would go here
              toast.info('Edit user functionality would be implemented here')
            }}
          >
            Edit
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
    const totalUsers = users.length
    const superAdmins = users.filter(user => user.role === 'super_admin').length
    const centerManagers = users.filter(user => user.role === 'center_manager').length
    const technicians = users.filter(user => user.role === 'technician').length

    return { totalUsers, superAdmins, centerManagers, technicians }
  }

  const stats = getStats()

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Users</h1>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          New User
        </Button>
      </div>

      {/* Stats */}
      <div style={statsStyles}>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.totalUsers}</div>
          <div style={statLabelStyles}>Total Users</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.superAdmins}</div>
          <div style={statLabelStyles}>Super Admins</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.centerManagers}</div>
          <div style={statLabelStyles}>Center Managers</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.technicians}</div>
          <div style={statLabelStyles}>Technicians</div>
        </div>
      </div>

      {/* Filters */}
      <div style={filtersStyles}>
        <div style={filterGroupStyles}>
          <label style={labelStyles}>Role</label>
          <select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            style={selectStyles}
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="center_manager">Center Manager</option>
            <option value="receptionist">Receptionist</option>
            <option value="technician">Technician</option>
            <option value="storekeeper">Storekeeper</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <div style={filterGroupStyles}>
          <label style={labelStyles}>Center</label>
          <select
            value={filters.center_id}
            onChange={(e) => setFilters(prev => ({ ...prev, center_id: e.target.value }))}
            style={selectStyles}
          >
            <option value="">All Centers</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        data={users}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No users found"
      />

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create User"
        size="md"
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Name"
            name="name"
            type="text"
            value={createForm.name}
            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter user name"
            required
          />

          <FormInput
            label="Phone"
            name="phone"
            type="tel"
            value={createForm.phone}
            onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter phone number"
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
            label="Role"
            name="role"
            type="select"
            value={createForm.role}
            onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
            required
          >
            <option value="customer">Customer</option>
            <option value="receptionist">Receptionist</option>
            <option value="technician">Technician</option>
            <option value="storekeeper">Storekeeper</option>
            <option value="center_manager">Center Manager</option>
            <option value="super_admin">Super Admin</option>
          </FormInput>

          <FormInput
            label="Center"
            name="center_id"
            type="select"
            value={createForm.center_id}
            onChange={(e) => setCreateForm(prev => ({ ...prev, center_id: e.target.value }))}
          >
            <option value="">Select Center (Optional)</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
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
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Users