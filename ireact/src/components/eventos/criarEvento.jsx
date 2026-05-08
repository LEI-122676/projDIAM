import React from 'react'; // Corrigido aqui
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import '../../css/styles.css';

const CriarEvento = () => {
    const navigate = useNavigate();


    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                </main>
            </div>
        </div>
    );
};

export default CriarEvento;