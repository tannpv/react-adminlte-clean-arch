import React from 'react'

export function Pagination({ currentPage, totalPages, onPageChange, isLoading }) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages around current page
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      
      // Adjust start if we're near the end
      const adjustedStart = Math.max(1, endPage - maxVisiblePages + 1)
      
      for (let i = adjustedStart; i <= endPage; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav aria-label="Search results pagination">
      <ul className="pagination justify-content-center">
        {/* Previous button */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            aria-label="Previous page"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </li>

        {/* First page if not visible */}
        {pageNumbers[0] > 1 && (
          <>
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => onPageChange(1)}
                disabled={isLoading}
              >
                1
              </button>
            </li>
            {pageNumbers[0] > 2 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
          </>
        )}

        {/* Page numbers */}
        {pageNumbers.map(pageNumber => (
          <li
            key={pageNumber}
            className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(pageNumber)}
              disabled={isLoading}
            >
              {pageNumber}
            </button>
          </li>
        ))}

        {/* Last page if not visible */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => onPageChange(totalPages)}
                disabled={isLoading}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        {/* Next button */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            aria-label="Next page"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>

      {/* Page info */}
      <div className="text-center mt-2">
        <small className="text-muted">
          Page {currentPage} of {totalPages}
        </small>
      </div>
    </nav>
  )
}
