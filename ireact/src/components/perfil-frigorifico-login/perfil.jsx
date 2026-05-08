import 'react';
import Header from '../maincomponents/header.jsx'; // Ajusta o caminho se necessário
import Sidebar from '../maincomponents/sidebar.jsx'; // Ajusta o caminho se necessário
import '../../css/styles.css';

const Perfil = () => {
  return (
    <div className="body-wrapper">
      <Header />

      <div className="main-wrapper">
        <Sidebar />

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
                    <path fill="#D1CDBC" />
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

export default Perfil;