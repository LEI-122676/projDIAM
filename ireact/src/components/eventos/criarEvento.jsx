import React, { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css'
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/PopupModal.jsx';


const CriarEvento = () => {

    const URL_CRIAR_EVENTO = 'http://localhost:8000/idjango/api/eventos/';

    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nome) {
            setPopupConfig({
                isOpen: true,
                title: 'Erro no nome',
                message: 'Por favor, dê um nome ao evento.',
                singleButton: true,
                confirmText: 'Ok',
                onConfirm: closePopup,
                onCancel: closePopup
            });
            return;
        }

        if (descricao.length < 10) {
            setPopupConfig({
                isOpen: true,
                title: 'Erro na descrição',
                message: 'Por favor, dê uma descrição ao evento ( tamanho minimo de dez carateres).',
                singleButton: true,
                confirmText: 'Ok',
                onConfirm: closePopup,
                onCancel: closePopup
            });
            return;
        }

        const utilizadorId = localStorage.getItem('utilizadorId');

        const payload = {
            nome: nome,
            descricao: descricao,
            criador: parseInt(utilizadorId, 10)
        };


        axios.post(URL_CRIAR_EVENTO, payload, { withCredentials: true }).then(res => {
            setPopupConfig({
                isOpen: true,
                title: 'Sucesso',
                message: 'Evento criado com sucesso.',
                singleButton: true,
                confirmText: 'Ok',
                onConfirm: closePopup,
                onCancel: closePopup
            }); navigate(-1);
        })

            .catch(err => {
                console.error(err);
                if (err.response && err.response.data) {
                    alert('Erro ao criar evento: ' + JSON.stringify(err.response.data));
                } else {
                    alert('Erro de conexão ao criar evento.');
                }
            });
    };

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <h1 className="page-title-underline">Criar Evento</h1>
                    <div className="create-recipe-container">
                        <div className="recipe-form-section">
                            <div className="form-group">
                                <label>Nome*:</label>
                                <input
                                    type="text"
                                    className="input-beige"
                                    placeholder="Dê um nome ao seu evento"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    style={{ color: 'black' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Descrição*:</label>
                                <textarea
                                    className="input-beige"
                                    placeholder="Detalhes sobre o local, data e o que levar"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    style={{
                                        color: 'black',
                                        height: '350px',
                                        padding: '20px',
                                        resize: 'none'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="recipe-image-section">
                            <div className="create-actions-group">
                                <button className="btn-cancel" onClick={() => navigate(-1)} >Cancelar</button>
                                <button className="btn-create-submit" onClick={handleSubmit}>Criar</button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
            <PopupModal
                isOpen={popupConfig.isOpen}
                title={popupConfig.title}
                message={popupConfig.message}
                singleButton={popupConfig.singleButton}
                confirmText={popupConfig.confirmText || 'OK'}
                cancelText={popupConfig.cancelText || ''}
                onConfirm={popupConfig.onConfirm}
                onCancel={popupConfig.onCancel}
            />
        </div>
    );
};

export default CriarEvento;