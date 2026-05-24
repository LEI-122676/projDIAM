import 'react';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import '../../css/styles.css';

const PopupModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText, singleButton = false }) => {
    const { t } = useLanguage();
    if (!isOpen) return null;

    const finalConfirmText = confirmText || t('comum.ok');
    const finalCancelText = cancelText || t('comum.cancelar');

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h3 className="popup-title">
                    {title}
                </h3>
                <p className="popup-message">
                    {message}
                </p>
                <div className="popup-actions">
                    {!singleButton && (
                        <button
                            onClick={onCancel}
                            className="btn-popup-cancel"
                        >
                            {finalCancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className="btn-popup-confirm"
                    >
                        {finalConfirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopupModal;
