import re
import os
from rest_framework import serializers

# Lista base de palavrões por defeito (caso não exista no .env)
DEFAULT_BAD_WORDS = [
    'merda', 'caralho', 'puta', 'foda', 'foder', 'cabrão', 
    'foder-se', 'paneleiro', 'cú', 'ass', 'fuck', 'bitch', 'shit',
    'dick', 'pussy', 'bastardo', 'pqp', 'filho da puta', 'fdp',
    'parvo', 'otário', 'estúpido', 'cona', 'piça', 'pixa', 'foda-se',
    'fodasse', 'fodas', 'chupa', 'chulo', 'cabra', 'corno', 'cornudo',
    'idiota', 'imbecil', 'lixo', 'mongoloide', 'nojento', 'nojo',
    'porco', 'sacana', 'anormal', 'atrasado', 'badameco', 'bosta',
    'boi', 'burro', 'escroto', 'fufa', 'maricas', 'merdaço', 'mijo',
    'retardado', 'safado', 'sapatona', 'tarado', 'vaca', 'xaroca',
    'xoxota', 'vagina', 'boquete', 'punheteiro', 'siririca', 'grelo',
    'culhões', 'caralhada', 'fodido', 'fudido', 'fudida', 'fodida',
    'rabeta', 'retardada', 'escrota', 'imbecis', 'idiotas', 'anormais',
    'putedo', 'raboto', 'panilas', 'pessegada', 'punheta'
]

# Termos de publicidade por defeito
DEFAULT_AD_WORDS = [
    'anuncio', 'promo', 'ganhar dinheiro', 'compra já', 
    'desconto', 'clica aqui', 'whatsapp', 'contacto', 'ganhe agora',
    'dinheiro facil', 'bonus', 'bónus', 'casino', 'apostas', 'bitcoin',
    'cripto', 'rentabilidade', 'marketing', 'afiliados', 'investir',
    'investimentos', 'curso online', 'compre online', 'promoção',
    'promocional', 'oferta especial', 'tempo limitado', 'imperdível',
    'melhor preço', 'cupão', 'cupom', 'sorteio', 'brinde', 'ganhe grátis',
    'de borla', 'grátis', 'gratis', 'compre hoje', 'saiba mais',
    'link na bio', 'telegram', 'instagram', 'facebook', 'segue-me',
    'adiciona-me', 'ligue já', 'telefone', 'telemóvel', 'emprestimo',
    'dinheiro rápido', 'ganho extra', 'renda extra', 'vendas', 'compre',
    'venda', 'compre já', 'clicar', 'subscreve'
]

# Carrega a lista do .env, caso contrário usa a padrão
raw_bad_words = os.environ.get('MODERATOR_BAD_WORDS')
if raw_bad_words:
    BAD_WORDS = [word.strip() for word in raw_bad_words.split(',') if word.strip()]
else:
    BAD_WORDS = DEFAULT_BAD_WORDS

# Carrega os termos de publicidade do .env, caso contrário usa os padrão
raw_ad_words = os.environ.get('MODERATOR_AD_WORDS')
if raw_ad_words:
    ad_words = [word.strip() for word in raw_ad_words.split(',') if word.strip()]
else:
    ad_words = DEFAULT_AD_WORDS

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
