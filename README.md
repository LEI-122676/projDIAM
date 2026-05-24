# Projeto DIAM - 2025/2026: iFridge

## 👥 Grupo 3
- Catarina Figueiredo, 122706
- Pedro Nunes, 122704
- Sebastian Rodriguez, 122667
- Tiago Candeias, 122676

## 🚀 Como Instalar e Executar o Projeto

Como o ficheiro `.gitignore` previne que pastas pesadas de bibliotecas e ambientes virtuais sejam enviadas para o GitHub, precisas de instalar as dependências localmente na tua máquina.

### 1. Frontend (iReact)
Certifica-te que tens o [Node.js](https://nodejs.org/) instalado. Abre um terminal na raiz do projeto e segue os passos:

```bash
# 1. Entrar na pasta do frontend
cd ireact

# 2. Instalar as dependências do NPM (cria a pasta node_modules omitida do GitHub)
npm install

# 3. Executar a aplicação (o Vite vai disponibilizar a app em http://localhost:5173 por norma)
npm run dev
```

### 2. Backend (iFridge / iDjango)
Certifica-te que tens o [Python](https://www.python.org/) instalado. Abre **outro terminal** (para poderes correr em simultâneo com o Frontend) na raiz do projeto:

```bash
# 1. Criar um ambiente virtual para isolar as dependências
python -m venv venv

# 2. Ativar o ambiente virtual
# -> No Windows:
venv\Scripts\activate
# -> No Linux/Mac:
source venv/bin/activate

# 3. Instalar o Django e as dependências (se tiverem dependências extra como django-cors-headers, adicionem aqui)
pip install django djangorestframework django-cors-headers Pillow

# 4. Preparar a base de dados
python manage.py migrate

# 5. Iniciar o servidor (em http://localhost:8000)
python manage.py runserver
```

> **Aviso:** Se mais tarde adicionarem mais pacotes de Python, lembrem-se de criar um ficheiro `requirements.txt` correndo `pip freeze > requirements.txt`! Se esse ficheiro existir, basta fazer instalá-lo com `pip install -r requirements.txt` no passo 3.
