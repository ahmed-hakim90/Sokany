import React, { useState, useEffect } from 'react'
import { Package, Plus, Minus, RotateCcw, Trash2, AlertTriangle } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import Modal from '../components/common/Modal'
import FormInput from '../components/common/FormInput'
import toast from 'react-hot-toast'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [showIssueStockModal, setShowIssueStockModal] = useState(false)
  const [showScrapModal, setShowScrapModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [spareParts, setSpareParts] = useState([])
  const [centers, setCenters] = useState([])
  const [filters, setFilters] = useState({
    center_id: '',
    low_stock: false
  })

  const [stockForm, setStockForm] = useState({
    part_id: '',
    center_id: '',
    quantity: '',
    reason: ''
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const params = {
        center_id: filters.center_id || undefined,
        low_stock: filters.low_stock || undefined
      }

      const { data: inventoryData } = await api.getInventory(params)
      setInventory(inventoryData || [])

      // Load spare parts and centers for forms
      const { data: partsData } = await api.getSpareParts()
      setSpareParts(partsData || [])

      const { data: centersData } = await api.supabase
        .from('centers')
        .select('id, name')
      setCenters(centersData || [])

    } catch (error) {
      console.error('Error loading inventory:', error)
      toast.error('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStock = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await api.addStock(
        parseInt(stockForm.part_id),
        parseInt(stockForm.center_id),
        parseInt(stockForm.quantity),
        // Get current user ID - in real app, this would come from auth context
        '00000000-0000-0000-0000-000000000000' // Placeholder
      )
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Stock added successfully')
      setShowAddStockModal(false)
      setStockForm({ part_id: '', center_id: '', quantity: '', reason: '' })
      loadData()
    } catch (error) {
      console.error('Error adding stock:', error)
      toast.error('Failed to add stock')
    }
  }

  const handleIssueStock = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await api.issueStock(
        parseInt(stockForm.part_id),
        parseInt(stockForm.center_id),
        parseInt(stockForm.quantity),
        '00000000-0000-0000-0000-000000000000', // Placeholder user ID
        null // No related request
      )
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Stock issued successfully')
      setShowIssueStockModal(false)
      setStockForm({ part_id: '', center_id: '', quantity: '', reason: '' })
      loadData()
    } catch (error) {
      console.error('Error issuing stock:', error)
      toast.error('Failed to issue stock')
    }
  }

  const handleMarkScrap = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await api.markScrap(
        parseInt(stockForm.part_id),
        parseInt(stockForm.center_id),
        parseInt(stockForm.quantity),
        stockForm.reason,
        null, // No related request
        '00000000-0000-0000-0000-000000000000' // Placeholder user ID
      )
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Parts marked as scrap successfully')
      setShowScrapModal(false)
      setStockForm({ part_id: '', center_id: '', quantity: '', reason: '' })
      loadData()
    } catch (error) {
      console.error('Error marking scrap:', error)
      toast.error('Failed to mark parts as scrap')
    }
  }

  const getStockLevelColor = (qty) => {
    if (qty === 0) return 'var(--error)'
    if (qty < 10) return 'var(--warning)'
    if (qty < 25) return 'var(--info)'
    return 'var(--success)'
  }

  const getStockLevelText = (qty) => {
    if (qty === 0) return 'Out of Stock'
    if (qty < 10) return 'Low Stock'
    if (qty < 25) return 'Medium Stock'
    return 'In Stock'
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
      key: 'qty_available',
      header: 'Available',
      accessor: 'qty_available',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>
            {row.qty_available}
          </span>
          <span style={{
            padding: '0.25rem 0.5rem',
            backgroundColor: getStockLevelColor(row.qty_available),
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {getStockLevelText(row.qty_available)}
          </span>
        </div>
      )
    },
    {
      key: 'qty_added',
      header: 'Added',
      accessor: 'qty_added',
      render: (row) => row.qty_added?.toLocaleString() || '0'
    },
    {
      key: 'qty_sold',
      header: 'Sold',
      accessor: 'qty_sold',
      render: (row) => row.qty_sold?.toLocaleString() || '0'
    },
    {
      key: 'qty_reserved',
      header: 'Reserved',
      accessor: 'qty_reserved',
      render: (row) => row.qty_reserved?.toLocaleString() || '0'
    },
    {
      key: 'price',
      header: 'Price',
      accessor: 'spare_parts',
      render: (row) => `$${row.spare_parts?.price?.toFixed(2) || '0.00'}`
    },
    {
      key: 'warranty',
      header: 'Warranty',
      accessor: 'spare_parts',
      render: (row) => (
        <span style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: row.spare_parts?.warranty ? 'var(--success)' : 'var(--muted)',
          color: 'white',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          {row.spare_parts?.warranty ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <Button
            variant="outline"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => {
              setSelectedItem(row)
              setStockForm(prev => ({ ...prev, part_id: row.part_id, center_id: row.center_id }))
              setShowAddStockModal(true)
            }}
            title="Add Stock"
          />
          <Button
            variant="outline"
            size="sm"
            icon={<Minus size={14} />}
            onClick={() => {
              setSelectedItem(row)
              setStockForm(prev => ({ ...prev, part_id: row.part_id, center_id: row.center_id }))
              setShowIssueStockModal(true)
            }}
            title="Issue Stock"
            disabled={row.qty_available === 0}
          />
          <Button
            variant="outline"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => {
              setSelectedItem(row)
              setStockForm(prev => ({ ...prev, part_id: row.part_id, center_id: row.center_id }))
              setShowScrapModal(true)
            }}
            title="Mark as Scrap"
            disabled={row.qty_available === 0}
          />
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
    const totalItems = inventory.length
    const lowStockItems = inventory.filter(item => item.qty_available < 10).length
    const outOfStockItems = inventory.filter(item => item.qty_available === 0).length
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.qty_available * (item.spare_parts?.price || 0)), 0
    )

    return { totalItems, lowStockItems, outOfStockItems, totalValue }
  }

  const stats = getStats()

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Inventory Management</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setShowAddStockModal(true)}
          >
            Add Stock
          </Button>
          <Button
            variant="outline"
            icon={<Minus size={16} />}
            onClick={() => setShowIssueStockModal(true)}
          >
            Issue Stock
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={statsStyles}>
        <div style={statCardStyles}>
          <div style={statValueStyles}>{stats.totalItems}</div>
          <div style={statLabelStyles}>Total Items</div>
        </div>
        <div style={statCardStyles}>
          <div style={{ ...statValueStyles, color: 'var(--warning)' }}>{stats.lowStockItems}</div>
          <div style={statLabelStyles}>Low Stock Items</div>
        </div>
        <div style={statCardStyles}>
          <div style={{ ...statValueStyles, color: 'var(--error)' }}>{stats.outOfStockItems}</div>
          <div style={statLabelStyles}>Out of Stock</div>
        </div>
        <div style={statCardStyles}>
          <div style={statValueStyles}>${stats.totalValue.toFixed(2)}</div>
          <div style={statLabelStyles}>Total Value</div>
        </div>
      </div>

      {/* Filters */}
      <div style={filtersStyles}>
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

        <div style={filterGroupStyles}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={filters.low_stock}
              onChange={(e) => setFilters(prev => ({ ...prev, low_stock: e.target.checked }))}
            />
            <span style={labelStyles}>Low Stock Only</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <Table
        data={inventory}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={20}
        emptyMessage="No inventory items found"
      />

      {/* Add Stock Modal */}
      <Modal
        isOpen={showAddStockModal}
        onClose={() => setShowAddStockModal(false)}
        title="Add Stock"
      >
        <form onSubmit={handleAddStock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Part"
            name="part_id"
            type="select"
            value={stockForm.part_id}
            onChange={(e) => setStockForm(prev => ({ ...prev, part_id: e.target.value }))}
            required
          >
            <option value="">Select Part</option>
            {spareParts.map(part => (
              <option key={part.id} value={part.id}>
                {part.code} - {part.name}
              </option>
            ))}
          </FormInput>

          <FormInput
            label="Center"
            name="center_id"
            type="select"
            value={stockForm.center_id}
            onChange={(e) => setStockForm(prev => ({ ...prev, center_id: e.target.value }))}
            required
          >
            <option value="">Select Center</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </FormInput>

          <FormInput
            label="Quantity"
            name="quantity"
            type="number"
            value={stockForm.quantity}
            onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
            required
            min="1"
          />

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddStockModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Add Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* Issue Stock Modal */}
      <Modal
        isOpen={showIssueStockModal}
        onClose={() => setShowIssueStockModal(false)}
        title="Issue Stock"
      >
        <form onSubmit={handleIssueStock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Part"
            name="part_id"
            type="select"
            value={stockForm.part_id}
            onChange={(e) => setStockForm(prev => ({ ...prev, part_id: e.target.value }))}
            required
          >
            <option value="">Select Part</option>
            {spareParts.map(part => (
              <option key={part.id} value={part.id}>
                {part.code} - {part.name}
              </option>
            ))}
          </FormInput>

          <FormInput
            label="Center"
            name="center_id"
            type="select"
            value={stockForm.center_id}
            onChange={(e) => setStockForm(prev => ({ ...prev, center_id: e.target.value }))}
            required
          >
            <option value="">Select Center</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </FormInput>

          <FormInput
            label="Quantity"
            name="quantity"
            type="number"
            value={stockForm.quantity}
            onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
            required
            min="1"
          />

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowIssueStockModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Issue Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mark Scrap Modal */}
      <Modal
        isOpen={showScrapModal}
        onClose={() => setShowScrapModal(false)}
        title="Mark as Scrap"
      >
        <form onSubmit={handleMarkScrap} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Part"
            name="part_id"
            type="select"
            value={stockForm.part_id}
            onChange={(e) => setStockForm(prev => ({ ...prev, part_id: e.target.value }))}
            required
          >
            <option value="">Select Part</option>
            {spareParts.map(part => (
              <option key={part.id} value={part.id}>
                {part.code} - {part.name}
              </option>
            ))}
          </FormInput>

          <FormInput
            label="Center"
            name="center_id"
            type="select"
            value={stockForm.center_id}
            onChange={(e) => setStockForm(prev => ({ ...prev, center_id: e.target.value }))}
            required
          >
            <option value="">Select Center</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </FormInput>

          <FormInput
            label="Quantity"
            name="quantity"
            type="number"
            value={stockForm.quantity}
            onChange={(e) => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
            required
            min="1"
          />

          <FormInput
            label="Reason"
            name="reason"
            type="textarea"
            value={stockForm.reason}
            onChange={(e) => setStockForm(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Reason for scrapping..."
            required
          />

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScrapModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
            >
              Mark as Scrap
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Inventory