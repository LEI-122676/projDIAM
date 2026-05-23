import 'react';
import { useState, useEffect, useRef, forwardRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeCalendario from "../../assets/calendario.svg"; 
import '../../css/styles.css'
import { useNavigate as useReactNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PopupModal from '../maincomponents/popupModal.jsx';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getCSRFToken } from '../../utils/csrf.js';
import { getFieldLimits, validateInput } from '../../utils/validation.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import Footer from '../maincomponents/Footer.jsx';

const CriarEvento = () => {
    const { t } = useLanguage();
    const URL_BASE = 'http://localhost:8000';
    const URL_CRIAR_EVENTO = `${URL_BASE}/idjango/api/eventos/`;
    const URL_UTILIZADORES = `${URL_BASE}/idjango/api/utilizadores/`;

    const navigate = useReactNavigate();
    const location = useLocation();
    const editEvento = location.state?.editEvento;
    const fileInputRef = useRef(null);

    const safeParseJSON = (value) => {
        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        } catch (e) {
            return null;
        }
    };

    const parseHorarioFromEvento = (horarioValue) => {
        const parsed = safeParseJSON(horarioValue);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return {
                inicio: '20:00',
                fim: '22:00',
                atividades: []
            };
        }

        const inicio = parsed.inicio || '20:00';
        const fim = parsed.fim || '22:00';
        const atividades = Object.entries(parsed)
            .filter(([key]) => key !== 'inicio' && key !== 'fim')
            .map(([key, value]) => ({ nome: key, hora: value || '' }));

        return {
            inicio,
            fim,
            atividades
        };
    };

    const convertTimeToMinutes = (time) => {
        if (!time || typeof time !== 'string') return NaN;
        const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
        return Number.isNaN(hours) || Number.isNaN(minutes) ? NaN : hours * 60 + minutes;
    };

    const minutesToTimeString = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const gerarOpcoesHoras = (stepMinutes = 30) => {
        const horas = [];
        for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
            horas.push(minutesToTimeString(minutes));
        }
        return horas;
    };

    const gerarOpcoesHorarioEntre = (inicio, fim, stepMinutes = 30) => {
        const inicioMinutos = convertTimeToMinutes(inicio);
        const fimMinutos = convertTimeToMinutes(fim);
        if (Number.isNaN(inicioMinutos) || Number.isNaN(fimMinutos) || fimMinutos <= inicioMinutos + stepMinutes) {
            return [];
        }

        const opcoes = [];
        for (let minutos = inicioMinutos + stepMinutes; minutos < fimMinutos; minutos += stepMinutes) {
            opcoes.push(minutesToTimeString(minutos));
        }
        return opcoes;
    };

    const getDefaultAtividadeHora = (inicio, fim) => {
        const opcoes = gerarOpcoesHorarioEntre(inicio, fim);
        return opcoes[0] || '';
    };

    const horarioInitial = parseHorarioFromEvento(editEvento?.horario);
    const [nome, setNome] = useState(editEvento ? editEvento.nome || '' : '');
    const [descricao, setDescricao] = useState(editEvento ? editEvento.descricao || '' : '');
    const [capacidadeMax, setCapacidadeMax] = useState(editEvento ? editEvento.capacidade_max || 5 : 5);
    const [horarioInicio, setHorarioInicio] = useState(horarioInitial.inicio);
    const [horarioFim, setHorarioFim] = useState(horarioInitial.fim);
    const [atividades, setAtividades] = useState(horarioInitial.atividades.length > 0
        ? horarioInitial.atividades
        : [{ nome: '', hora: getDefaultAtividadeHora(horarioInitial.inicio, horarioInitial.fim) || '20:00' }]
    );

    const [dataEvento, setDataEvento] = useState(() => {
        if (editEvento && editEvento.data_evento) {
            const [ano, mes, dia] = editEvento.data_evento.substring(0, 10).split('-');
            return new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, parseInt(dia, 10));
        }
        return null;
    });

    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(() => {
        if (editEvento) {
            const fotoSource = editEvento.foto_url || editEvento.foto;
            if (fotoSource) {
                if (typeof fotoSource === 'string' && fotoSource.startsWith('http')) {
                    return fotoSource;
                }
                return `${URL_BASE}${fotoSource.startsWith('/') ? '' : '/'}${fotoSource}`;
            }
        }
        return null;
    });

    const utilizadorId = localStorage.getItem('utilizadorId');
    const [limits, setLimits] = useState({});

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        getFieldLimits().then(data => setLimits(data));
    }, []);

    useEffect(() => {
        if (!utilizadorId) {
            setPopupConfig({
                isOpen: true,
                title: t('receitas.popups.acesso_restrito_titulo'),
                message: t('eventos.popups.acesso_restrito_criar'),
                singleButton: false,
                confirmText: t('comum.iniciar_sessao'),
                onConfirm: () => navigate('/login'),
                onCancel: () => navigate('/')
            });
            return;
        }

        axios.get(`${URL_UTILIZADORES}${utilizadorId}`, { withCredentials: true })
            .catch(err => {
                console.error("Erro ao verificar permissão do utilizador:", err);
            });
    }, [navigate, utilizadorId]);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFoto(file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const buildHorarioObject = () => {
        const horarioObject = { inicio: horarioInicio };
        atividades.forEach((atividade, index) => {
            const atividadeNome = atividade.nome.trim() || `Atividade ${index + 1}`;
            const key = `${atividadeNome}`;
            horarioObject[key] = atividade.hora;
        });
        horarioObject.fim = horarioFim;
        return horarioObject;
    };

    const handleAddAtividade = () => {
        setAtividades(prev => [...prev, { nome: '', hora: getDefaultAtividadeHora(horarioInicio, horarioFim) }]);
    };

    const handleAtividadeChange = (index, field, value) => {
        setAtividades(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const handleRemoveAtividade = (index) => {
        setAtividades(prev => {
            const copy = [...prev];
            copy.splice(index, 1);
            return copy;
        });
    };

    const handleHorarioInicioChange = (value) => {
        setHorarioInicio(value);
        setAtividades(prev => prev.map((atividade) => {
            const horaMinutos = convertTimeToMinutes(atividade.hora);
            const inicioMinutos = convertTimeToMinutes(value);
            const fimMinutos = convertTimeToMinutes(horarioFim);
            if (Number.isNaN(horaMinutos) || horaMinutos <= inicioMinutos || horaMinutos >= fimMinutos) {
                return { ...atividade, hora: '' };
            }
            return atividade;
        }));
    };

    const handleHorarioFimChange = (value) => {
        setHorarioFim(value);
        setAtividades(prev => prev.map((atividade) => {
            const horaMinutos = convertTimeToMinutes(atividade.hora);
            const inicioMinutos = convertTimeToMinutes(horarioInicio);
            const fimMinutos = convertTimeToMinutes(value);
            if (Number.isNaN(horaMinutos) || horaMinutos <= inicioMinutos || horaMinutos >= fimMinutos) {
                return { ...atividade, hora: '' };
            }
            return atividade;
        }));
    };

    const opcoesHoras = gerarOpcoesHoras();
    const opcoesHorasAtividades = gerarOpcoesHorarioEntre(horarioInicio, horarioFim);

    const opcoesCapacidade = [];
    for (let i = 5; i <= 50; i += 5) {
        opcoesCapacidade.push(i);
    }

    const showPopup = (title, message) => {
        setPopupConfig({ isOpen: true, title, message, singleButton: true, confirmText: t('comum.ok'), onConfirm: closePopup, onCancel: closePopup });
    };

    const formatarDataExibicao = (dateObj) => {
        if (!dateObj) return t('eventos.selecionar_data');
        
        const dia = dateObj.getDate().toString().padStart(2, '0');
        const mes = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const ano = dateObj.getFullYear();
        
        return `${dia}/${mes}/${ano}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nome.trim()) { showPopup(t('receitas.popups.campos_em_branco_titulo'), t('eventos.popups.campos_em_branco_nome')); return; }
        if (!descricao.trim()) { showPopup(t('receitas.popups.campos_em_branco_titulo'), t('eventos.popups.campos_em_branco_descricao')); return; }

        const nomeValidation = validateInput(nome, limits.evento_nome_max_length || 50);
        if (!nomeValidation.isValid) {
            showPopup(t('receitas.popups.erro_validacao_titulo'), `${t('eventos.nome')}: ${nomeValidation.error}`);
            return;
        }

        const descricaoValidation = validateInput(descricao, limits.evento_descricao_max_length || 500);
        if (!descricaoValidation.isValid) {
            showPopup(t('receitas.popups.erro_validacao_titulo'), `${t('eventos.descricao')}: ${descricaoValidation.error}`);
            return;
        }

        if (descricao.trim().length < 10) { showPopup(t('receitas.popups.erro_validacao_titulo'), t('eventos.popups.descricao_curta_msg')); return; }
        if (!dataEvento) { showPopup(t('receitas.popups.campos_em_branco_titulo'), t('eventos.popups.campos_em_branco_data')); return; }
        if (!horarioInicio) { showPopup(t('receitas.popups.campos_em_branco_titulo'), 'Por favor, não deixe o horário de início em branco.'); return; }
        if (!horarioFim) { showPopup(t('receitas.popups.campos_em_branco_titulo'), 'Por favor, não deixe o horário de fim em branco.'); return; }
        if (!utilizadorId) { showPopup(t('receitas.popups.erro_titulo'), t('receitas.popups.erro_identificacao_msg')); return; }

        const inicioMinutos = convertTimeToMinutes(horarioInicio);
        const fimMinutos = convertTimeToMinutes(horarioFim);
        if (Number.isNaN(inicioMinutos) || Number.isNaN(fimMinutos) || inicioMinutos >= fimMinutos) {
            showPopup(t('receitas.popups.erro_validacao_titulo'), 'O horário de início deve ser anterior ao horário de fim.');
            return;
        }

        for (let i = 0; i < atividades.length; i++) {
            const atividade = atividades[i];
            if (!atividade.nome.trim()) {
                showPopup(t('receitas.popups.campos_em_branco_titulo'), 'Por favor, adicione um nome para cada atividade.');
                return;
            }
            if (!atividade.hora) {
                showPopup(t('receitas.popups.campos_em_branco_titulo'), 'Por favor, adicione um horário para cada atividade.');
                return;
            }
            const atividadeMinutos = convertTimeToMinutes(atividade.hora);
            if (Number.isNaN(atividadeMinutos) || atividadeMinutos <= inicioMinutos || atividadeMinutos >= fimMinutos) {
                showPopup(t('receitas.popups.erro_validacao_titulo'), 'Cada atividade deve estar entre o início e o fim do evento.');
                return;
            }
        }

        const anoStr = dataEvento.getFullYear();
        const mesStr = (dataEvento.getMonth() + 1).toString().padStart(2, '0');
        const diaStr = dataEvento.getDate().toString().padStart(2, '0');
        const dataFormatadaAPI = `${anoStr}-${mesStr}-${diaStr}`;

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('capacidade_max', capacidadeMax);
        formData.append('horario', JSON.stringify(buildHorarioObject()));
        formData.append('data_evento', dataFormatadaAPI);
        formData.append('criador', parseInt(utilizadorId, 10));

        if (foto instanceof File) {
            formData.append('foto', foto);
        }

        const csrfToken = getCSRFToken();

        const requestPromise = editEvento
            ? axios.patch(`${URL_CRIAR_EVENTO}${editEvento.id}`, formData, {
                headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            })
            : axios.post(URL_CRIAR_EVENTO, formData, {
                headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

        requestPromise
            .then(() => {
                setPopupConfig({
                    isOpen: true,
                    title: editEvento ? t('eventos.popups.evento_atualizado') : t('eventos.popups.evento_criado'),
                    message: editEvento ? t('eventos.popups.evento_atualizado') : t('eventos.popups.evento_criado'),
                    singleButton: true,
                    confirmText: t('comum.ok'),
                    onConfirm: () => navigate('/eventos'),
                    onCancel: () => navigate('/eventos')
                });
            })
            .catch(err => {
                console.error(err);
                const detail = err.response?.data ? JSON.stringify(err.response.data) : 'Erro de conexão.';
                showPopup(editEvento ? t('eventos.popups.erro_ao_atualizar') : t('eventos.popups.erro_ao_criar'), detail);
            });
    };

    const CustomCalendarInput = forwardRef(({ onClick }, ref) => (
            <button 
                className="calendar-filter-wrapper" 
                onClick={onClick} 
                ref={ref} 
                type="button"
                style={{ 
                    width: '250px', 
                    minWidth: '100%', 
                    boxSizing: 'border-box',
                    height: '42px',               
                    borderRadius: '12px',         
                    border: '1.5px solid #4A3A31',
                    padding: '0 50px',            
                    display: 'flex',              
                    alignItems: 'center'          
                }}
            >
            <img src={iconeCalendario} alt="Calendário" className="recipe-icon-svg mr-8" />
            
            <span 
                className={`calendar-display-text font-600 ${dataEvento ? "mr-4" : ""}`} 
                style={{ 
                    flex: '1',                 
                    textAlign: 'left', 
                    display: 'inline-block' 
                }}
            >
                {formatarDataExibicao(dataEvento)}
            </span>
            
            {dataEvento && (
                <button 
                    className="clear-date-btn" 
                    onClick={(e) => {
                        e.stopPropagation();
                        setDataEvento(null);
                    }}
                    title="Limpar data"
                    type="button"
                >
                    ×
                </button>
            )}
        </button>
    ));

    CustomCalendarInput.displayName = 'CustomCalendarInput';

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <h1 className="page-title-underline">{editEvento ? t('eventos.editar_evento') : t('eventos.criar_evento')}</h1>
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>

                    <div className="create-event-two-column-grid" style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'minmax(450px, 600px) 160px 1fr 1px 500px',
                        gap: '40px', 
                        width: '100%', 
                        alignItems: 'start',
                        boxSizing: 'border-box',
                        marginTop: '20px'
                    }}>

                        {/* COLUNA 1: Elementos do Formulário (Nome, Descrição, Data, Capacidade) */}
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '20px',
                            boxSizing: 'border-box', minWidth: '600px'
                        }}>
                            
                            {/* Nome */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', maxWidth: '600px' }}>
                                    <span style={{ fontWeight: '600' }}>{t('eventos.nome')}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'normal', backgroundColor: '#eae7dc33', padding: '1px 6px', borderRadius: '6px' }}>
                                        {nome.length} / {limits.evento_nome_max_length || 50}
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="input-beige text-black"
                                    placeholder={t('eventos.nome_placeholder')}
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    maxLength={limits.evento_nome_max_length || 50}
                                    style={{ maxWidth: '600px', width: '100%' }}
                                />
                            </div>

                            {/* Descrição */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', maxWidth: '600px' }}>
                                    <span style={{ fontWeight: '600' }}>{t('eventos.descricao')}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'normal', backgroundColor: '#eae7dc33', padding: '1px 6px', borderRadius: '6px' }}>
                                        {descricao.length} / {limits.evento_descricao_max_length || 500}
                                    </span>
                                </label>
                                <textarea
                                    className="input-beige text-black event-description-textarea"
                                    placeholder={t('eventos.descricao_placeholder')}
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    maxLength={limits.evento_descricao_max_length || 500}
                                    style={{ minHeight: '100px', maxHeight: '150px', resize: 'vertical', maxWidth: '600px', width: '100%' }}
                                />
                            </div>

                            {/* Fila Horizontal: Data e Capacidade */}
                            <div className="event-metadata-row" style={{ 
                                display: 'flex', 
                                flexDirection: 'row', 
                                flexWrap: 'wrap', 
                                gap: '15px',
                                width: '100%',
                                maxWidth: '600px',
                                boxSizing: 'border-box'
                            }}>
                                {/* Data do Evento */}
                                <div className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
                                    <label className="event-metadata-label" style={{ marginBottom: '6px', display: 'block', fontWeight: '600' }}>{t('eventos.data_evento')}</label>
                                    <div className="datepicker-anchor" style={{ width: '100%' }}>
                                        <DatePicker
                                            selected={dataEvento}
                                            onChange={(date) => setDataEvento(date)}
                                            dateFormat="dd/MM/yyyy"
                                            customInput={<CustomCalendarInput />}
                                            popperPlacement="top-end"
                                            popperModifiers={[
                                                { name: "preventOverflow", options: { boundary: "viewport", altAxis: true } },
                                                { name: "flip", options: { fallbackPlacements: [] } },
                                                { name: "offset", options: { offset: [0, 10] } }
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* Capacidade */}
                                <div className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
                                    <label className="event-metadata-label" style={{ marginBottom: '6px', display: 'block', fontWeight: '600' }}>{t('eventos.capacidade')}</label>
                                    <select
                                        className="input-beige text-black event-metadata-select"
                                        value={capacidadeMax}
                                        onChange={(e) => setCapacidadeMax(parseInt(e.target.value, 10))}
                                        style={{ width: '100%', height: '42px', borderRadius: '12px', border: '1.5px solid #4A3A31', padding: '0 10px' }}
                                    >
                                        {opcoesCapacidade.map(num => (
                                            <option key={num} value={num}>
                                                {num} {t('eventos.pessoas_max')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                                                        <div className="form-group" style={{ margin: 0 }}>
                                <label className="event-metadata-label" style={{ marginBottom: '6px', display: 'block', fontWeight: '600', textAlign: 'left' }}>
                                    {t('eventos.horario')}
                                </label>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label className="event-metadata-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                                                Início
                                            </label>
                                            <select
                                                className="input-beige text-black event-metadata-select"
                                                value={horarioInicio}
                                                onChange={(e) => handleHorarioInicioChange(e.target.value)}
                                                style={{ width: '100%', height: '42px', borderRadius: '12px', border: '1.5px solid #4A3A31', padding: '0 10px' }}
                                            >
                                                {opcoesHoras.map(hora => (
                                                    <option key={hora} value={hora}>
                                                        {hora}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="event-metadata-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                                                Fim
                                            </label>
                                            <select
                                                className="input-beige text-black event-metadata-select"
                                                value={horarioFim}
                                                onChange={(e) => handleHorarioFimChange(e.target.value)}
                                                style={{ width: '100%', height: '42px', borderRadius: '12px', border: '1.5px solid #4A3A31', padding: '0 10px' }}
                                            >
                                                {opcoesHoras.map(hora => (
                                                    <option key={hora} value={hora}>
                                                        {hora}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="event-metadata-label" style={{ marginBottom: '6px', display: 'block', fontWeight: '500' }}>
                                            Atividades
                                        </label>
                                        {atividades.map((atividade, index) => (
                                            <div key={index} className="dynamic-list-item dynamic-list-item-flex" style={{ alignItems: 'flex-start' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
                                                    <input
                                                        type="text"
                                                        className="input-beige text-black"
                                                        placeholder="Nome da atividade"
                                                        value={atividade.nome}
                                                        onChange={(e) => handleAtividadeChange(index, 'nome', e.target.value)}
                                                        style={{ width: '100%', height: '45px' }}
                                                    />
                                                    <select
                                                        className="input-beige text-black event-metadata-select"
                                                        value={atividade.hora || ''}
                                                        onChange={(e) => handleAtividadeChange(index, 'hora', e.target.value)}
                                                        style={{ width: '100%', height: '42px', borderRadius: '12px', border: '1.5px solid #4A3A31', padding: '0 10px' }}
                                                    >
                                                        <option value="" disabled>
                                                            {opcoesHorasAtividades.length > 0 ? 'Selecionar horário' : 'Defina início e fim'}
                                                        </option>
                                                        {opcoesHorasAtividades.map(hora => (
                                                            <option key={hora} value={hora}>
                                                                {hora}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-cancel btn-cancel-small"
                                                    style={{ marginTop: '4px' }}
                                                    onClick={() => handleRemoveAtividade(index)}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" className="btn-add-dashed" style= {{ width: '100%', height: '45px', color: '#4A3A31'}} onClick={handleAddAtividade}>
                                            + Adicionar atividade
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LINHA DIVISÓRIA VERTICAL: Aligned right */}
                        <div className="vertical-divider" style={{
                            width: '1px',
                            alignSelf: 'stretch',
                            backgroundColor: '#4A3A3122',
                            minHeight: '100%',
                            display: 'block',
                            margin: '0 300px'
                        }} />

                        {/* COLUNA 3: Secção da Imagem e Botões de Ação: Aligned right */}
                        <div className="recipe-image-section" style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '15px', 
                            margin: 0,
                            boxSizing: 'border-box',
                            width: '150%',
                            marginLeft: '200px'
                        }}>
                            <div
                                className="image-upload-placeholder"
                                onClick={() => fileInputRef.current.click()}
                                title={t('receitas.criar_receita.adicionar_foto_title')}
                                style={{ transition: 'all 0.2s ease', cursor: 'pointer', minHeight: '100px', width: '100%', maxHeight: '550px' }}
                            >
                                {fotoPreview ? (
                                    <img
                                        src={fotoPreview}
                                        alt="Pré-visualização"
                                        className="image-preview-fit"
                                    />
                                ) : (
                                    <div className="image-upload-info" style={{ padding: '50px 20px', textAlign: 'center' }}>
                                        <div className="image-upload-icon" style={{ fontSize: '3rem', marginBottom: '12px' }}>📷</div>
                                        <p className="image-upload-text" style={{ fontWeight: '500' }}>{t('receitas.criar_receita.adicionar_foto')}</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden-element"
                                onChange={handleFotoChange}
                            />
                            {fotoPreview && (
                                <button
                                    className="btn-cancel btn-cancel-small btn-remove-photo"
                                    onClick={() => { setFoto(null); setFotoPreview(null); fileInputRef.current.value = ''; }}
                                    style={{ width: '100%' }}
                                >
                                    {t('receitas.criar_receita.remover_foto')}
                                </button>
                            )}

                            <div className="create-actions-group" style={{ marginTop: '10px', display: 'flex', gap: '15px', width: '100%' }}>
                                <button className="btn-cancel" style={{ flex: 1 }} type="button" onClick={() => navigate(-1)}>{t('comum.cancelar')}</button>
                                <button className="btn-create-submit" style={{ flex: 1 }} type="submit" onClick={handleSubmit}>{editEvento ? t('receitas.criar_receita.guardar') : t('receitas.criar_receita.criar')}</button>
                            </div>
                        </div>

                    </div>
                    </form>
                    <div className="footer-spacer"></div>
          <Footer />
                </main>
            </div>

            <PopupModal
                isOpen={popupConfig.isOpen}
                title={popupConfig.title}
                message={popupConfig.message}
                singleButton={popupConfig.singleButton}
                confirmText={popupConfig.confirmText || t('comum.ok')}
                cancelText={popupConfig.cancelText || t('comum.cancelar')}
                onConfirm={popupConfig.onConfirm}
                onCancel={popupConfig.onCancel}
            />
        </div>
    );
};

export default CriarEvento;