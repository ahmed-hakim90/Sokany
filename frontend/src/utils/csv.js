import Papa from 'papaparse'

// CSV utility functions for import/export

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file to download
 * @param {Object} options - Papa Parse options
 */
export const exportToCSV = (data, filename = 'export.csv', options = {}) => {
  const defaultOptions = {
    header: true,
    delimiter: ',',
    newline: '\n',
    quoteChar: '"',
    escapeChar: '"',
    ...options
  }

  const csv = Papa.unparse(data, defaultOptions)
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Parse CSV file to JSON
 * @param {File} file - CSV file to parse
 * @param {Object} options - Papa Parse options
 * @returns {Promise} Promise that resolves with parsed data
 */
export const parseCSVFile = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`))
        } else {
          resolve(results.data)
        }
      },
      error: (error) => {
        reject(error)
      },
      ...options
    }

    Papa.parse(file, defaultOptions)
  })
}

/**
 * Validate CSV data against expected columns
 * @param {Array} data - Parsed CSV data
 * @param {Array} requiredColumns - Array of required column names
 * @param {Object} validators - Object with column validation functions
 * @returns {Object} Validation result with isValid and errors
 */
export const validateCSVData = (data, requiredColumns = [], validators = {}) => {
  const errors = []
  
  if (!data || data.length === 0) {
    errors.push('No data found in CSV file')
    return { isValid: false, errors }
  }

  // Check for required columns
  const dataColumns = Object.keys(data[0] || {})
  const missingColumns = requiredColumns.filter(col => !dataColumns.includes(col))
  
  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
  }

  // Validate each row
  data.forEach((row, index) => {
    const rowErrors = []
    
    // Check required fields
    requiredColumns.forEach(column => {
      if (!row[column] || row[column].toString().trim() === '') {
        rowErrors.push(`Row ${index + 1}: ${column} is required`)
      }
    })

    // Run custom validators
    Object.entries(validators).forEach(([column, validator]) => {
      if (row[column] && !validator(row[column], row)) {
        rowErrors.push(`Row ${index + 1}: Invalid ${column} value`)
      }
    })

    if (rowErrors.length > 0) {
      errors.push(...rowErrors)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Map CSV data to database format
 * @param {Array} data - Parsed CSV data
 * @param {Object} mapping - Column mapping object
 * @param {Function} transform - Optional transform function
 * @returns {Array} Mapped data
 */
export const mapCSVData = (data, mapping = {}, transform = null) => {
  return data.map(row => {
    const mappedRow = {}
    
    Object.entries(mapping).forEach(([csvColumn, dbColumn]) => {
      if (row[csvColumn] !== undefined) {
        mappedRow[dbColumn] = row[csvColumn]
      }
    })

    // Apply transform function if provided
    if (transform && typeof transform === 'function') {
      return transform(mappedRow, row)
    }

    return mappedRow
  })
}

/**
 * Generate CSV template for specific entity type
 * @param {string} entityType - Type of entity (customers, spare_parts, inventory)
 * @returns {Array} Template data with headers
 */
export const generateCSVTemplate = (entityType) => {
  const templates = {
    customers: [
      {
        name: 'John Doe',
        phone: '+966501234567',
        address: 'Riyadh, Saudi Arabia',
        type: 'consumer'
      }
    ],
    spare_parts: [
      {
        code: 'SP001',
        name: 'Samsung Galaxy S21 Screen',
        price: '150.00',
        warranty: 'true'
      }
    ],
    inventory: [
      {
        part_code: 'SP001',
        center_name: 'Main Service Center',
        qty_added: '50',
        qty_available: '45',
        qty_sold: '5',
        qty_reserved: '0'
      }
    ],
    devices: [
      {
        customer_phone: '+966501234567',
        name: 'Samsung Galaxy S21',
        serial_number: 'SN-S21-001',
        warranty: 'true',
        warranty_expiry: '2024-12-31',
        accessories: '["charger", "earphones", "case"]'
      }
    ],
    maintenance_requests: [
      {
        customer_phone: '+966501234567',
        device_serial: 'SN-S21-001',
        issue: 'Screen cracked after drop',
        under_warranty: 'false',
        service_only: 'false',
        service_fee: '0',
        service_fee_type: 'free'
      }
    ]
  }

  return templates[entityType] || []
}

/**
 * Column mappings for different entity types
 */
export const columnMappings = {
  customers: {
    name: 'name',
    phone: 'phone',
    address: 'address',
    type: 'type'
  },
  spare_parts: {
    code: 'code',
    name: 'name',
    price: 'price',
    warranty: 'warranty'
  },
  inventory: {
    part_code: 'part_code',
    center_name: 'center_name',
    qty_added: 'qty_added',
    qty_available: 'qty_available',
    qty_sold: 'qty_sold',
    qty_reserved: 'qty_reserved'
  },
  devices: {
    customer_phone: 'customer_phone',
    name: 'name',
    serial_number: 'serial_number',
    warranty: 'warranty',
    warranty_expiry: 'warranty_expiry',
    accessories: 'accessories'
  },
  maintenance_requests: {
    customer_phone: 'customer_phone',
    device_serial: 'device_serial',
    issue: 'issue',
    under_warranty: 'under_warranty',
    service_only: 'service_only',
    service_fee: 'service_fee',
    service_fee_type: 'service_fee_type'
  }
}

/**
 * Validators for different entity types
 */
export const validators = {
  customers: {
    name: (value) => value && value.trim().length > 0,
    phone: (value) => /^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, '')),
    type: (value) => ['distributor', 'consumer'].includes(value)
  },
  spare_parts: {
    code: (value) => value && value.trim().length > 0,
    name: (value) => value && value.trim().length > 0,
    price: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0,
    warranty: (value) => ['true', 'false', true, false].includes(value)
  },
  inventory: {
    part_code: (value) => value && value.trim().length > 0,
    center_name: (value) => value && value.trim().length > 0,
    qty_added: (value) => !isNaN(parseInt(value)) && parseInt(value) >= 0,
    qty_available: (value) => !isNaN(parseInt(value)) && parseInt(value) >= 0,
    qty_sold: (value) => !isNaN(parseInt(value)) && parseInt(value) >= 0,
    qty_reserved: (value) => !isNaN(parseInt(value)) && parseInt(value) >= 0
  },
  devices: {
    customer_phone: (value) => /^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, '')),
    name: (value) => value && value.trim().length > 0,
    serial_number: (value) => value && value.trim().length > 0,
    warranty: (value) => ['true', 'false', true, false].includes(value),
    warranty_expiry: (value) => !value || !isNaN(Date.parse(value))
  },
  maintenance_requests: {
    customer_phone: (value) => /^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, '')),
    device_serial: (value) => value && value.trim().length > 0,
    issue: (value) => value && value.trim().length > 0,
    under_warranty: (value) => ['true', 'false', true, false].includes(value),
    service_only: (value) => ['true', 'false', true, false].includes(value),
    service_fee: (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0,
    service_fee_type: (value) => ['free', 'paid'].includes(value)
  }
}

/**
 * Transform functions for different entity types
 */
export const transformers = {
  customers: (row) => ({
    ...row,
    type: row.type || 'consumer'
  }),
  spare_parts: (row) => ({
    ...row,
    price: parseFloat(row.price) || 0,
    warranty: row.warranty === 'true' || row.warranty === true
  }),
  inventory: (row) => ({
    ...row,
    qty_added: parseInt(row.qty_added) || 0,
    qty_available: parseInt(row.qty_available) || 0,
    qty_sold: parseInt(row.qty_sold) || 0,
    qty_reserved: parseInt(row.qty_reserved) || 0
  }),
  devices: (row) => ({
    ...row,
    warranty: row.warranty === 'true' || row.warranty === true,
    warranty_expiry: row.warranty_expiry ? new Date(row.warranty_expiry).toISOString().split('T')[0] : null,
    accessories: row.accessories ? JSON.parse(row.accessories) : []
  }),
  maintenance_requests: (row) => ({
    ...row,
    under_warranty: row.under_warranty === 'true' || row.under_warranty === true,
    service_only: row.service_only === 'true' || row.service_only === true,
    service_fee: parseFloat(row.service_fee) || 0,
    service_fee_type: row.service_fee_type || 'free'
  })
}

/**
 * Preview CSV data with validation
 * @param {Array} data - Parsed CSV data
 * @param {string} entityType - Type of entity
 * @returns {Object} Preview result with validation
 */
export const previewCSVData = (data, entityType) => {
  const mapping = columnMappings[entityType] || {}
  const validator = validators[entityType] || {}
  const transformer = transformers[entityType]
  
  const validation = validateCSVData(data, Object.values(mapping), validator)
  const mappedData = mapCSVData(data, mapping, transformer)
  
  return {
    data: mappedData,
    validation,
    mapping,
    totalRows: data.length,
    validRows: validation.isValid ? data.length : data.length - validation.errors.length
  }
}

/**
 * Export specific entity data to CSV
 * @param {Array} data - Data to export
 * @param {string} entityType - Type of entity
 * @param {string} filename - Filename for export
 */
export const exportEntityData = (data, entityType, filename) => {
  const mapping = columnMappings[entityType] || {}
  const reverseMapping = Object.fromEntries(
    Object.entries(mapping).map(([key, value]) => [value, key])
  )
  
  const exportData = data.map(row => {
    const exportRow = {}
    Object.entries(reverseMapping).forEach(([dbColumn, csvColumn]) => {
      if (row[dbColumn] !== undefined) {
        exportRow[csvColumn] = row[dbColumn]
      }
    })
    return exportRow
  })
  
  exportToCSV(exportData, filename)
}

// Default export
export default {
  exportToCSV,
  parseCSVFile,
  validateCSVData,
  mapCSVData,
  generateCSVTemplate,
  columnMappings,
  validators,
  transformers,
  previewCSVData,
  exportEntityData
}