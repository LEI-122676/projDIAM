from rest_framework import permissions
from .models import Utilizador

def get_role(request):
    if not request.user.is_authenticated:
        return 'Guest'
    try:
        return request.user.utilizador.role
    except Utilizador.DoesNotExist:
        return 'User'

class EventoACL(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        role = get_role(request)
        

        if role == 'Admin':
            return True
        
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.method == 'PATCH' and set(request.data.keys()) == {'inscritos'}:
            return request.user.is_authenticated

        if role == 'EventOrganizer':
            if request.method in ['PUT', 'PATCH', 'DELETE']:
                return obj.criador.user == request.user
        
        return False

class UtilizadorACL(permissions.BasePermission):
    def has_permission(self, request, view):
        role = get_role(request)
        if role == 'Admin':
            return True
        if role in ['User', 'EventOrganizer']:
            if request.method in permissions.SAFE_METHODS:
                return True
            if request.method in ['PUT', 'PATCH', 'DELETE']:
                return True
        return False

    def has_object_permission(self, request, view, obj):
        role = get_role(request)
        if role == 'Admin':
            return True
        if role in ['User', 'EventOrganizer']:
            if request.method in permissions.SAFE_METHODS:
                return True
            # For U and D, must be themselves
            return obj.user == request.user
        return False

class ReceitaACL(permissions.BasePermission):
    def has_permission(self, request, view):
        role = get_role(request)
        if request.method in permissions.SAFE_METHODS:
            return True # All roles including Guest have R
        if role in ['Admin', 'User', 'EventOrganizer']:
            return True # CRUD
        return False

    def has_object_permission(self, request, view, obj):
        role = get_role(request)
        if role == 'Admin':
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        if role in ['User', 'EventOrganizer']:
            if request.method == 'PATCH':
                if set(request.data.keys()) <= {'guardadores'}:
                    return True
            if request.method in ['PUT', 'PATCH', 'DELETE']:
                return obj.criador.user == request.user
            return True
        return False

class FrigorificoACL(permissions.BasePermission):
    def has_permission(self, request, view):
        role = get_role(request)
        if role == 'Admin':
            return True
        if role in ['User', 'EventOrganizer']:
            if request.method in permissions.SAFE_METHODS or request.method in ['PUT', 'PATCH']:
                return True # RU
        return False

    def has_object_permission(self, request, view, obj):
        role = get_role(request)
        if role == 'Admin':
            return True
        if role in ['User', 'EventOrganizer']:
            return hasattr(request.user, 'utilizador') and request.user.utilizador.frigorifico == obj
        return False

class IngredienteACL(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        role = get_role(request)
        if role == 'Admin':
            return True # CRUD
        if role in ['User', 'EventOrganizer']:
            if request.method in ['PUT', 'PATCH', 'DELETE']:
                return True # RUD
        return False

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        role = get_role(request)
        if role == 'Admin':
            return True
        if role in ['User', 'EventOrganizer']:
            if request.method in ['PUT', 'PATCH', 'DELETE']:
                return True
        return False
