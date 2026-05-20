import re
import os
import json
from rest_framework import serializers

# Carregar o nome do ficheiro a partir das variáveis de ambiente (.env)
words_filename = os.environ.get('MODERATOR_WORDS_FILE', 'moderator_words.json')

# Construir caminho absoluto para o ficheiro JSON
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
words_filepath = os.path.join(BASE_DIR, words_filename)

BAD_WORDS = []
ad_words = []

# Carrega os dados de censura
if os.path.exists(words_filepath):
    with open(words_filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        BAD_WORDS = data.get('BAD_WORDS', [])
        ad_words = data.get('AD_WORDS', [])

# Regex para detetar URLs (http://, https://, www., .com, .pt, etc.)
URL_REGEX = re.compile(
    r'(https?://(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|'
    r'www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|'
    r'https?://(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|'
    r'www\.[a-zA-Z0-9]+\.[^\s]{2,})',
    re.IGNORECASE
)

# Cria a Regex de publicidade dinamicamente a partir dos termos carregados
AD_REGEX = re.compile(
    r'(\b(' + '|'.join(re.escape(w) for w in ad_words) + r')\b)',
    re.IGNORECASE
)

def validar_texto(value, campo_nome="conteúdo"):
    if not value or not isinstance(value, str):
        return value
        
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
