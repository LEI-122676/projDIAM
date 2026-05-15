import django
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import *
from .models import *
import os

#Imports de Autenticação
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

QUERY_LIMIT = int(os.environ.get('QUERY_LIMIT', 50))

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

@api_view(['GET'])
def utilizador_frigorifico(request, utilizador_id):
    try:
        utilizador = Utilizador.objects.get(pk=utilizador_id)
        frigorifico = utilizador.frigorifico
        if not frigorifico:
            return Response(status=status.HTTP_404_NOT_FOUND)
    except Utilizador.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'GET':
        serializer = FrigorificoSerializer(frigorifico)
        return Response(serializer.data)
    
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
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

@api_view(['GET', 'PUT', 'DELETE'])
def receita_detail(request, receita_id):
    try:
        receita = Receita.objects.get(pk=receita_id)
    except Receita.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ReceitaSerializer(receita)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ReceitaSerializer(receita, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method == 'DELETE':
        receita.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)

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

@api_view(['GET', 'PUT', 'DELETE'])
def evento_detail(request, evento_id):
    try:
        evento = Evento.objects.get(pk=evento_id)
    except Evento.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = EventoSerializer(evento)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = EventoSerializer(evento, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method == 'DELETE':
        evento.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)

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

@api_view(['GET', 'PUT', 'DELETE'])
def frigorifico_detail(request, frigorifico_id):
    try:
        frigorifico = Frigorifico.objects.get(pk=frigorifico_id)
    except Frigorifico.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FrigorificoSerializer(frigorifico)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = FrigorificoSerializer(frigorifico, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method == 'DELETE':
        frigorifico.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_400_BAD_REQUEST)

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

@api_view(['GET', 'PUT', 'DELETE'])
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

@api_view(['POST'])
def signup(request):
    firstName = request.data.get('firstName')
    lastName = request.data.get('lastName')
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    if not firstName or not lastName or not username or not password or not email:
        return Response({'msg': 'invalid username/password/email'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'msg': 'username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(nome=firstName, apelido=lastName, username=username, password=password, email=email)

    novo_frigorifico = Frigorifico.objects.create()

    Utilizador.objects.create(user=user, frigorifico=novo_frigorifico)
    
    return Response({'msg': 'user ' + user.username + ' created'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
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

