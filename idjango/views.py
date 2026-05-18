import django
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from rest_framework import status
from .serializers import *
from .models import *
import os

#Imports de Autenticação
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt

QUERY_LIMIT = int(os.environ.get('QUERY_LIMIT', 150))

@csrf_exempt
@api_view(['GET', 'POST'])
def utilizadores(request):

    if request.method == 'GET': 
        utilizador_list = Utilizador.objects.all()
        serializer = UtilizadorSerializer(utilizador_list, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = UtilizadorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
def utilizador_detail(request, utilizador_id):
    try:
        utilizador = Utilizador.objects.get(pk=utilizador_id)
    except Utilizador.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UtilizadorSerializer(utilizador)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = UtilizadorSerializer(utilizador, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

    elif request.method == 'DELETE':
        utilizador.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET'])
def utilizador_frigorifico(request, utilizador_id):
    try:
        utilizador = Utilizador.objects.get(pk=utilizador_id)
        frigorifico = utilizador.frigorifico
        if not frigorifico:
            # CRIAR AUTOMATICAMENTE SE NÃO EXISTIR
            frigorifico = Frigorifico.objects.create()
            utilizador.frigorifico = frigorifico
            utilizador.save()
            
        serializer = FrigorificoSerializer(frigorifico)
        return Response(serializer.data)
    except Utilizador.DoesNotExist:
        return Response({'msg': 'Utilizador não encontrado'}, status=status.HTTP_404_NOT_FOUND)


@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def receitas(request):
    if request.method == 'GET':
        receita_list = Receita.objects.all()[:QUERY_LIMIT]
        serializer = ReceitaSerializer(receita_list, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        import re, json

        # Para lidar com multipart/form-data (FormData) e listas (ingredientes)
        if hasattr(request.data, 'getlist'):
            data = request.data.dict() # Cria uma cópia básica
            # Recupera as listas reais para campos ManyToMany
            if 'ingredientes' in request.data:
                data['ingredientes'] = request.data.getlist('ingredientes')
            if 'guardadores' in request.data:
                data['guardadores'] = request.data.getlist('guardadores')
        else:
            data = request.data.copy() if hasattr(request.data, 'copy') else request.data

        # Tratar a instrução (pode vir como string JSON do FormData)
        instrucao_raw = data.get('instrucao', [])
        if isinstance(instrucao_raw, str):
            try:
                instrucao_raw = json.loads(instrucao_raw)
            except (json.JSONDecodeError, ValueError):
                # Se não for JSON válido, tenta tratar como string única numa lista
                if instrucao_raw.strip():
                    instrucao_raw = [instrucao_raw]
                else:
                    instrucao_raw = []

        if isinstance(instrucao_raw, list):
            formatted_passos = []
            for i, passo in enumerate(instrucao_raw):
                if isinstance(passo, str):
                    prefix = f"Passo {i+1}: "
                    if not passo.startswith(prefix):
                        passo_limpo = re.sub(r'^Passo \d+:\s*', '', passo)
                        formatted_passos.append(f"{prefix}{passo_limpo}")
                    else:
                        formatted_passos.append(passo)
            data['instrucao'] = formatted_passos

        serializer = ReceitaSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
@authentication_classes([])
def receita_detail(request, receita_id):
    try:
        receita = Receita.objects.get(pk=receita_id)
    except Receita.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ReceitaSerializer(receita)
        return Response(serializer.data)
        
    elif request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = ReceitaSerializer(receita, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data) # Retornar o objeto atualizado
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        receita.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def avaliar_receita(request):
    utilizador_id = request.data.get('utilizador')
    receita_id = request.data.get('receita')
    nota = request.data.get('nota')

    if not all([utilizador_id, receita_id, nota]):
        return Response({'error': 'Dados incompletos'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        utilizador = Utilizador.objects.get(pk=utilizador_id)
        receita = Receita.objects.get(pk=receita_id)

        Avaliacao.objects.update_or_create(utilizador=utilizador,receita=receita,defaults={'nota': int(nota)})
        serializer = ReceitaSerializer(receita)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except (Utilizador.DoesNotExist, Receita.DoesNotExist):
        return Response({'error': 'Utilizador ou Receita não encontrados'}, status=status.HTTP_404_NOT_FOUND)
@csrf_exempt
@api_view(['GET', 'POST'])
def eventos(request):
    if request.method == 'GET':
        evento_list = Evento.objects.all()
        serializer = EventoSerializer(evento_list, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = EventoSerializer(data=request.data)
        if serializer.is_valid():
            evento = serializer.save()
            if evento.criador:
                evento.inscritos.add(evento.criador)
            serializer = EventoSerializer(evento)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def evento_detail(request, evento_id):
    try:
        evento = Evento.objects.get(pk=evento_id)
    except Evento.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = EventoSerializer(evento)
        return Response(serializer.data)
    elif request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = EventoSerializer(evento, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        evento.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'POST'])
def ingredientes(request):
    if request.method == 'GET':
        ingrediente_list = Ingrediente.objects.all()
        serializer = IngredienteSerializer(ingrediente_list, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = IngredienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
def ingrediente_detail(request, ingrediente_id):
    try:
        ingrediente = Ingrediente.objects.get(pk=ingrediente_id)
    except Ingrediente.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = IngredienteSerializer(ingrediente)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = IngredienteSerializer(ingrediente, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method == 'DELETE':
        ingrediente.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'POST'])
def frigorificos(request):
    if request.method == 'GET':
        frigorifico_list = Frigorifico.objects.all()
        serializer = FrigorificoSerializer(frigorifico_list, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = FrigorificoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
@authentication_classes([])
def frigorifico_detail(request, frigorifico_id):
    try:
        frigorifico = Frigorifico.objects.get(pk=frigorifico_id)
    except Frigorifico.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FrigorificoSerializer(frigorifico)
        return Response(serializer.data)
    elif request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = FrigorificoSerializer(frigorifico, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        frigorifico.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'POST'])
def comentarios(request):
    if request.method == 'GET':
        comentarios_list = Comentario.objects.all()
        serializer = ComentarioSerializer(comentarios_list, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ComentarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def comentario_detail(request, comentario_id):
    try:
        comentario = Comentario.objects.get(pk=comentario_id)
    except Comentario.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ComentarioSerializer(comentario)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ComentarioSerializer(comentario, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method == 'DELETE':
        comentario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)


##Authenticação e autorização

@csrf_exempt
@api_view(['POST'])
def signup(request):
    firstName = request.data.get('firstName')
    lastName = request.data.get('lastName')
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    
    if not all([firstName, lastName, username, password, email]):
        return Response({'msg': 'invalid input'}, status=status.HTTP_400_BAD_REQUEST)

    from .moderator import validar_texto
    from rest_framework.exceptions import ValidationError
    try:
        validar_texto(firstName, "nome")
        validar_texto(lastName, "apelido")
        validar_texto(username, "username")
    except ValidationError as e:
        # e.detail pode ser uma lista ou dicionário. Acedemos ao primeiro erro de forma genérica.
        err_msg = e.detail[0] if isinstance(e.detail, list) else str(e.detail)
        return Response({'msg': err_msg}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'msg': 'username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    # User do Django
    user = User.objects.create_user(
        username=username, 
        password=password, 
        email=email,
        first_name=firstName,
        last_name=lastName
    )

    novo_frigorifico = Frigorifico.objects.create()

    # Utilizador do nosso modelo
    Utilizador.objects.create(
        user=user, 
        frigorifico=novo_frigorifico,
        nome=firstName,
        apelido=lastName
    )
    
    return Response({'msg': 'user ' + user.username + ' created'}, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user) # Criação da sessão
        utilizador = Utilizador.objects.get(user=user)
        return Response({'msg': 'user logged in', 'utilizadorId': utilizador.id})
    else:
        return Response({'msg': 'invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['GET'])
def logout_view(request):
    logout(request)
    return Response({'msg': 'user logged out'})

# Endpoint para verificar se o utilizador está autenticado e obter o seu username
@api_view(['GET'])
def user_view(request):
    if request.user.is_authenticated:
        return Response({'username': request.user.username})
    return Response({'username': None})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view_Id(request):
    return Response({'user_id': request.user.id})

@csrf_exempt
@api_view(['GET', 'PUT'])  # <--- Adicionado o PUT aqui
@permission_classes([IsAuthenticated])
def user_info(request, id):
    try:
        user = User.objects.get(id=id)
    except User.DoesNotExist:
        return Response({'error': 'Utilizador não encontrado'}, status=status.HTTP_404_NOT_FOUND)

    # Buscar informações do User
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    # Guardar alterações do User
    elif request.method == 'PUT':
        # Passamos partial=True caso não envies todos os dados obrigatórios do modelo User
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Se houver erros de validação (ex: username em duplicado), devolve ao frontend
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return None