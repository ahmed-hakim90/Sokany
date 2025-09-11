import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, Filter, Download } from 'lucide-react'

const Table = ({
  data = [],
  columns = [],
  searchable = false,
  filterable = false,
  sortable = true,
  pagination = true,
  pageSize = 10,
  onRowClick,
  onExport,
  className = '',
  style = {},
  emptyMessage = 'No data available',
  loading = false,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({})

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm && searchable) {
      filtered = filtered.filter(row =>
        columns.some(col => {
          const value = col.accessor ? row[col.accessor] : col.render(row)
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => {
          const cellValue = row[key]
          return cellValue?.toString().toLowerCase().includes(value.toLowerCase())
        })
      }
    })

    return filtered
  }, [data, searchTerm, filters, columns, searchable])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key) => {
    if (!sortable) return

    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1)
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    ...style
  }

  const headerStyles = {
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-primary)'
  }

  const cellStyles = {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid var(--border-primary)',
    fontSize: '0.875rem'
  }

  const headerCellStyles = {
    ...cellStyles,
    fontWeight: '600',
    color: 'var(--text-primary)',
    cursor: sortable ? 'pointer' : 'default',
    userSelect: 'none',
    position: 'relative'
  }

  const rowStyles = {
    cursor: onRowClick ? 'pointer' : 'default',
    transition: 'background-color 0.2s ease'
  }

  const emptyStyles = {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: 'var(--text-muted)',
    fontSize: '0.875rem'
  }

  const loadingStyles = {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: 'var(--text-muted)',
    fontSize: '0.875rem'
  }

  const paginationStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-primary)'
  }

  const pageButtonStyles = {
    padding: '0.5rem 0.75rem',
    margin: '0 0.25rem',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease'
  }

  const activePageButtonStyles = {
    ...pageButtonStyles,
    backgroundColor: 'var(--accent-primary)',
    color: 'white',
    borderColor: 'var(--accent-primary)'
  }

  if (loading) {
    return (
      <div className={`table-container ${className}`}>
        <div style={loadingStyles}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className={`table-container ${className}`}>
      {/* Search and filters */}
      {(searchable || filterable) && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {searchable && (
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search 
                size={16} 
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {filterable && columns.map(col => (
            col.filterable && (
              <div key={col.key} style={{ minWidth: '150px' }}>
                <select
                  value={filters[col.key] || ''}
                  onChange={(e) => handleFilterChange(col.key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                >
                  <option value="">All {col.header}</option>
                  {[...new Set(data.map(row => col.accessor ? row[col.accessor] : col.render(row)))].map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
            )
          ))}

          {onExport && (
            <button
              onClick={onExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Download size={16} />
              Export
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div style={{ overflow: 'auto' }}>
        <table style={tableStyles} {...props}>
          <thead style={headerStyles}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={headerCellStyles}
                  onClick={() => handleSort(column.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {column.header}
                    {sortable && sortConfig.key === column.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={emptyStyles}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  style={rowStyles}
                  onClick={() => onRowClick && onRowClick(row, index)}
                  onMouseEnter={(e) => {
                    if (onRowClick) {
                      e.target.style.backgroundColor = 'var(--bg-secondary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) {
                      e.target.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {columns.map((column) => (
                    <td key={column.key} style={cellStyles}>
                      {column.render ? column.render(row, index) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div style={paginationStyles}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...pageButtonStyles,
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={page === currentPage ? activePageButtonStyles : pageButtonStyles}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...pageButtonStyles,
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table