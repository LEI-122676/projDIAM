import os
import django
import random

# Configurar o ambiente do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ifridge.settings')
django.setup()

from django.contrib.auth.models import User
from idjango.models import Ingrediente, Frigorifico, Utilizador, Evento, Receita, Comentario


def povoar_real():
    print("🚀 A iniciar povoamento com dados REALISTAS (100 instâncias)...")

    # --- 1. CRIAR 100 INGREDIENTES REAIS ---
    nomes_ingredientes = [
        "Alho", "Cebola", "Tomate", "Azeite", "Manteiga", "Farinha", "Açúcar", "Sal", "Pimenta", "Ovos",
        "Leite", "Natas", "Frango", "Bife de Vaca", "Lombo de Porco", "Pescada", "Bacalhau", "Salmão", "Atum",
        "Camarão",
        "Polvo", "Lulas", "Batata", "Batata-doce", "Cenoura", "Brócolos", "Couve-flor", "Alface", "Pepino", "Pimento",
        "Cogumelos", "Queijo Mozzarella", "Queijo Cheddar", "Queijo da Serra", "Fiambre", "Presunto", "Chouriço",
        "Bacon", "Arroz Agulha", "Arroz Basmati",
        "Esparguete", "Macarrão", "Massa Penne", "Feijão Preto", "Feijão Frade", "Grão-de-bico", "Lentilhas",
        "Ervilhas", "Milho", "Maçã",
        "Pera", "Banana", "Laranja", "Limão", "Morango", "Mirtilos", "Framboesas", "Uvas", "Pêssego", "Ananás",
        "Manga", "Abacate", "Kiwi", "Melancia", "Melão", "Amêndoas", "Nozes", "Amendoim", "Caju", "Mel",
        "Chocolate Negro", "Cacau em Pó", "Canela", "Baunilha", "Noz-moscada", "Cravinho", "Cominhos", "Caril",
        "Pimentão-doce", "Açafrão",
        "Oregãos", "Manjericão", "Salsa", "Coentros", "Louro", "Hortelã", "Alecrim", "Tomilho", "Vinho Branco",
        "Vinho Tinto",
        "Cerveja", "Vinagre Balsâmico", "Mostarda", "Maionese", "Ketchup", "Molho de Soja", "Água das Pedras", "Café",
        "Chá Verde", "Iogurte Natural"
    ]

    ingredientes_db = []
    for nome in nomes_ingredientes:
        ing, _ = Ingrediente.objects.get_or_create(nome=nome)
        ingredientes_db.append(ing)
    print(f"✅ {len(ingredientes_db)} Ingredientes reais criados.")

    # --- 2. CRIAR 100 UTILIZADORES REAIS ---
    primeiros_nomes = ["Ana", "João", "Catarina", "Pedro", "Marta", "Tiago", "Sofia", "Diogo", "Inês", "Bruno",
                       "Beatriz", "Luís", "Joana", "Rui", "Rita"]
    apelidos = ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Sousa",
                "Fernandes", "Gomes", "Almeida", "Ribeiro", "Pinto", "Carvalho"]

    utilizadores_db = []
    # Usar um set para garantir usernames únicos
    usernames_gerados = set()

    while len(utilizadores_db) < 100:
        nome = random.choice(primeiros_nomes)
        apelido = random.choice(apelidos)
        username = f"{nome.lower()}_{apelido.lower()}_{random.randint(1, 999)}"

        if username not in usernames_gerados:
            usernames_gerados.add(username)
            email = f"{username}@gmail.com"

            user_auth, created = User.objects.get_or_create(username=username, email=email)
            if created:
                user_auth.set_password('password123')
                # Opcional: guardar o nome real no User do Django
                user_auth.first_name = nome
                user_auth.last_name = apelido
                user_auth.save()

                frigo = Frigorifico.objects.create()
                frigo.ingredientes.set(random.sample(ingredientes_db, k=random.randint(4, 12)))

                utilizador = Utilizador.objects.create(user=user_auth, frigorifico=frigo)
                utilizadores_db.append(utilizador)

    print(f"✅ {len(utilizadores_db)} Utilizadores (com nomes próprios) criados.")

    # --- 3. CRIAR 100 RECEITAS REALISTAS ---
    metodos = ["Arroz de", "Sopa de", "Creme de", "Salada de", "Risotto de", "Tarte de", "Bolo de", "Empadão de",
               "Caril de", "Massa com", "Assado de", "Grelhada de", "Estufado de"]
    estilos = ["no Forno", "à Brás", "à Gomes de Sá", "com Natas", "à Alentejana", "Especial do Chef", "Tradicional",
               "Rápido de Fazer", "Saudável", "com Ervas Finas", "Picante"]

    receitas_db = []
    for _ in range(100):
        ingrediente_principal = random.choice(ingredientes_db).nome
        nome_receita = f"{random.choice(metodos)} {ingrediente_principal} {random.choice(estilos)}"

        # INSTRUÇÕES ESTRUTURADAS (JSONField em forma de lista)
        passos_reais = [
            f"Passo 1: Lavar e preparar os legumes e o ingrediente principal ({ingrediente_principal.lower()}).",
            "Passo 2: Numa panela grande, aquecer um fio de azeite e refogar cebola picada com um dente de alho.",
            f"Passo 3: Juntar o {ingrediente_principal.lower()} e deixar alourar por alguns minutos.",
            "Passo 4: Adicionar os restantes ingredientes, temperar com sal e pimenta a gosto.",
            "Passo 5: Tapar e deixar cozinhar em lume brando até estar no ponto.",
            "Passo 6: Retirar do lume, decorar com ervas frescas e servir imediatamente."
        ]

        rec = Receita.objects.create(
            criador=random.choice(utilizadores_db),
            nome=nome_receita,
            instrucao=passos_reais,  # Formato de lista para o JSONField!
            classificacao=round(random.uniform(3.0, 5.0), 1)
        )
        rec.ingredientes.set(random.sample(ingredientes_db, k=random.randint(3, 8)))
        rec.guardadores.set(random.sample(utilizadores_db, k=random.randint(0, 15)))
        receitas_db.append(rec)

    print(f"✅ 100 Receitas gastronómicas criadas.")

    # --- 4. CRIAR 100 EVENTOS REALISTAS ---
    tipos_evento = ["Workshop", "Jantar Temático", "Degustação", "Masterclass", "Aula Prática", "Festival"]
    temas_evento = ["Cozinha Italiana", "Sobremesas Fáceis", "Pratos Vegetarianos", "Comida Asiática",
                    "Tapas e Petiscos", "Cozinha Saudável", "Churrasco de Fim de Semana", "Cozinha Alentejana"]

    for _ in range(100):
        nome_ev = f"{random.choice(tipos_evento)}: {random.choice(temas_evento)}"
        ev = Evento.objects.create(
            criador=random.choice(utilizadores_db),
            nome=nome_ev,
            descricao=f"Junta-te a nós neste maravilhoso {nome_ev.lower()}. Traz o teu avental, os ingredientes estão por nossa conta! Teremos opções para todos os gostos e muita diversão.",
            capacidade_max=random.randint(10, 40)
        )
        ev.inscritos.set(random.sample(utilizadores_db, k=random.randint(5, 30)))

    print(f"✅ 100 Eventos criados.")

    # --- 5. CRIAR 100 COMENTÁRIOS REALISTAS ---
    frases_comentario = [
        "Fiz esta receita ontem à noite e a minha família adorou! Muito obrigado pela partilha.",
        "Não tinha todos os ingredientes, por isso troquei o azeite por manteiga. Ficou igualmente bom.",
        "Achei que precisava de um pouco mais de sal, mas a ideia base é excelente.",
        "Cinco estrelas! Uma das melhores receitas que já experimentei por aqui.",
        "A instrução no passo 3 não foi muito clara para mim, mas o resultado final compensou.",
        "Ficou um pouco seco. Da próxima vez vou adicionar mais natas.",
        "Perfeito para um jantar rápido durante a semana. Já está guardada nos meus favoritos!",
        "Muito saboroso e super fácil de preparar. Recomendo a todos.",
        "Uma verdadeira maravilha! O sabor lembra-me a comida da minha avó.",
        "Excelente receita para aproveitar os restos que tinha no frigorífico."
    ]

    for _ in range(100):
        Comentario.objects.create(
            utilizador=random.choice(utilizadores_db),
            receita=random.choice(receitas_db),
            texto=random.choice(frases_comentario)
        )

    print(f"✅ 100 Comentários escritos.")
    print("\n🎉 Base de dados massivamente povoada com DADOS REAIS E EXCELENTES! Bom apetite!")


if __name__ == '__main__':
    povoar_real()