import axios from 'axios';

// Obter URL base da API a partir das variáveis de ambiente do Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/idjango/api';

let cachedLimits = null;

export async function getFieldLimits() {
  if (cachedLimits) {
    return cachedLimits;
  }

  try {
    const cached = sessionStorage.getItem('field_limits');
    if (cached) {
      cachedLimits = JSON.parse(cached);
      return cachedLimits;
    }
  } catch {
    // sessionStorage indisponível
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/field-limits/`);
    const limits = response.data;
    cachedLimits = limits;
    try {
      sessionStorage.setItem('field_limits', JSON.stringify(limits));
    } catch {
      // Ignorar erros na escrita para o sessionStorage
    }
    return limits;
  } catch (error) {
    console.error('Erro ao carregar limites de campos:', error);
    // Defaults de fallback caso a API falhe
    const defaults = {
      comentario_max_length: 150,
      receita_nome_max_length: 50,
      receita_instrucao_max_length: 500,
      evento_nome_max_length: 50,
      evento_descricao_max_length: 500,
      utilizador_bio_max_length: 200,
      ingrediente_nome_max_length: 50,
      user_first_name_max_length: 30,
      user_last_name_max_length: 30,
      user_username_max_length: 30
    };
    return defaults;
  }
}

export function validateInput(value, max_length) {
  if (!value || typeof value !== 'string') {
    return { isValid: true, error: '' };
  }

  if (max_length && value.length > max_length) {
    return {
      isValid: false,
      error: `Excede o limite máximo de ${max_length} caracteres.`
    };
  }

  return { isValid: true, error: '' };
}
