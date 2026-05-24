import React from 'react';
import iconeLupa from '../../assets/lupa.svg';
import '../../css/styles.css';

const SearchBar = ({ value, onChange, placeholder, onSubmit, buttonText, className = "", inputClassName = "search-box text-black" }) => {
    return (
        <form onSubmit={onSubmit || ((e) => e.preventDefault())} className={`recipes-search-container ${className}`}>
            <input
                type="text"
                placeholder={placeholder}
                className={`main-search-input ${inputClassName}`}
                value={value}
                onChange={onChange}
            />
            {buttonText ? (
                <button type="button" className="btn-search-home" onClick={onSubmit}>
                  {buttonText}
                </button>
            ) : (
                <img src={iconeLupa} alt="Lupa" className="recipe-icon-svg search-icon-pos" />
            )}
        </form>
    );
};

export default SearchBar;
