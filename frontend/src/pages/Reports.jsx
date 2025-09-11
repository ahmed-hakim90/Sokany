import React, { useState, useEffect } from 'react'
import { BarChart3, Download, Calendar, Filter, TrendingUp, Package, DollarSign } from 'lucide-react'
import { api } from '../lib/supabase'
import Button from '../components/common/Button'
import Table from '../components/common/Table'
import toast from 'react-hot-toast'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    center_id: '',
    report_type: 'item_movement'
  })

  useEffect(() => {
    loadReports()
  }, [filters])

  const loadReports = async () => {
    try {
      setLoading(true)
      
      // For now, we'll simulate report data
      // In a real app, you'd call specific report APIs
      const mockReports = [
        {
          id: 1,
          type: 'item_movement',
          title: 'Item Movement Report',
          description: 'Stock movements for selected period',
          data: [
            { part: 'Samsung Galaxy S21 Screen', added: 50, issued: 5, returned: 2, scrapped: 1 },
            { part: 'iPhone 12 Battery', added: 30, issued: 3, returned: 1, scrapped: 0 },
            { part: 'MacBook Pro Charger', added: 20, issued: 2, returned: 0, scrapped: 0 }
          ]
        }
      ]
      
      setReports(mockReports)

    } catch (error) {
      console.error('Error loading reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = (reportType) => {
    // In a real app, this would generate and download the report
    toast.success(`${reportType} report exported successfully`)
  }

  const getReportColumns = (reportType) => {
    switch (reportType) {
      case 'item_movement':
        return [
          {
            key: 'part',
            header: 'Part',
            accessor: 'part'
          },
          {
            key: 'added',
            header: 'Added',
            accessor: 'added',
            render: (row) => (
              <span style={{ color: 'var(--success)', fontWeight: '500' }}>
                +{row.added}
              </span>
            )
          },
          {
            key: 'issued',
            header: 'Issued',
            accessor: 'issued',
            render: (row) => (
              <span style={{ color: 'var(--warning)', fontWeight: '500' }}>
                -{row.issued}
              </span>
            )
          },
          {
            key: 'returned',
            header: 'Returned',
            accessor: 'returned',
            render: (row) => (
              <span style={{ color: 'var(--info)', fontWeight: '500' }}>
                +{row.returned}
              </span>
            )
          },
          {
            key: 'scrapped',
            header: 'Scrapped',
            accessor: 'scrapped',
            render: (row) => (
              <span style={{ color: 'var(--error)', fontWeight: '500' }}>
                -{row.scrapped}
              </span>
            )
          },
          {
            key: 'net',
            header: 'Net Change',
            render: (row) => {
              const net = row.added + row.returned - row.issued - row.scrapped
              return (
                <span style={{ 
                  color: net >= 0 ? 'var(--success)' : 'var(--error)', 
                  fontWeight: '600' 
                }}>
                  {net >= 0 ? '+' : ''}{net}
                </span>
              )
            }
          }
        ]
      default:
        return []
    }
  }

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

  const reportCardStyles = {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: 'var(--shadow-sm)'
  }

  const reportHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  }

  const reportTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0
  }

  const reportDescriptionStyles = {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    margin: '0 0 1.5rem 0'
  }

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  }

  const statCardStyles = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-md)',
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

  const getReportStats = (report) => {
    if (report.type === 'item_movement') {
      const totalAdded = report.data.reduce((sum, item) => sum + item.added, 0)
      const totalIssued = report.data.reduce((sum, item) => sum + item.issued, 0)
      const totalReturned = report.data.reduce((sum, item) => sum + item.returned, 0)
      const totalScrapped = report.data.reduce((sum, item) => sum + item.scrapped, 0)
      
      return { totalAdded, totalIssued, totalReturned, totalScrapped }
    }
    return { totalAdded: 0, totalIssued: 0, totalReturned: 0, totalScrapped: 0 }
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>Reports</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            icon={<Calendar size={16} />}
            onClick={() => {
              const today = new Date().toISOString().split('T')[0]
              setFilters(prev => ({ ...prev, date_from: today, date_to: today }))
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            icon={<Calendar size={16} />}
            onClick={() => {
              const today = new Date()
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
              setFilters(prev => ({ 
                ...prev, 
                date_from: weekAgo.toISOString().split('T')[0], 
                date_to: today.toISOString().split('T')[0] 
              }))
            }}
          >
            Last 7 Days
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div style={filtersStyles}>
        <div style={filterGroupStyles}>
          <label style={labelStyles}>Report Type</label>
          <select
            value={filters.report_type}
            onChange={(e) => setFilters(prev => ({ ...prev, report_type: e.target.value }))}
            style={selectStyles}
          >
            <option value="item_movement">Item Movement Report</option>
            <option value="sales_summary">Sales Summary</option>
            <option value="maintenance_summary">Maintenance Summary</option>
            <option value="inventory_summary">Inventory Summary</option>
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

      {/* Reports */}
      {reports.map(report => {
        const stats = getReportStats(report)
        return (
          <div key={report.id} style={reportCardStyles}>
            <div style={reportHeaderStyles}>
              <div>
                <h3 style={reportTitleStyles}>{report.title}</h3>
                <p style={reportDescriptionStyles}>{report.description}</p>
              </div>
              <Button
                variant="outline"
                icon={<Download size={16} />}
                onClick={() => handleExportReport(report.type)}
              >
                Export
              </Button>
            </div>

            {/* Report Stats */}
            <div style={statsGridStyles}>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{stats.totalAdded}</div>
                <div style={statLabelStyles}>Total Added</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{stats.totalIssued}</div>
                <div style={statLabelStyles}>Total Issued</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{stats.totalReturned}</div>
                <div style={statLabelStyles}>Total Returned</div>
              </div>
              <div style={statCardStyles}>
                <div style={statValueStyles}>{stats.totalScrapped}</div>
                <div style={statLabelStyles}>Total Scrapped</div>
              </div>
            </div>

            {/* Report Data */}
            <Table
              data={report.data}
              columns={getReportColumns(report.type)}
              pagination={false}
              searchable={false}
              emptyMessage="No data available"
            />
          </div>
        )
      })}

      {reports.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <BarChart3 size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Reports Available</h3>
          <p>Select a report type and date range to generate reports</p>
        </div>
      )}
    </div>
  )
}

export default Reports