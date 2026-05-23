import random
from idjango.models import Feedback, Utilizador, User, Frigorifico

users_to_create = ['feedback_user1', 'feedback_user2', 'feedback_user3', 'feedback_user4', 'feedback_user5']
utilizadores = []

for username in users_to_create:
    user, created = User.objects.get_or_create(username=username)
    if created:
        user.set_password('password123')
        user.save()
    
    try:
        utilizador = Utilizador.objects.get(user=user)
    except Utilizador.DoesNotExist:
        frig = Frigorifico.objects.create()
        utilizador = Utilizador.objects.create(user=user, frigorifico=frig, role='User')
        
    utilizadores.append(utilizador)

# Clean old feedbacks for these test users
Feedback.objects.filter(utilizador__in=utilizadores).delete()

# Create dummy feedback
funcionalidades = ['Receitas', 'Eventos', 'Frigorifico', 'Estetica']
comentarios = [
    "Adoro as receitas!",
    "Muito fácil de usar o frigorífico.",
    "O design podia ser um bocadinho mais moderno.",
    "Eventos fantásticos e bem organizados.",
    ""
]

for util in utilizadores:
    Feedback.objects.create(
        utilizador=util,
        nota_receitas=random.randint(3, 5),
        nota_eventos=random.randint(2, 5),
        nota_frigorifico=random.randint(4, 5),
        nota_estetica=random.randint(3, 5),
        funcionalidade_favorita=random.choice(funcionalidades),
        comentario_livre=random.choice(comentarios)
    )

print(f"Foram adicionados {len(utilizadores)} novos feedbacks à base de dados com sucesso.")
