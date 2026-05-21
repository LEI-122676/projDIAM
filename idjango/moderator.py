import re
import os
import json
from rest_framework import serializers

# Construir caminho absoluto para o diretório base
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Carregar o nome do ficheiro a partir das variáveis de ambiente (.env)
words_filename = os.environ.get('MODERATOR_WORDS_FILE', 'moderator_words.json')
words_filepath = os.path.join(BASE_DIR, words_filename)

BAD_WORDS = []
ad_words = []

# Carrega os dados de censura
if os.path.exists(words_filepath):
    try:
        with open(words_filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            BAD_WORDS = data.get('BAD_WORDS', [])
            ad_words = data.get('AD_WORDS', [])
    except Exception:
        pass

# Regex para detetar URLs (http://, https://, www., .com, .pt, etc.)
URL_REGEX = re.compile(
    r'(https?://(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|'
    r'www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|'
    r'https?://(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|'
    r'www\.[a-zA-Z0-9]+\.[^\s]{2,})',
    re.IGNORECASE
)

# Cria a Regex de publicidade dinamicamente a partir dos termos carregados
if ad_words:
    AD_REGEX = re.compile(
        r'(\b(' + '|'.join(re.escape(w) for w in ad_words) + r')\b)',
        re.IGNORECASE
    )
else:
    AD_REGEX = re.compile(r'(?!)')

# Carregar os limites de campos a partir do ficheiro JSON central
limits_filename = os.environ.get('FIELD_LIMITS_FILE', 'field_limits.json')
limits_filepath = os.path.join(BASE_DIR, limits_filename)

FIELD_LIMITS = {
    "comentario_max_length": 150,
    "receita_nome_max_length": 50,
    "receita_instrucao_max_length": 500,
    "evento_nome_max_length": 50,
    "evento_descricao_max_length": 500,
    "utilizador_bio_max_length": 200,
    "ingrediente_nome_max_length": 50,
    "user_first_name_max_length": 30,
    "user_last_name_max_length": 30,
    "user_username_max_length": 30
}

if os.path.exists(limits_filepath):
    try:
        with open(limits_filepath, 'r', encoding='utf-8') as f:
            custom_limits = json.load(f)
            FIELD_LIMITS.update(custom_limits)
    except Exception:
        pass

def validar_texto(value, campo_nome="conteúdo", check_moderation=True, max_length=None):
    if not value or not isinstance(value, str):
        return value

    # Verificar comprimento do texto
    if max_length is not None and len(value) > max_length:
        raise serializers.ValidationError(
            f"O campo '{campo_nome}' excede o limite máximo de {max_length} caracteres (comprimento atual: {len(value)})."
        )

    # Executar moderação apenas se solicitado
    if check_moderation:
        # Verificar Links/URLs
        if URL_REGEX.search(value):
            raise serializers.ValidationError("Não é permitido colocar links ou URLs no conteúdo.")
            
        # Verificar termos de spam/anúncios
        if AD_REGEX.search(value):
            raise serializers.ValidationError("Não é permitido colocar anúncios ou publicações promocionais.")
            
        # Verificar palavrões
        value_lower = value.lower()
        for word in BAD_WORDS:
            # Match apenas a palavra exata para evitar falsos positivos
            pattern = r'\b' + re.escape(word) + r'\b'
            if re.search(pattern, value_lower):
                raise serializers.ValidationError(f"O campo '{campo_nome}' contém linguagem inadequada ('{word}'). Por favor, remove-a.")
                
    return value

