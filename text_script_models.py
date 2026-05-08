import os
import django
import random

# 1. Configurar o ambiente do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ifridge.settings')
django.setup()

from django.contrib.auth.models import User
from idjango.models import Ingrediente, Frigorifico, Utilizador, Evento, Receita, Comentario


def povoar():
    print("Empty Database detected. A iniciar povoamento completo...")

    # --- 1. CRIAR INGREDIENTES ---
    nomes_ingredientes = ['Pepino', 'Tomate', 'Pão', 'Arroz', 'Alface', 'Cebola', 'Alho']
    ingredientes_objetos = []
    for nome in nomes_ingredientes:
        ing, _ = Ingrediente.objects.get_or_create(nome=nome)
        ingredientes_objetos.append(ing)
    print(f"✅ {len(ingredientes_objetos)} Ingredientes criados.")

    # --- 2. CRIAR UTILIZADORES ---
    dados_users = [
        {'username': 'catarina', 'email': 'cat@email.com', 'nome': 'Catarina'},
        {'username': 'diogo', 'email': 'diogo@email.com', 'nome': 'Diogo'},
        {'username': 'marta', 'email': 'marta@email.com', 'nome': 'Marta'},
        {'username': 'joao', 'email': 'joao@email.com', 'nome': 'João'},
        {'username': 'sofia', 'email': 'sofia@email.com', 'nome': 'Sofia'},
    ]

    utilizadores_lista = []
    for dado in dados_users:
        user_auth, created = User.objects.get_or_create(username=dado['username'], email=dado['email'])
        if created:
            user_auth.set_password('password123')
            user_auth.save()

        # Criar Frigorífico único e dar 2 ingredientes aleatórios
        frigo = Frigorifico.objects.create()
        frigo.ingredientes.set(random.sample(ingredientes_objetos, k=2))

        # Criar Utilizador associado
        utilizador = Utilizador.objects.create(user=user_auth, frigorifico=frigo)
        utilizadores_lista.append(utilizador)
    print(f"✅ {len(utilizadores_lista)} Utilizadores e Frigoríficos criados.")

    # --- 3. CRIAR RECEITAS ---
    receitas_dados = [
        {"nome": "Gaspacho Alentejano", "inst": "Picar tomate, pepino e pão. Juntar água gelada e vinagre."},
        {"nome": "Arroz de Tomate Malandro", "inst": "Refogar cebola e tomate, juntar arroz e muita água."},
        {"nome": "Sandes de Pequeno-Almoço", "inst": "Torrar o pão e rechear com fatias de tomate fresco."},
        {"nome": "Salada de Arroz Fresca", "inst": "Misturar arroz cozido com pepino e cebola picada."},
        {"nome": "Açorda de Alho", "inst": "Esmagar alho com sal, juntar pão e água a ferver."}
    ]

    receitas_objetos = []
    for rd in receitas_dados:
        # Criador aleatório entre os utilizadores criados
        receita = Receita.objects.create(
            criador=random.choice(utilizadores_lista),
            nome=rd['nome'],
            instrucao=rd['inst'],
            classificacao=round(random.uniform(4.0, 5.0), 1)
        )
        receita.ingredientes.set(random.sample(ingredientes_objetos, k=3))
        # 2 utilizadores aleatórios guardam esta receita
        receita.guardadores.set(random.sample(utilizadores_lista, k=2))
        receitas_objetos.append(receita)
    print(f"✅ {len(receitas_objetos)} Receitas criadas.")

    # --- 4. CRIAR EVENTOS ---
    eventos_nomes = [
        "Workshop: Cozinha com Sobras",
        "Jantar de Arroz do Mundo",
        "Degustação de Tomate Biológico",
        "Aula de Sopas Tradicionais",
        "Convívio: Saladas de Verão"
    ]

    for nome_e in eventos_nomes:
        criador_e = random.choice(utilizadores_lista)
        evento = Evento.objects.create(
            criador=criador_e,
            nome=nome_e,
            descricao=f"Evento focado em receitas com ingredientes frescos como os do nosso frigorífico.",
            capacidade_max=random.randint(5, 15)
        )
        # Alguns utilizadores inscrevem-se
        evento.inscritos.set(random.sample(utilizadores_lista, k=3))
    print(f"✅ {len(eventos_nomes)} Eventos criados.")

    # --- 5. CRIAR COMENTÁRIOS ---
    textos_comentarios = [
        "Adorei o Gaspacho, perfeito para o calor!",
        "O arroz ficou um pouco seco, mas o sabor estava ótimo.",
        "Que ideia fantástica usar o pão assim.",
        "Não sabia que pepino ficava tão bem com arroz.",
        "Aprendi imenso no workshop de ontem!"
    ]

    for i in range(5):
        Comentario.objects.create(
            utilizador=random.choice(utilizadores_lista),
            receita=random.choice(receitas_objetos),
            texto=textos_comentarios[i]
        )
    print("✅ 5 Comentários criados.")

    print("\n🎉 Base de dados pronta a usar!")


if __name__ == '__main__':
    povoar()