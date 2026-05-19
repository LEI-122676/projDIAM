import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import PopupModal from '../maincomponents/PopupModal.jsx';
import axios from 'axios';
import '../../css/styles.css';

const GerirUtilizadores = () => {
    const navigate = useNavigate();
    const [utilizadores, setUtilizadores] = useState([]);
    const [originalUtilizadores, setOriginalUtilizadores] = useState([]);
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
        axios.get('http://localhost:8000/idjango/api' + '/utilizadores/', { withCredentials: true })
            .then(res => {
                const activeUsers = res.data.filter(u => u.is_active !== false);
                setUtilizadores(activeUsers);
                setOriginalUtilizadores(activeUsers);
            })
            .catch(err => {
                console.error("Erro ao procurar utilizadores:", err);
                setPopupConfig({
                    isOpen: true,
                    title: 'Erro',
                    message: 'Não foi possível carregar os utilizadores.',
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

        axios.get(`http://localhost:8000/idjango/api/utilizadores/${userId}`, { withCredentials: true })
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
        axios.patch(`http://localhost:8000/idjango/api/utilizadores/${user.id}`, { role: user.role }, { withCredentials: true })
            .then(() => {
                setPopupConfig({
                    isOpen: true,
                    title: 'Sucesso',
                    message: `Permissões do utilizador ${user.username} atualizadas para ${user.role}.`,
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
                    title: 'Erro',
                    message: 'Falha ao atualizar as permissões do utilizador.',
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
            title: 'Confirmar Eliminação',
            message: `Tens a certeza que desejas eliminar a conta de ${user.nome} ${user.apelido} (${user.username})? Esta ação irá desativar a conta.`,
            singleButton: false,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                axios.delete(`http://localhost:8000/idjango/api/utilizadores/${user.id}`, { withCredentials: true })
                    .then(() => {
                        setPopupConfig({
                            isOpen: true,
                            title: 'Conta Eliminada',
                            message: 'A conta do utilizador foi eliminada/desativada com sucesso.',
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
                            title: 'Erro',
                            message: 'Não foi possível eliminar a conta do utilizador.',
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

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <div className="admin-actions-header">
                        <h1 className="page-title-underline">Gerir Utilizadores</h1>
                        <button className="btn-create-submit" onClick={() => navigate('/admin/criar-utilizador')}>
                            ➕ Criar Utilizador
                        </button>
                    </div>

                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Nome Completo</th>
                                    <th>Email</th>
                                    <th>Permissão</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {utilizadores.map(user => {
                                    const origUser = originalUtilizadores.find(u => u.id === user.id);
                                    const hasChanges = origUser && origUser.role !== user.role;

                                    return (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.nome} {user.apelido}</td>
                                            <td>{user.email}</td>
                                            <td>
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
                                            <td>
                                                <button
                                                    className="admin-btn-save"
                                                    disabled={!hasChanges}
                                                    onClick={() => handleSaveRole(user)}
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    className="admin-btn-delete"
                                                    onClick={() => handleDeleteUser(user)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {utilizadores.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="admin-table-empty">Não existem outros utilizadores registados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
