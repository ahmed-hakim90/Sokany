import React, { useState } from 'react'
import { Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../lib/supabase'
import { 
  parseCSVFile, 
  validateCSVData, 
  mapCSVData, 
  generateCSVTemplate, 
  exportEntityData,
  columnMappings,
  validators,
  transformers
} from '../utils/csv'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'

const ImportExport = () => {
  const [activeTab, setActiveTab] = useState('import')
  const [selectedEntity, setSelectedEntity] = useState('customers')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [validation, setValidation] = useState(null)
  const [mappedData, setMappedData] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  const entityTypes = [
    { key: 'customers', label: 'Customers', description: 'Import/export customer data' },
    { key: 'spare_parts', label: 'Spare Parts', description: 'Import/export spare parts catalog' },
    { key: 'inventory', label: 'Inventory', description: 'Import/export inventory levels' },
    { key: 'devices', label: 'Devices', description: 'Import/export device information' },
    { key: 'maintenance_requests', label: 'Maintenance Requests', description: 'Import/export maintenance requests' }
  ]

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setLoading(true)
      setUploadedFile(file)
      
      const data = await parseCSVFile(file)
      setParsedData(data)

      // Validate data
      const mapping = columnMappings[selectedEntity] || {}
      const validator = validators[selectedEntity] || {}
      const validationResult = validateCSVData(data, Object.values(mapping), validator)
      setValidation(validationResult)

      // Map data
      const transformer = transformers[selectedEntity]
      const mapped = mapCSVData(data, mapping, transformer)
      setMappedData(mapped)

      if (validationResult.isValid) {
        toast.success(`File parsed successfully. ${data.length} rows found.`)
      } else {
        toast.error(`File parsed with ${validationResult.errors.length} errors.`)
      }

    } catch (error) {
      console.error('Error parsing file:', error)
      toast.error('Failed to parse CSV file')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!validation?.isValid) {
      toast.error('Please fix validation errors before importing')
      return
    }

    try {
      setLoading(true)

      let result
      switch (selectedEntity) {
        case 'customers':
          result = await api.bulkInsertCustomers(mappedData)
          break
        case 'spare_parts':
          result = await api.bulkInsertParts(mappedData)
          break
        case 'inventory':
          result = await api.bulkInsertInventory(mappedData)
          break
        default:
          throw new Error('Import not supported for this entity type')
      }

      if (result.error) {
        toast.error(result.error.message)
        return
      }

      toast.success(`Successfully imported ${mappedData.length} records`)
      setShowPreview(false)
      setUploadedFile(null)
      setParsedData([])
      setMappedData([])
      setValidation(null)

    } catch (error) {
      console.error('Error importing data:', error)
      toast.error('Failed to import data')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setLoading(true)

      let data
      switch (selectedEntity) {
        case 'customers':
          const { data: customersData } = await api.getCustomers()
          data = customersData || []
          break
        case 'spare_parts':
          const { data: partsData } = await api.getSpareParts()
          data = partsData || []
          break
        case 'inventory':
          const { data: inventoryData } = await api.getInventory()
          data = inventoryData || []
          break
        default:
          throw new Error('Export not supported for this entity type')
      }

      const filename = `${selectedEntity}_export_${new Date().toISOString().split('T')[0]}.csv`
      exportEntityData(data, selectedEntity, filename)
      toast.success('Export completed successfully')

    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate(selectedEntity)
    const filename = `${selectedEntity}_template.csv`
    exportEntityData(template, selectedEntity, filename)
    toast.success('Template downloaded successfully')
  }

  const previewColumns = [
    {
      key: 'index',
      header: '#',
      render: (_, index) => index + 1
    },
    ...Object.entries(columnMappings[selectedEntity] || {}).map(([csvCol, dbCol]) => ({
      key: dbCol,
      header: csvCol.replace('_', ' ').toUpperCase(),
      accessor: dbCol,
      render: (row) => {
        const value = row[dbCol]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return value.toString()
      }
    }))
  ]

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto'
  }

  const headerStyles = {
    marginBottom: '2rem'
  }

  const titleStyles = {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem 0'
  }

  const subtitleStyles = {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    margin: 0
  }

  const tabStyles = {
    display: 'flex',
    borderBottom: '1px solid var(--border-primary)',
    marginBottom: '2rem'
  }

  const tabButtonStyles = (active) => ({
    padding: '1rem 1.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
    borderBottom: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: active ? '600' : '400',
    transition: 'all 0.2s ease'
  })

  const sectionStyles = {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--border-primary)',
    boxShadow: 'var(--shadow-sm)'
  }

  const entityGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  }

  const entityCardStyles = (selected) => ({
    padding: '1rem',
    border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
    borderRadius: 'var(--radius-md)',
    backgroundColor: selected ? 'var(--bg-accent)' : 'var(--bg-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  })

  const uploadAreaStyles = {
    border: '2px dashed var(--border-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: '3rem 2rem',
    textAlign: 'center',
    backgroundColor: 'var(--bg-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }

  const validationStyles = {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }

  const successStyles = {
    ...validationStyles,
    backgroundColor: 'var(--success)20',
    color: 'var(--success)',
    border: '1px solid var(--success)'
  }

  const errorStyles = {
    ...validationStyles,
    backgroundColor: 'var(--error)20',
    color: 'var(--error)',
    border: '1px solid var(--error)'
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Import / Export</h1>
        <p style={subtitleStyles}>Import data from CSV files or export existing data</p>
      </div>

      {/* Tabs */}
      <div style={tabStyles}>
        <button
          style={tabButtonStyles(activeTab === 'import')}
          onClick={() => setActiveTab('import')}
        >
          Import Data
        </button>
        <button
          style={tabButtonStyles(activeTab === 'export')}
          onClick={() => setActiveTab('export')}
        >
          Export Data
        </button>
      </div>

      {/* Entity Selection */}
      <div style={sectionStyles}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
          Select Data Type
        </h3>
        <div style={entityGridStyles}>
          {entityTypes.map(entity => (
            <div
              key={entity.key}
              style={entityCardStyles(selectedEntity === entity.key)}
              onClick={() => setSelectedEntity(entity.key)}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '500' }}>
                {entity.label}
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {entity.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'import' ? (
        <div style={sectionStyles}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
            Import {entityTypes.find(e => e.key === selectedEntity)?.label}
          </h3>

          {/* File Upload */}
          <div style={uploadAreaStyles}>
            <Upload size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Upload CSV File</h4>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>
              Drag and drop your CSV file here or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload').click()}
              disabled={loading}
            >
              Choose File
            </Button>
          </div>

          {/* Download Template */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Button
              variant="ghost"
              icon={<FileText size={16} />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
          </div>

          {/* Validation Results */}
          {validation && (
            <div style={validation.isValid ? successStyles : errorStyles}>
              {validation.isValid ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <div>
                <div style={{ fontWeight: '500' }}>
                  {validation.isValid ? 'Valid' : 'Invalid'} - {parsedData.length} rows
                </div>
                {!validation.isValid && (
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {validation.errors.length} errors found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Button */}
          {parsedData.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Button
                variant="primary"
                onClick={() => setShowPreview(true)}
                disabled={!validation?.isValid}
              >
                Preview Data ({parsedData.length} rows)
              </Button>
            </div>
          )}

          {/* Import Button */}
          {validation?.isValid && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Button
                variant="success"
                onClick={handleImport}
                loading={loading}
                disabled={!validation?.isValid}
              >
                Import Data
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div style={sectionStyles}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
            Export {entityTypes.find(e => e.key === selectedEntity)?.label}
          </h3>

          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Download size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 0.5rem 0' }}>
              Export {entityTypes.find(e => e.key === selectedEntity)?.label} Data
            </h4>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)' }}>
              Download all {entityTypes.find(e => e.key === selectedEntity)?.label.toLowerCase()} data as CSV
            </p>
            <Button
              variant="primary"
              icon={<Download size={16} />}
              onClick={handleExport}
              loading={loading}
            >
              Export Data
            </Button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={`Preview - ${entityTypes.find(e => e.key === selectedEntity)?.label}`}
        size="xl"
      >
        <div style={{ marginBottom: '1rem' }}>
          <Table
            data={mappedData}
            columns={previewColumns}
            pagination={true}
            pageSize={10}
            searchable={true}
            emptyMessage="No data to preview"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button
            variant="outline"
            onClick={() => setShowPreview(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            loading={loading}
          >
            Import Data
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default ImportExport