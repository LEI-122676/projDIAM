import 'react';
import '../css/styles.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <svg className="icon-logo" viewBox="0 0 24 24">
          <path fill="#2E4A35" />
        </svg>
        <span className="brand-name">iFridge</span>
      </div>
      <div className="breadcrumb">Utilizador &gt; Perfil</div>
      <div className="header-right">
        <span className="logout-text">Logout</span>
        <svg className="icon-profile active" viewBox="0 0 24 24">
          <path fill="#2E4A35" />
        </svg>
      </div>
    </header>
  );
};

export default Header;