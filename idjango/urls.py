from django.urls import path
from . import views

app_name = 'idjango'
urlpatterns = [
    path('api/utilizadores/', views.utilizadores),
    path('api/utilizadores/<int:utilizador_id>', views.utilizador_detail),

    path('api/receitas/', views.receitas),
    path('api/receitas/<int:receita_id>', views.receita_detail),

    path('api/evento/', views.eventos),
    path('api/eventos/<int:evento_id>', views.evento_detail),

    path('api/ingredientes/', views.ingredientes),
    path('api/ingredientes/<int:ingrediente_id>', views.ingrediente_detail),
]
