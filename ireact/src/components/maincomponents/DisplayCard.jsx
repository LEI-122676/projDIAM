import React from 'react';

const DisplayCard = ({ 
    title, 
    imageUrl, 
    fallbackText, 
    fallbackImage, 
    rating, 
    onClick 
}) => {
    return (
        <div 
            className="recipe-card-premium cursor-pointer relative-container"
            onClick={onClick}
        >
            {rating !== undefined && rating !== null && (
                <div className="card-rating-badge">
                    ⭐ {rating || '0.0'}
                </div>
            )}

            <div className="recipe-image-placeholder">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="cover-image"
                    />
                ) : fallbackImage ? (
                    <img
                        src={fallbackImage}
                        alt={title}
                        className="cover-image"
                    />
                ) : (
                    <span className="recipe-icon-large">{fallbackText || '🍲'}</span>
                )}
            </div>
            
            <div className="recipe-card-footer">
                <span className="ingredient-name">{title}</span>
            </div>
        </div>
    );
};

export default DisplayCard;
