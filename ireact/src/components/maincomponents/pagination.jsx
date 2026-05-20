import React from 'react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    return (
        <div className="pagination-container flex-center mt-30 gap-20-pb30">
            <button
                className="btn-popup-confirm pagination-btn"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
            >
                Anterior
            </button>
            
            <span className="pagination-page-display">
                Página
                <select
                    value={currentPage}
                    onChange={(e) => onPageChange(Number(e.target.value))}
                    className="page-select-dropdown"
                >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
                de {totalPages}
            </span>
            
            <button
                className="btn-popup-confirm pagination-btn"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Seguinte
            </button>
        </div>
    );
};

export default Pagination;
