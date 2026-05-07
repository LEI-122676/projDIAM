import 'react';
import '../css/styles.css';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul className="nav-list">
        <li className="nav-item">
          <svg className="icon" viewBox="0 0 24 24">
            <path />
          </svg>
          <span>Receitas</span>
        </li>
        <li className="nav-item">
          <svg className="icon" viewBox="0 0 24 24">
            <path />
          </svg>
          <span>Eventos</span>
        </li>
        <li className="nav-item">
          <svg className="icon" viewBox="0 0 24 24">
            <path />
          </svg>
          <span>Frigorífico</span>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;