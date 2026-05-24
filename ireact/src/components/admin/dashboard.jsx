import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import PopupModal from '../maincomponents/popupModal.jsx';
import Pagination from '../maincomponents/pagination.jsx';
import Footer from '../maincomponents/footer.jsx';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import SearchBar from '../maincomponents/SearchBar.jsx';
import '../../css/styles.css';

const Dashboard = () => {
    const URL_BASE = 'http://localhost:8000';
    const navigate = useNavigate();
    const { t } = useLanguage();
    
    const [stats, setStats] = useState(null);
    const [allFeedbacks, setAllFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 10;

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        const userId = localStorage.getItem('utilizadorId');
        if (!userId) {
            setPopupConfig({
                isOpen: true,
                title: t('dashboard.acesso_restrito'),
                message: t('dashboard.precisas_login'),
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
                        title: t('dashboard.acesso_restrito'),
                        message: t('dashboard.apenas_admins'),
                        singleButton: true,
                        confirmText: 'Voltar',
                        onConfirm: () => navigate('/')
                    });
                } else {
                    fetchStats();
                    fetchAllFeedbacks();
                }
            })
            .catch(err => {
                console.error("Erro ao verificar utilizador:", err);
                navigate('/');
            });
    }, [navigate, t]);

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

    const fetchAllFeedbacks = () => {
        axios.get(`${URL_BASE}/idjango/api/feedback/list/`, { withCredentials: true })
            .then(res => {
                setAllFeedbacks(res.data);
            })
            .catch(err => {
                console.error("Erro ao obter lista de feedbacks:", err);
            });
    };

    // Pagination and Filtering logic
    const filteredFeedbacks = allFeedbacks.filter(fb => 
        (fb.utilizador_nome || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="body-wrapper">
            <Header />

            <div className="main-wrapper">
                <Sidebar />

                <main className="content-profile">
                    <div className="page-header">
                        <h1 className="page-title-underline">{t('dashboard.titulo')}</h1>
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', marginTop: '40px' }}>{t('dashboard.a_carregar')}</p>
                    ) : stats && stats.averages ? (
                        <>
                            <div className="feedback-stats-container" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '30px', marginTop: '20px' }}>
                                <div className="premium-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', flex: 1, minWidth: '300px' }}>
                                    <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #D1CDBC', paddingBottom: '10px' }}>{t('dashboard.total_respostas')}</h2>
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <p style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--brand-color)', margin: 0 }}>{stats.total_respostas}</p>
                                    </div>
                                </div>

                                <div className="premium-card" style={{ padding: '30px', flex: 1, minWidth: '300px' }}>
                                    <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #D1CDBC', paddingBottom: '10px' }}>{t('dashboard.medias_classificacao')}</h2>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        <li style={{ fontSize: '18px' }}><strong>{t('feedback.receitas')}:</strong> ⭐ {stats.averages.avg_receitas?.toFixed(1) || 'N/A'}</li>
                                        <li style={{ fontSize: '18px' }}><strong>{t('feedback.eventos')}:</strong> ⭐ {stats.averages.avg_eventos?.toFixed(1) || 'N/A'}</li>
                                        <li style={{ fontSize: '18px' }}><strong>{t('feedback.frigorifico')}:</strong> ⭐ {stats.averages.avg_frigorifico?.toFixed(1) || 'N/A'}</li>
                                        <li style={{ fontSize: '18px' }}><strong>{t('feedback.estetica')}:</strong> ⭐ {stats.averages.avg_estetica?.toFixed(1) || 'N/A'}</li>
                                    </ul>
                                </div>

                                <div className="premium-card" style={{ padding: '30px', flex: 1, minWidth: '300px' }}>
                                    <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #D1CDBC', paddingBottom: '10px' }}>{t('dashboard.funcionalidades_favoritas')}</h2>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        {Object.entries(stats.poll).map(([key, value]) => (
                                            <li key={key} style={{ fontSize: '18px' }}>
                                                <strong>{key === 'Receitas' ? t('feedback.receitas') : key === 'Eventos' ? t('feedback.eventos') : key === 'Frigorifico' ? t('feedback.frigorifico') : t('feedback.estetica')}:</strong> {value} {t('dashboard.votos')}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {allFeedbacks.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <SearchBar 
                                            placeholder={t('dashboard.tabela_username')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                                        <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead style={{ backgroundColor: 'var(--brand-color)', color: '#fff' }}>
                                                <tr>
                                                    <th style={{ padding: '15px' }}>{t('dashboard.tabela_username')}</th>
                                                    <th style={{ padding: '15px' }}>{t('dashboard.tabela_receitas')}</th>
                                                    <th style={{ padding: '15px' }}>{t('dashboard.tabela_eventos')}</th>
                                                    <th style={{ padding: '15px' }}>{t('dashboard.tabela_frigorifico')}</th>
                                                    <th style={{ padding: '15px' }}>{t('dashboard.tabela_estetica')}</th>
                                                    <th style={{ padding: '15px' }}>{t('dashboard.tabela_favorita')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((fb, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{fb.utilizador_nome}</td>
                                                        <td style={{ padding: '15px' }}>⭐ {fb.nota_receitas}</td>
                                                        <td style={{ padding: '15px' }}>⭐ {fb.nota_eventos}</td>
                                                        <td style={{ padding: '15px' }}>⭐ {fb.nota_frigorifico}</td>
                                                        <td style={{ padding: '15px' }}>⭐ {fb.nota_estetica}</td>
                                                        <td style={{ padding: '15px' }}>
                                                            {fb.funcionalidade_favorita === 'Receitas' ? t('feedback.receitas') :
                                                             fb.funcionalidade_favorita === 'Eventos' ? t('feedback.eventos') :
                                                             fb.funcionalidade_favorita === 'Frigorifico' ? t('feedback.frigorifico') : t('feedback.estetica')}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredFeedbacks.length === 0 && (
                                                    <tr>
                                                        <td colSpan="6" className="admin-table-empty" style={{ padding: '15px', textAlign: 'center' }}>{t('admin.tabela.vazio')}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {totalPages > 1 && (
                                        <Pagination 
                                            currentPage={currentPage}
                                            totalItems={filteredFeedbacks.length}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={paginate}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '40px' }}>{stats?.msg || t('dashboard.sem_dados')}</p>
                    )}
                    <Footer />
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
