import os
import django
import random
from django.utils import timezone

# Configurar o ambiente do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ifridge.settings')
django.setup()

from django.contrib.auth.models import User
# Certifique-se que o nome da app está correto
from idjango.models import Ingrediente, Frigorifico, Utilizador, Evento, Receita, Comentario


def povoar_50():
    print("🚀 A iniciar povoamento (50 instâncias por modelo)...")

    # --- 1. INGREDIENTES (50) ---
    lista_nomes = [
        "Alho", "Cebola", "Tomate", "Azeite", "Manteiga", "Farinha", "Açúcar", "Sal", "Pimenta", "Ovos",
        "Leite", "Natas", "Frango", "Bacalhau", "Batata", "Cenoura", "Brócolos", "Alface", "Pimento", "Queijo",
        "Arroz", "Massa Penne", "Feijão", "Maçã", "Banana", "Limão", "Morango", "Chocolate", "Canela", "Salsa",
        "Coentros", "Vinho Branco", "Mostarda", "Mel", "Cogumelos", "Bacon", "Fiambre", "Camarão", "Atum", "Salmão",
        "Grão-de-bico", "Ervilhas", "Pêssego", "Nozes", "Caril", "Oregãos", "Manjericão", "Café", "Iogurte", "Cerveja"
    ]

    ingredientes_db = []
    for nome in lista_nomes:
        ing, _ = Ingrediente.objects.get_or_create(nome=nome)
        ingredientes_db.append(ing)
    print(f"✅ {len(ingredientes_db)} Ingredientes criados.")

    # --- 2. UTILIZADORES + FRIGORÍFICOS (50) ---
    primeiros_nomes = ["Ana", "João", "Catarina", "Pedro", "Marta", "Tiago", "Sofia", "Diogo", "Inês", "Bruno"]
    apelidos = ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins"]

    utilizadores_db = []
    for i in range(50):
        username = f"user_{i}_{random.randint(100, 999)}"

        if not User.objects.filter(username=username).exists():
            # Dados aleatórios para nome e apelido
            f_name = random.choice(primeiros_nomes)
            l_name = random.choice(apelidos)

            user_auth = User.objects.create_user(
                username=username,
                email=f"{username}@ifridge.pt",
                password='password123',
                first_name=f_name,
                last_name=l_name
            )

            frigo = Frigorifico.objects.create()
            frigo.ingredientes.set(random.sample(ingredientes_db, k=random.randint(3, 10)))

            # ATUALIZAÇÃO: Adicionados campos nome e apelido conforme o novo model
            utilizador = Utilizador.objects.create(
                user=user_auth,
                nome=f_name,
                apelido=l_name,
                frigorifico=frigo,
                bio=f"Apaixonado por gastronomia e utilizador nº{i} do iFridge."
            )
            utilizadores_db.append(utilizador)

    print(f"✅ {len(utilizadores_db)} Utilizadores e Frigoríficos criados.")

    # --- 3. RECEITAS (50) ---
    prefixos = ["Delícia de", "Segredo de", "Gisado de", "Salteado de", "Assado de", "Sopa de"]
    receitas_db = []
    for i in range(50):
        ing_ref = random.choice(ingredientes_db).nome
        rec = Receita.objects.create(
            criador=random.choice(utilizadores_db),
            nome=f"{random.choice(prefixos)} {ing_ref}",
            instrucao=[
                f"Preparar o {ing_ref.lower()}.",
                "Refogar com azeite e alho.",
                "Cozinhar em lume brando por 20 min.",
                "Servir quente com ervas frescas."
            ]
        )
        rec.ingredientes.set(random.sample(ingredientes_db, k=random.randint(3, 7)))
        rec.guardadores.set(random.sample(utilizadores_db, k=random.randint(0, 10)))
        receitas_db.append(rec)
    print(f"✅ 50 Receitas criadas.")

    # --- 4. EVENTOS (50) ---
    eventos_nomes = ["Workshop Sushi", "Noite de Tapas", "Cozinha Tradicional", "Aula de Doces", "Jantar de Amigos"]
    for i in range(50):
        ev = Evento.objects.create(
            criador=random.choice(utilizadores_db),
            nome=f"{random.choice(eventos_nomes)} {i + 1}",
            descricao=f"Evento gastronómico focado em partilha e aprendizagem. Capacidade limitada!",
            data_evento=timezone.now() + timezone.timedelta(days=random.randint(5, 45)),
            horario={"inicio": "19:00", "fim": "22:00"},
            capacidade_max=random.randint(5, 25)
        )
        ev.inscritos.set(random.sample(utilizadores_db, k=random.randint(2, 5)))
    print(f"✅ 50 Eventos criados.")

    # --- 5. COMENTÁRIOS (50) ---
    textos = [
        "Ficou maravilhoso!", "Fácil e rápido.", "Adorei a combinação de sabores.",
        "Fiz no fim de semana e todos gostaram.", "Vou guardar esta receita."
    ]
    for _ in range(50):
        Comentario.objects.create(
            utilizador=random.choice(utilizadores_db),
            receita=random.choice(receitas_db),
            texto=random.choice(textos)
        )
    print(f"✅ 50 Comentários criados.")

    print("\n✨ Concluído! O povoamento foi realizado com sucesso.")


if __name__ == '__main__':
    povoar_50()