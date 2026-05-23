import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import PopupModal from '../maincomponents/popupModal.jsx';
import '../../css/styles.css';

const Dashboard = () => {
    const URL_BASE = 'http://localhost:8000';
    const navigate = useNavigate();
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        const userId = localStorage.getItem('utilizadorId');
        if (!userId) {
            setPopupConfig({
                isOpen: true,
                title: 'Acesso Restrito',
                message: 'Precisas de iniciar sessão como Administrador.',
                singleButton: false,
                confirmText: 'Login',
                onConfirm: () => navigate('/login'),
                onCancel: () => navigate('/')
            });
            return;
        }

        // Verify Admin role
        axios.get(`${URL_BASE}/idjango/api/utilizadores/${userId}`, { withCredentials: true })
            .then(res => {
                if (res.data.role !== 'Admin') {
                    setPopupConfig({
                        isOpen: true,
                        title: 'Acesso Restrito',
                        message: 'Apenas administradores podem aceder ao Dashboard.',
                        singleButton: true,
                        confirmText: 'Voltar',
                        onConfirm: () => navigate('/')
                    });
                } else {
                    fetchStats();
                }
            })
            .catch(err => {
                console.error("Erro ao verificar utilizador:", err);
                navigate('/');
            });
    }, [navigate]);

    const fetchStats = () => {
        axios.get(`${URL_BASE}/idjango/api/feedback/stats/`)
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao obter estatísticas:", err);
                setLoading(false);
            });
    };

    return (
        <div className="body-wrapper">
            <Header />

            <div className="main-wrapper">
                <Sidebar />

                <main className="content-home">
                    <div className="page-header">
                        <h1 className="page-title-underline">Dashboard (Admin)</h1>
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', marginTop: '40px' }}>A carregar dados...</p>
                    ) : stats && stats.averages ? (
                        <div className="feedback-stats-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '20px' }}>
                            <div className="premium-card" style={{ padding: '30px', textAlign: 'center' }}>
                                <h2 style={{ marginBottom: '10px' }}>Total de Respostas de Feedback</h2>
                                <p style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--brand-color)' }}>{stats.total_respostas}</p>
                            </div>

                            <div className="premium-card" style={{ padding: '30px' }}>
                                <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #D1CDBC', paddingBottom: '10px' }}>Médias de Classificação (1 a 5)</h2>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                    <li style={{ fontSize: '18px' }}><strong>Receitas:</strong> ⭐ {stats.averages.avg_receitas?.toFixed(1) || 'N/A'}</li>
                                    <li style={{ fontSize: '18px' }}><strong>Eventos:</strong> ⭐ {stats.averages.avg_eventos?.toFixed(1) || 'N/A'}</li>
                                    <li style={{ fontSize: '18px' }}><strong>Frigorífico:</strong> ⭐ {stats.averages.avg_frigorifico?.toFixed(1) || 'N/A'}</li>
                                    <li style={{ fontSize: '18px' }}><strong>Estética:</strong> ⭐ {stats.averages.avg_estetica?.toFixed(1) || 'N/A'}</li>
                                </ul>
                            </div>

                            <div className="premium-card" style={{ padding: '30px' }}>
                                <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #D1CDBC', paddingBottom: '10px' }}>Funcionalidades Favoritas (Votos)</h2>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                    {Object.entries(stats.poll).map(([key, value]) => (
                                        <li key={key} style={{ fontSize: '18px' }}>
                                            <strong>{key}:</strong> {value} votos
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '40px' }}>{stats?.msg || 'Sem dados de feedback disponíveis.'}</p>
                    )}
                </main>
            </div>
            
            <PopupModal 
                isOpen={popupConfig.isOpen}
                title={popupConfig.title}
                message={popupConfig.message}
                singleButton={popupConfig.singleButton}
                confirmText={popupConfig.confirmText || 'OK'}
                cancelText={popupConfig.cancelText || 'Cancelar'}
                onConfirm={popupConfig.onConfirm}
                onCancel={popupConfig.onCancel}
            />
        </div>
    );
};

export default Dashboard;
