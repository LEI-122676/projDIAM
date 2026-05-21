import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './maincomponents/header.jsx';
import Sidebar from './maincomponents/sidebar.jsx';
import Slideshow from './maincomponents/Slideshow.jsx';
import '../css/styles.css';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/receitas?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="body-wrapper">
      <Header />

      <div className="main-wrapper">
        <Sidebar />

        <main className="content-home">
          <div className="home-container">
            <div className="home-hero-section">
              <h1 className="home-welcome-title">Bem-vindo ao seu iFridge!</h1>
              <br/><br/>

              <form onSubmit={handleSearch} className="search-container">
                <input
                  type="text"
                  placeholder="Pesquisar receitas (ex: Lasanha, Frango...)"
                  className="main-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn-search-home">
                  Pesquisar
                </button>
              </form>
            </div>

            <Slideshow />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;