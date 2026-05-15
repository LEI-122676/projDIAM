import React from 'react';
import '../../css/styles.css';

const PopupModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancelar", singleButton = false }) => {
    if (!isOpen) return null;

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
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className="btn-popup-confirm"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopupModal;
