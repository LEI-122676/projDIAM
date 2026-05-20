import os
import sys
import django
import random
from django.utils import timezone

# 1. Configurar os caminhos para o Python encontrar a app 'ifridge'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# 2. Configurar o ambiente do Django
# Se a tua pasta principal do projeto tiver outro nome, substitui 'projDIAM'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ifridge.settings')
django.setup()

from django.contrib.auth.models import User
from idjango.models import Ingrediente, Frigorifico, Utilizador, Evento, Receita, Avaliacao, Comentario


def povoar_base_de_dados():
    print("🚀 A iniciar povoamento adaptado aos teus models (30 instâncias)...")

    # --- 1. INGREDIENTES (30) ---
    lista_nomes = [
        "Alho", "Cebola", "Tomate", "Azeite", "Manteiga", "Farinha", "Açúcar", "Sal", "Pimenta", "Ovos",
        "Leite", "Natas", "Frango", "Bacalhau", "Batata", "Cenoura", "Brócolos", "Alface", "Pimento", "Queijo",
        "Arroz", "Massa Penne", "Feijão", "Maçã", "Banana", "Limão", "Morango", "Chocolate", "Canela", "Salsa"
    ]

    ingredientes_db = []
    for nome in lista_nomes:
        ing, _ = Ingrediente.objects.get_or_create(nome=nome, defaults={'is_active': True})
        ingredientes_db.append(ing)
    print(f"✅ {len(ingredientes_db)} Ingredientes processados.")

    # --- 2. UTILIZADORES + FRIGORÍFICOS (30) ---
    primeiros_nomes = ["Ana", "João", "Catarina", "Pedro", "Marta", "Tiago", "Sofia", "Diogo", "Inês", "Bruno"]
    apelidos = ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins"]
    roles_pool = ['Admin', 'User', 'Guest', 'EventOrganizer']

    utilizadores_db = []
    i = 1
    while len(utilizadores_db) < 30:
        username = f"user_{i}_{random.randint(100, 999)}"

        if not User.objects.filter(username=username).exists():
            f_name = random.choice(primeiros_nomes)
            l_name = random.choice(apelidos)

            # Criar o User do Django (onde ficam os nomes reais)
            user_auth = User.objects.create_user(
                username=username,
                email=f"user{i}@ifridge.pt",
                password='password123',
                first_name=f_name,
                last_name=l_name
            )

            # Criar o Frigorífico associado
            frigo = Frigorifico.objects.create(is_active=True)
            frigo.ingredientes.set(random.sample(ingredientes_db, k=random.randint(3, 10)))

            # Criar o Utilizador seguindo exatamente os teus campos do model
            utilizador = Utilizador.objects.create(
                user=user_auth,
                frigorifico=frigo,
                bio=f"Apaixonado por gastronomia e utilizador nº{i} da plataforma iFridge.",
                role=roles_pool[i % len(roles_pool)],
                is_active=True
            )
            utilizadores_db.append(utilizador)
        i += 1

    print(f"✅ {len(utilizadores_db)} Utilizadores e Frigoríficos criados.")

    # --- 3. RECEITAS (30) ---
    prefixos = ["Delícia de", "Segredo de", "Gisado de", "Salteado de", "Assado de", "Sopa de"]
    receitas_db = []
    for i in range(30):
        ing_ref = random.choice(ingredientes_db).nome

        receita = Receita.objects.create(
            criador=random.choice(utilizadores_db),
            nome=f"{random.choice(prefixos)} {ing_ref} {i + 1}",
            instrucao=[
                f"Preparar o {ing_ref.lower()}.",
                "Refogar tudo com um fio de azeite e alho picado.",
                "Cozinhar em lume brando por sensivelmente 20 minutos.",
                "Retirar do lume e servir quente com ervas frescas."
            ],
            is_active=True
        )
        # Preencher os ManyToMany
        receita.ingredientes.set(random.sample(ingredientes_db, k=random.randint(3, 7)))
        receita.guardadores.set(random.sample(utilizadores_db, k=random.randint(0, 10)))
        receitas_db.append(receita)
    print(f"✅ {len(receitas_db)} Receitas criadas.")

    # --- 4. EVENTOS (30) ---
    eventos_nomes = ["Workshop Sushi", "Noite de Tapas", "Cozinha Tradicional", "Aula de Doces", "Jantar de Amigos"]
    for i in range(30):
        # A data_evento tem de ser obrigatoriamente no futuro para passar no teu método clean()
        data_futura = timezone.now() + timezone.timedelta(days=random.randint(3, 40))

        evento = Evento.objects.create(
            criador=random.choice(utilizadores_db),
            nome=f"{random.choice(eventos_nomes)} {i + 1}",
            descricao="Um evento dinâmico focado na partilha de receitas e desperdício zero na cozinha.",
            data_evento=data_futura,
            horario={"inicio": "19:30", "fim": "22:00"},
            capacidade_max=random.randint(6, 30),
            is_active=True
        )
        # Adicionar inscritos aleatórios
        evento.inscritos.set(random.sample(utilizadores_db, k=random.randint(1, 5)))
    print(f"✅ {i + 1} Eventos criados (com validação de data futura).")

    # --- 5. AVALIAÇÕES (30) ---
    for _ in range(30):
        Avaliacao.objects.create(
            utilizador=random.choice(utilizadores_db),
            receita=random.choice(receitas_db),
            nota=random.randint(1, 5)
        )
    print(f"✅ 30 Avaliações criadas.")

    # --- 6. COMENTÁRIOS (30) ---
    textos_comentarios = [
        "Ficou absolutamente maravilhoso!",
        "Uma receita super fácil e rápida para o dia a dia.",
        "Adorei a combinação de sabores, resultou muito bem.",
        "Fiz hoje ao jantar e toda a gente cá em casa aprovou.",
        "Vou guardar esta receita nos meus favoritos de certeza!"
    ]
    for _ in range(30):
        Comentario.objects.create(
            utilizador=random.choice(utilizadores_db),
            receita=random.choice(receitas_db),
            texto=random.choice(textos_comentarios)
        )
    print(f"✅ 30 Comentários criados.")

    print("\n✨ Povoamento completo! Todas as tabelas têm agora exatamente 30 instâncias válidas.")


if __name__ == '__main__':
    povoar_base_de_dados()