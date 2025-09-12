import React, { useState, useEffect, useCallback } from 'react'
import { Search, Clock, User, Package, Wrench, FileText } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'

const GlobalSearch = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({
    requests: [],
    customers: [],
    spareParts: []
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchHistory, setSearchHistory] = useState([])

  // Debounce search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId
      return (searchQuery) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (searchQuery.trim()) {
            performSearch(searchQuery)
          } else {
            setResults({ requests: [], customers: [], spareParts: [] })
          }
        }, 300)
      }
    })(),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const searchResults = await api.globalSearch(searchQuery)
      setResults(searchResults)

      // Add to search history
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)])
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query)
    }
  }

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery)
    performSearch(historyQuery)
  }

  const clearHistory = () => {
    setSearchHistory([])
  }

  const getTotalResults = () => {
    return results.requests.length + results.customers.length + results.spareParts.length
  }

  const requestColumns = [
    {
      key: 'id',
      header: 'ID',
      accessor: 'id',
      render: (row) => `#${row.id}`
    },
    {
      key: 'issue',
      header: 'Issue',
      accessor: 'issue',
      render: (row) => row.issue?.substring(0, 50) + (row.issue?.length > 50 ? '...' : '')
    },
    {
      key: 'customer',
      header: 'Customer',
      accessor: 'customers',
      render: (row) => row.customers?.name || 'N/A'
    },
    {
      key: 'device',
      header: 'Device',
      accessor: 'devices',
      render: (row) => row.devices?.name || 'N/A'
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
    }
  ]

  const customerColumns = [
    {
      key: 'name',
      header: 'Name',
      accessor: 'name'
    },
    {
      key: 'phone',
      header: 'Phone',
      accessor: 'phone'
    },
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      render: (row) => (
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
      )
    },
    {
      key: 'address',
      header: 'Address',
      accessor: 'address'
    }
  ]

  const sparePartsColumns = [
    {
      key: 'code',
      header: 'Code',
      accessor: 'code'
    },
    {
      key: 'name',
      header: 'Name',
      accessor: 'name'
    },
    {
      key: 'price',
      header: 'Price',
      accessor: 'price',
      render: (row) => `$${row.price?.toFixed(2) || '0.00'}`
    },
    {
      key: 'warranty',
      header: 'Warranty',
      accessor: 'warranty',
      render: (row) => (
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
      )
    }
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

  const searchContainerStyles = {
    position: 'relative',
    marginBottom: '2rem'
  }

  const searchFormStyles = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  }

  const searchInputStyles = {
    flex: 1,
    padding: '1rem 1rem 1rem 3rem',
    border: '2px solid var(--border-primary)',
    borderRadius: 'var(--radius-lg)',
    fontSize: '1rem',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  }

  const searchIconStyles = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    zIndex: 1
  }

  const historyStyles = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1000,
    maxHeight: '200px',
    overflowY: 'auto'
  }

  const historyItemStyles = {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s ease'
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
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  })

  const resultsHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  }

  const resultsTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0
  }

  const countStyles = {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-secondary)',
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-sm)'
  }

  const emptyStateStyles = {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: 'var(--text-muted)'
  }

  const renderResults = () => {
    if (loading) {
      return (
        <div style={emptyStateStyles}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          Searching...
        </div>
      )
    }

    if (!query.trim()) {
      return (
        <div style={emptyStateStyles}>
          <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>Search across all data</h3>
          <p>Enter a search term to find requests, customers, and spare parts</p>
        </div>
      )
    }

    if (getTotalResults() === 0) {
      return (
        <div style={emptyStateStyles}>
          <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No results found</h3>
          <p>Try a different search term or check your spelling</p>
        </div>
      )
    }

    return (
      <>
        {activeTab === 'all' && (
          <>
            {results.requests.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={resultsHeaderStyles}>
                  <h3 style={resultsTitleStyles}>
                    <Wrench size={20} style={{ marginRight: '0.5rem' }} />
                    Maintenance Requests
                  </h3>
                  <span style={countStyles}>{results.requests.length} results</span>
                </div>
                <Table
                  data={results.requests}
                  columns={requestColumns}
                  pagination={false}
                  searchable={false}
                  onRowClick={(row) => window.location.href = `/requests/${row.id}`}
                />
              </div>
            )}

            {results.customers.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={resultsHeaderStyles}>
                  <h3 style={resultsTitleStyles}>
                    <User size={20} style={{ marginRight: '0.5rem' }} />
                    Customers
                  </h3>
                  <span style={countStyles}>{results.customers.length} results</span>
                </div>
                <Table
                  data={results.customers}
                  columns={customerColumns}
                  pagination={false}
                  searchable={false}
                  onRowClick={(row) => window.location.href = `/customers/${row.id}`}
                />
              </div>
            )}

            {results.spareParts.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={resultsHeaderStyles}>
                  <h3 style={resultsTitleStyles}>
                    <Package size={20} style={{ marginRight: '0.5rem' }} />
                    Spare Parts
                  </h3>
                  <span style={countStyles}>{results.spareParts.length} results</span>
                </div>
                <Table
                  data={results.spareParts}
                  columns={sparePartsColumns}
                  pagination={false}
                  searchable={false}
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <div>
            <div style={resultsHeaderStyles}>
              <h3 style={resultsTitleStyles}>
                <Wrench size={20} style={{ marginRight: '0.5rem' }} />
                Maintenance Requests
              </h3>
              <span style={countStyles}>{results.requests.length} results</span>
            </div>
            <Table
              data={results.requests}
              columns={requestColumns}
              pagination={true}
              searchable={false}
              onRowClick={(row) => window.location.href = `/requests/${row.id}`}
              emptyMessage="No maintenance requests found"
            />
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <div style={resultsHeaderStyles}>
              <h3 style={resultsTitleStyles}>
                <User size={20} style={{ marginRight: '0.5rem' }} />
                Customers
              </h3>
              <span style={countStyles}>{results.customers.length} results</span>
            </div>
            <Table
              data={results.customers}
              columns={customerColumns}
              pagination={true}
              searchable={false}
              onRowClick={(row) => window.location.href = `/customers/${row.id}`}
              emptyMessage="No customers found"
            />
          </div>
        )}

        {activeTab === 'spare-parts' && (
          <div>
            <div style={resultsHeaderStyles}>
              <h3 style={resultsTitleStyles}>
                <Package size={20} style={{ marginRight: '0.5rem' }} />
                Spare Parts
              </h3>
              <span style={countStyles}>{results.spareParts.length} results</span>
            </div>
            <Table
              data={results.spareParts}
              columns={sparePartsColumns}
              pagination={true}
              searchable={false}
              emptyMessage="No spare parts found"
            />
          </div>
        )}
      </>
    )
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Global Search</h1>
        <p style={subtitleStyles}>Search across all maintenance requests, customers, and spare parts</p>
      </div>

      {/* Search */}
      <div style={searchContainerStyles}>
        <form onSubmit={handleSearch} style={searchFormStyles}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={searchIconStyles} />
            <input
              type="text"
              placeholder="Search requests, customers, spare parts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={searchInputStyles}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            />
            
            {/* Search History */}
            {searchHistory.length > 0 && showHistory && (
              <div style={historyStyles}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                      Recent Searches
                    </span>
                    <button
                      onClick={clearHistory}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                {searchHistory.map((historyQuery, index) => (
                  <div
                    key={index}
                    style={historyItemStyles}
                    onClick={() => handleHistoryClick(historyQuery)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--bg-secondary)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                    {historyQuery}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            variant="primary"
            icon={<Search size={16} />}
            disabled={!query.trim() || loading}
          >
            Search
          </Button>
        </form>
      </div>

      {/* Results Tabs */}
      {query.trim() && (
        <div style={tabStyles}>
          <button
            style={tabButtonStyles(activeTab === 'all')}
            onClick={() => setActiveTab('all')}
          >
            <FileText size={16} />
            All Results ({getTotalResults()})
          </button>
          <button
            style={tabButtonStyles(activeTab === 'requests')}
            onClick={() => setActiveTab('requests')}
          >
            <Wrench size={16} />
            Requests ({results.requests.length})
          </button>
          <button
            style={tabButtonStyles(activeTab === 'customers')}
            onClick={() => setActiveTab('customers')}
          >
            <User size={16} />
            Customers ({results.customers.length})
          </button>
          <button
            style={tabButtonStyles(activeTab === 'spare-parts')}
            onClick={() => setActiveTab('spare-parts')}
          >
            <Package size={16} />
            Spare Parts ({results.spareParts.length})
          </button>
        </div>
      )}

      {/* Results */}
      {renderResults()}
    </div>
  )
}

export default GlobalSearch