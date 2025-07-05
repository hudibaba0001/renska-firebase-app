import React, { useState } from 'react'
import { Table, Badge, Button, TextInput, Dropdown } from 'flowbite-react'
import { 
  MagnifyingGlassIcon, 
  EllipsisHorizontalIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

export default function DataTable({ 
  columns, 
  data, 
  title,
  subtitle,
  searchable = true,
  filterable = true,
  sortable = true,
  actions,
  onRowClick,
  emptyState
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter data based on search query
  const filteredData = data.filter(item => {
    if (!searchQuery) return true
    
    return columns.some(column => {
      const value = item[column.key]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return false
    })
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Paginate data
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const renderCellContent = (item, column) => {
    const value = item[column.key]
    
    if (column.render) {
      return column.render(value, item)
    }
    
    if (column.type === 'badge') {
      const badgeColor = column.badgeColor ? column.badgeColor(value, item) : 'info'
      return <Badge color={badgeColor}>{value}</Badge>
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString()
    }
    
    return value
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-8 text-center">
          {emptyState}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      {(title || subtitle || searchable || filterable) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900 font-mono">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            
            <div className="flex items-center space-x-3">
              {searchable && (
                <div className="relative w-64">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <TextInput
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    sizing="sm"
                  />
                </div>
              )}
              
              {filterable && (
                <Button color="gray" size="sm">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <Table.Head>
            {columns.map((column) => (
              <Table.HeadCell 
                key={column.key}
                className={`font-medium text-gray-700 font-mono ${
                  sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
                onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {sortable && column.sortable !== false && sortField === column.key && (
                    sortDirection === 'asc' ? 
                      <ArrowUpIcon className="h-4 w-4" /> : 
                      <ArrowDownIcon className="h-4 w-4" />
                  )}
                </div>
              </Table.HeadCell>
            ))}
            {actions && <Table.HeadCell>Actions</Table.HeadCell>}
          </Table.Head>
          
          <Table.Body>
            {paginatedData.map((item, index) => (
              <Table.Row 
                key={item.id || index}
                className={`${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                } border-gray-200`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <Table.Cell key={column.key} className="font-mono text-sm">
                    {renderCellContent(item, column)}
                  </Table.Cell>
                ))}
                
                {actions && (
                  <Table.Cell>
                    <Dropdown
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <Button color="gray" size="xs" className="p-1">
                          <EllipsisHorizontalIcon className="h-4 w-4" />
                        </Button>
                      )}
                    >
                      {actions.map((action, actionIndex) => (
                        <Dropdown.Item 
                          key={actionIndex}
                          onClick={() => action.onClick(item)}
                          icon={action.icon}
                        >
                          {action.label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown>
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              color="gray" 
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-700 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button 
              color="gray" 
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 