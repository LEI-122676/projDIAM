import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import PopupModal from '../maincomponents/popupModal.jsx';
import axios from 'axios';
import '../../css/styles.css';
import { getCSRFToken } from '../../utils/csrf.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import Pagination from '../maincomponents/pagination.jsx';
import Footer from '../maincomponents/Footer.jsx';

const GerirUtilizadores = () => {
    const { t } = useLanguage();
    const URL_BASE = 'http://localhost:8000';
    const URL_UTILIZADORES = `${URL_BASE}/idjango/api/utilizadores/`;

    const navigate = useNavigate();
    const [utilizadores, setUtilizadores] = useState([]);
    const [originalUtilizadores, setOriginalUtilizadores] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [popupConfig, setPopupConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        singleButton: true,
        onConfirm: () => {},
        onCancel: () => {}
    });

    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const fetchUtilizadores = () => {
        axios.get(URL_UTILIZADORES, { withCredentials: true })
            .then(res => {
                const activeUsers = res.data.filter(u => u.is_active !== false);
                setUtilizadores(activeUsers);
                setOriginalUtilizadores(activeUsers);
            })
            .catch(err => {
                console.error("Erro ao procurar utilizadores:", err);
                setPopupConfig({
                    isOpen: true,
                    title: t('admin.popups.erro_titulo'),
                    message: t('admin.popups.erro_carregar'),
                    singleButton: true,
                    confirmText: 'OK',
                    onConfirm: closePopup,
                    onCancel: closePopup
                });
            });
    };

    useEffect(() => {
        const userId = localStorage.getItem('utilizadorId');
        if (!userId) {
            navigate('/login');
            return;
        }

        axios.get(`${URL_UTILIZADORES}${userId}`, { withCredentials: true })
            .then(res => {
                if (res.data.role !== 'Admin') {
                    navigate('/perfil');
                } else {
                    fetchUtilizadores();
                }
            })
            .catch(() => {
                navigate('/perfil');
            });
    }, [navigate]);

    const handleRoleChange = (id, newRole) => {
        setUtilizadores(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    };

    const handleSaveRole = (user) => {
        axios.patch(`${URL_UTILIZADORES}${user.id}`, { role: user.role }, { 
            headers: { 'X-CSRFToken': getCSRFToken() },
            withCredentials: true 
        })
            .then(() => {
                setPopupConfig({
                    isOpen: true,
                    title: t('admin.popups.sucesso_titulo'),
                    message: t('admin.popups.permissoes_atualizadas').replace('{username}', user.username).replace('{role}', user.role),
                    singleButton: true,
                    confirmText: 'OK',
                    onConfirm: closePopup,
                    onCancel: closePopup
                });
                setOriginalUtilizadores(prev => prev.map(u => u.id === user.id ? { ...u, role: user.role } : u));
            })
            .catch(err => {
                console.error("Erro ao atualizar papel:", err);
                setPopupConfig({
                    isOpen: true,
                    title: t('admin.popups.erro_titulo'),
                    message: t('admin.popups.falha_atualizar'),
                    singleButton: true,
                    confirmText: 'OK',
                    onConfirm: closePopup,
                    onCancel: closePopup
                });
            });
    };

    const handleDeleteUser = (user) => {
        setPopupConfig({
            isOpen: true,
            title: t('admin.popups.confirmar_eliminacao'),
            message: t('admin.popups.apagar_conta_msg').replace('{nome}', `${user.nome} ${user.apelido}`).replace('{username}', user.username),
            singleButton: false,
            confirmText: t('admin.popups.eliminar'),
            cancelText: t('admin.popups.cancelar'),
            onConfirm: () => {
                axios.delete(`${URL_UTILIZADORES}${user.id}`, { 
                    headers: { 'X-CSRFToken': getCSRFToken() },
                    withCredentials: true 
                })
                    .then(() => {
                        setPopupConfig({
                            isOpen: true,
                            title: t('admin.popups.conta_eliminada'),
                            message: t('admin.popups.conta_eliminada_msg'),
                            singleButton: true,
                            confirmText: 'OK',
                            onConfirm: () => {
                                closePopup();
                                fetchUtilizadores();
                            },
                            onCancel: closePopup
                        });
                    })
                    .catch(err => {
                        console.error("Erro ao eliminar conta:", err);
                        setPopupConfig({
                            isOpen: true,
                            title: t('admin.popups.erro_titulo'),
                            message: t('admin.popups.erro_eliminar_msg'),
                            singleButton: true,
                            confirmText: 'OK',
                            onConfirm: closePopup,
                            onCancel: closePopup
                        });
                    });
            },
            onCancel: closePopup
        });
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = utilizadores.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(utilizadores.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <div className="admin-actions-header">
                        <h1 className="page-title-underline">{t('admin.gerir_utilizadores')}</h1>
                        <button className="btn-create-submit" onClick={() => navigate('/admin/criar-utilizador')}>
                            {t('admin.criar_utilizador')}
                        </button>
                    </div>

                    <div className="premium-card" style={{ padding: '0', overflow: 'hidden', marginTop: '20px' }}>
                        <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'var(--brand-color)', color: '#fff' }}>
                                <tr>
                                    <th style={{ padding: '15px' }}>{t('admin.tabela.username')}</th>
                                    <th style={{ padding: '15px' }}>{t('admin.tabela.nome_completo')}</th>
                                    <th style={{ padding: '15px' }}>{t('admin.tabela.email')}</th>
                                    <th style={{ padding: '15px' }}>{t('admin.tabela.permissao')}</th>
                                    <th style={{ padding: '15px' }}>{t('admin.tabela.acoes')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map(user => {
                                    const origUser = originalUtilizadores.find(u => u.id === user.id);
                                    const hasChanges = origUser && origUser.role !== user.role;

                                    return (
                                        <tr key={user.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                            <td style={{ padding: '15px', fontWeight: 'bold' }}>{user.username}</td>
                                            <td style={{ padding: '15px' }}>{user.first_name} {user.last_name}</td>
                                            <td style={{ padding: '15px' }}>{user.email}</td>
                                            <td style={{ padding: '15px' }}>
                                                <select
                                                    className="admin-role-select"
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                >
                                                    <option value="User">User</option>
                                                    <option value="EventOrganizer">EventOrganizer</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <button
                                                    className="admin-btn-save"
                                                    disabled={!hasChanges}
                                                    onClick={() => handleSaveRole(user)}
                                                >
                                                    {t('admin.botoes.guardar')}
                                                </button>
                                                <button
                                                    className="admin-btn-delete"
                                                    style={{ marginLeft: '10px' }}
                                                    onClick={() => handleDeleteUser(user)}
                                                >
                                                    {t('admin.botoes.eliminar')}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {utilizadores.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="admin-table-empty" style={{ padding: '15px', textAlign: 'center' }}>{t('admin.tabela.vazio')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <Pagination 
                                currentPage={currentPage}
                                totalItems={utilizadores.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={paginate}
                            />
                        )}
                    </div>
                    <div className="footer-spacer"></div>
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

export default GerirUtilizadores;
