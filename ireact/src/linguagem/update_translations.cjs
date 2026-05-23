const fs = require('fs');
const path = require('path');

const ptPath = path.join(__dirname, 'pt.json');
const enPath = path.join(__dirname, 'en.json');
const esPath = path.join(__dirname, 'es.json');

const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));

pt.admin = {
    "gerir_utilizadores": "Gerir Utilizadores",
    "criar_utilizador": "Criar Utilizador",
    "tabela": {
        "username": "Username",
        "nome_completo": "Nome Completo",
        "email": "Email",
        "permissao": "Permissão",
        "acoes": "Ações",
        "vazio": "Não existem outros utilizadores registados."
    },
    "botoes": {
        "guardar": "Guardar",
        "eliminar": "Eliminar"
    },
    "popups": {
        "erro_carregar": "Não foi possível carregar os utilizadores.",
        "sucesso_titulo": "Sucesso",
        "permissoes_atualizadas": "Permissões do utilizador atualizadas.",
        "erro_titulo": "Erro",
        "falha_atualizar": "Falha ao atualizar as permissões do utilizador.",
        "confirmar_eliminacao": "Confirmar Eliminação",
        "apagar_conta_msg": "Tens a certeza que desejas eliminar esta conta? Esta ação irá desativar a conta.",
        "eliminar": "Eliminar",
        "cancelar": "Cancelar",
        "conta_eliminada": "Conta Eliminada",
        "conta_eliminada_msg": "A conta do utilizador foi eliminada/desativada com sucesso.",
        "erro_eliminar_msg": "Não foi possível eliminar a conta do utilizador."
    }
};

en.admin = {
    "gerir_utilizadores": "Manage Users",
    "criar_utilizador": "Create User",
    "tabela": {
        "username": "Username",
        "nome_completo": "Full Name",
        "email": "Email",
        "permissao": "Permission",
        "acoes": "Actions",
        "vazio": "No other users are registered."
    },
    "botoes": {
        "guardar": "Save",
        "eliminar": "Delete"
    },
    "popups": {
        "erro_carregar": "Unable to load users.",
        "sucesso_titulo": "Success",
        "permissoes_atualizadas": "User permissions updated.",
        "erro_titulo": "Error",
        "falha_atualizar": "Failed to update user permissions.",
        "confirmar_eliminacao": "Confirm Deletion",
        "apagar_conta_msg": "Are you sure you want to delete this account? This will deactivate the account.",
        "eliminar": "Delete",
        "cancelar": "Cancel",
        "conta_eliminada": "Account Deleted",
        "conta_eliminada_msg": "User account was successfully deleted/deactivated.",
        "erro_eliminar_msg": "Unable to delete user account."
    }
};

es.admin = {
    "gerir_utilizadores": "Gestionar Usuarios",
    "criar_utilizador": "Crear Usuario",
    "tabela": {
        "username": "Nombre de usuario",
        "nome_completo": "Nombre Completo",
        "email": "Email",
        "permissao": "Permiso",
        "acoes": "Acciones",
        "vazio": "No hay otros usuarios registrados."
    },
    "botoes": {
        "guardar": "Guardar",
        "eliminar": "Eliminar"
    },
    "popups": {
        "erro_carregar": "No se pudieron cargar los usuarios.",
        "sucesso_titulo": "Éxito",
        "permissoes_atualizadas": "Permisos de usuario actualizados.",
        "erro_titulo": "Error",
        "falha_atualizar": "No se pudieron actualizar los permisos del usuario.",
        "confirmar_eliminacao": "Confirmar Eliminación",
        "apagar_conta_msg": "¿Estás seguro de que deseas eliminar esta cuenta? Esta acción desactivará la cuenta.",
        "eliminar": "Eliminar",
        "cancelar": "Cancelar",
        "conta_eliminada": "Cuenta Eliminada",
        "conta_eliminada_msg": "La cuenta del usuario fue eliminada/desactivada con éxito.",
        "erro_eliminar_msg": "No se pudo eliminar la cuenta del usuario."
    }
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 4));
fs.writeFileSync(enPath, JSON.stringify(en, null, 4));
fs.writeFileSync(esPath, JSON.stringify(es, null, 4));

console.log('Translations updated!');
