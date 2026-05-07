import React from 'react';
import './style.css'; // Certifica-te de que o ficheiro CSS está na mesma pasta

const ProfilePage = () => {
  return (
    <div className="body-wrapper">
      {/* 1. HEADER */}
      <header className="header">
        <div className="logo">
          <svg className="icon-logo" viewBox="0 0 24 24">
            <path fill="#2E4A35" d="M11,9H9V2H7V9H5V2H3V9c0,2.21 1.79,4 4,4v9h2v-9c2.21,0 4,-1.79 4,-4V2h-2V9M16,10v12h2V10h3V2H16V10Z" />
          </svg>
          <span className="brand-name">iFridge</span>
        </div>
        <div className="breadcrumb">Utilizador &gt; Perfil</div>
        <div className="header-right">
          <span className="logout-text">Logout</span>
          <svg className="icon-profile active" viewBox="0 0 24 24">
            <path fill="#2E4A35" d="M12,19.2C9.5,19.2 7.29,17.92 6,16C6.03,14 10,12.9 12,12.9C14,12.9 17.97,14 18,16C16.71,17.92 14.5,19.2 12,19.2M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
        </div>
      </header>

      <div className="main-wrapper">
        {/* 2. SIDEBAR */}
        <nav className="sidebar">
          <ul className="nav-list">
            <li className="nav-item">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M11,9H9V2H7V9H5V2H3V9c0,2.21 1.79,4 4,4v9h2v-9c2.21,0 4,-1.79 4,-4V2h-2V9M16,10v12h2V10h3V2H16V10Z" />
              </svg>
              <span>Receitas</span>
            </li>
            <li className="nav-item">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
              </svg>
              <span>Eventos</span>
            </li>
            <li className="nav-item">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M7,2H17A2,2 0 0,1 19,4V19A3,3 0 0,1 16,22H8A3,3 0 0,1 5,19V4A2,2 0 0,1 7,2M7,4V9H17V4H7M7,11V19A1,1 0 0,0 8,20H16A1,1 0 0,0 17,19V11H7Z" />
              </svg>
              <span>Frigorífico</span>
            </li>
          </ul>
        </nav>

        {/* 3. CONTEÚDO PRINCIPAL */}
        <main className="content-profile">
          <div className="profile-grid">

            <div className="profile-header-section">
              <h1 className="page-title-underline">O meu perfil</h1>
              <div className="profile-shortcuts">
                <div className="shortcut-card">O meu Frigorífico</div>
                <div className="shortcut-card">As minhas Receitas</div>
                <div className="shortcut-card">As minhas Comunidades</div>
                <div className="shortcut-card">Os meus Eventos</div>
              </div>
            </div>

            <div className="profile-details-card">
              <div className="user-main-info">
                <div className="user-avatar-large">
                  <svg viewBox="0 0 24 24">
                    <path fill="#D1CDBC" d="M12,19.2C9.5,19.2 7.29,17.92 6,16C6.03,14 10,12.9 12,12.9C14,12.9 17.97,14 18,16C16.71,17.92 14.5,19.2 12,19.2M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                </div>
                <div className="user-names">
                  <h2>John Doe</h2>
                  <p>@JohnDoe</p>
                </div>
              </div>

              <div className="user-extra-info">
                <h3>Info:</h3>
                <ul>
                  <li>- Info A</li>
                  <li>- Info B</li>
                  <li>- Info C</li>
                  <li>- Info D</li>
                  <li>- Info E</li>
                </ul>
              </div>

              <div className="profile-actions">
                <button className="btn-profile-pill">Editar perfil</button>
                <button className="btn-profile-pill secondary">Log Out</button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;