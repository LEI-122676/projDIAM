import { useLanguage } from '../../linguagem/LanguageContext';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const { t } = useLanguage();
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    return (
        <div className="pagination-container flex-center mt-30 gap-20-pb30">
            <button
                className="btn-popup-confirm pagination-btn"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
            >
                {t('comum.anterior')}
            </button>
            
            <span className="pagination-page-display">
                {t('comum.pagina')}
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
                {t('comum.de')} {totalPages}
            </span>
            
            <button
                className="btn-popup-confirm pagination-btn"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                {t('comum.seguinte')}
            </button>
        </div>
    );
};

export default Pagination;
