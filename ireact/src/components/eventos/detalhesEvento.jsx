import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';

const DetalhesEvento = () => {

  return (
    <div className="body-wrapper">
      <Header />

      <div className="main-wrapper">
        <Sidebar />

        <main className="content-home">
        
        </main>
      </div>
    </div>
  );
};

export default DetalhesEvento;