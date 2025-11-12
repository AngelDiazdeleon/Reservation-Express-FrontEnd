import React, { useState } from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  pagination?: boolean;
  searchable?: boolean;
  onRowClick?: (row: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  pagination = true,
  searchable = true,
  onRowClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filtrar datos basado en searchTerm
  const filteredData = data.filter(row =>
    columns.some(column =>
      String(row[column.key]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Ordenar datos
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pagination 
    ? sortedData.slice(indexOfFirstItem, indexOfLastItem)
    : sortedData;
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Manejar ordenamiento
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Renderizar header de tabla
  const renderTableHeader = () => (
    <thead>
      <tr>
        {columns.map(column => (
          <th
            key={column.key}
            onClick={() => column.sortable && handleSort(column.key)}
            className={column.sortable ? 'sortable' : ''}
          >
            <div className="header-content">
              {column.label}
              {column.sortable && (
                <span className="sort-indicator">
                  {sortConfig?.key === column.key && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  // Renderizar cuerpo de tabla
  const renderTableBody = () => (
    <tbody>
      {currentItems.map((row, index) => (
        <tr
          key={index}
          onClick={() => onRowClick && onRowClick(row)}
          className={onRowClick ? 'clickable' : ''}
        >
          {columns.map(column => (
            <td key={column.key}>
              {column.render ? column.render(row[column.key], row) : row[column.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  // Renderizar paginación
  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <div className="pagination-info">
          Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedData.length)} de {sortedData.length}
        </div>
        
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          {pageNumbers.map(number => (
            <button
              key={number}
              className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </button>
          ))}

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="data-table-wrapper">
      {/* Barra de búsqueda */}
      {searchable && (
        <div className="table-search">
          <div className="search-input-wrapper">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="table-container">
        <table className="data-table">
          {renderTableHeader()}
          {renderTableBody()}
        </table>

        {currentItems.length === 0 && (
          <div className="empty-state">
            <span className="material-symbols-outlined">search_off</span>
            <p>No se encontraron resultados</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {renderPagination()}
    </div>
  );
};

export default DataTable;