from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__, static_folder='public')
USERS_FILE = os.path.join(os.path.dirname(__file__), 'usuarios.json')

# Utilitários para ler/salvar usuários
def read_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    users = read_users()
    if any(u['email'] == data['email'] for u in users):
        return jsonify({'error': 'Email já cadastrado'}), 400
    senha = data.get('password') or data.get('senha')
    user = {
        'nome': data['nome'],
        'email': data['email'],
        'senha': senha,
        'tipo': 'cliente'
    }
    users.append(user)
    save_users(users)
    return jsonify({'message': 'Usuário cadastrado com sucesso!'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    print('DEBUG - Dados recebidos no login:', data)
    users = read_users()
    print('DEBUG - Usuários carregados:', users)
    senha = data.get('password') or data.get('senha')
    print('DEBUG - Senha recebida:', senha)
    user = next((u for u in users if u['email'] == data['email']), None)
    print('DEBUG - Usuário encontrado:', user)
    if not user or user['senha'] != senha:
        print('DEBUG - Credenciais inválidas')
        return jsonify({'error': 'Credenciais inválidas'}), 401
    print('DEBUG - Login bem-sucedido!')
    return jsonify({'user': {
        'nome': user['nome'],
        'email': user['email'],
        'tipo': user['tipo']
    }}), 200

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# Rota para servir qualquer arquivo da pasta public
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

# Utilitários para ler/salvar outdoors
OUTDOORS_FILE = os.path.join(os.path.dirname(__file__), 'outdoors.json')
def read_outdoors():
    if not os.path.exists(OUTDOORS_FILE):
        return []
    with open(OUTDOORS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)
def save_outdoors(outdoors):
    with open(OUTDOORS_FILE, 'w', encoding='utf-8') as f:
        json.dump(outdoors, f, ensure_ascii=False, indent=2)

# Rota para criar outdoor
@app.route('/api/outdoors', methods=['POST'])
def create_outdoor():
    data = request.json
    nome = data.get('nome')
    localizacao = data.get('localizacao')
    tipo = data.get('tipo')
    usuario = data.get('usuario')
    tipos_validos = ['LED', 'LCD', 'projetor']
    if not nome or not localizacao or not tipo or not usuario:
        return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
    if tipo.upper() not in ['LED', 'LCD'] and tipo.lower() != 'projetor':
        return jsonify({'error': 'Tipo deve ser LED, LCD ou projetor'}), 400
    # Normaliza tipo para manter padrão
    if tipo.lower() == 'projetor':
        tipo_final = 'projetor'
    else:
        tipo_final = tipo.upper()
    outdoors = read_outdoors()
    new_id = (max([o['id'] for o in outdoors], default=0) + 1) if outdoors else 1
    outdoor = {
        'id': new_id,
        'nome': nome,
        'localizacao': localizacao,
        'tipo': tipo_final,
        'usuario': usuario
    }
    outdoors.append(outdoor)
    save_outdoors(outdoors)
    return jsonify({'message': 'Outdoor criado com sucesso!', 'outdoor': outdoor}), 201

# Rota para listar todos os outdoors
@app.route('/api/outdoors', methods=['GET'])
def list_outdoors():
    outdoors = read_outdoors()
    return jsonify(outdoors)

# Rota para obter, editar e deletar outdoor por id
@app.route('/api/outdoors/<int:id>', methods=['GET'])
def get_outdoor(id):
    outdoors = read_outdoors()
    outdoor = next((o for o in outdoors if o['id'] == id), None)
    if not outdoor:
        return jsonify({'error': 'Outdoor não encontrado'}), 404
    return jsonify(outdoor)

@app.route('/api/outdoors/<int:id>', methods=['PUT'])
def update_outdoor(id):
    data = request.json
    outdoors = read_outdoors()
    idx = next((i for i, o in enumerate(outdoors) if o['id'] == id), None)
    if idx is None:
        return jsonify({'error': 'Outdoor não encontrado'}), 404
    # Atualiza apenas os campos permitidos
    for campo in ['nome', 'localizacao', 'tipo', 'usuario']:
        if campo in data:
            outdoors[idx][campo] = data[campo]
    save_outdoors(outdoors)
    return jsonify({'message': 'Outdoor atualizado com sucesso!', 'outdoor': outdoors[idx]})

@app.route('/api/outdoors/<int:id>', methods=['DELETE'])
def delete_outdoor(id):
    outdoors = read_outdoors()
    new_outdoors = [o for o in outdoors if o['id'] != id]
    if len(new_outdoors) == len(outdoors):
        return jsonify({'error': 'Outdoor não encontrado'}), 404
    save_outdoors(new_outdoors)
    return jsonify({'message': 'Outdoor excluído com sucesso!'})

# Rota para listar outdoors do usuário
@app.route('/api/outdoors/meus', methods=['GET'])
def list_outdoors_meus():
    usuario = request.args.get('usuario')
    if not usuario:
        return jsonify({'error': 'Usuário não informado'}), 400
    outdoors = read_outdoors()
    meus = [o for o in outdoors if o.get('usuario') == usuario]
    return jsonify(meus)

# Vincular anúncio a outdoor
@app.route('/api/outdoors/<int:outdoor_id>/anuncios/<anuncio_id>', methods=['POST'])
def vincular_anuncio(outdoor_id, anuncio_id):
    outdoors = read_outdoors()
    anuncios = read_anuncios()
    outdoor = next((o for o in outdoors if o['id'] == outdoor_id), None)
    anuncio = next((a for a in anuncios if a['_id'] == anuncio_id), None)
    if not outdoor or not anuncio:
        return jsonify({'error': 'Outdoor ou anúncio não encontrado'}), 404
    if 'anuncios' not in outdoor:
        outdoor['anuncios'] = []
    if anuncio_id not in outdoor['anuncios']:
        outdoor['anuncios'].append(anuncio_id)
        save_outdoors(outdoors)
    return jsonify({'message': 'Anúncio vinculado com sucesso!'})

# Listar anúncios vinculados a um outdoor
@app.route('/api/outdoors/<int:outdoor_id>/anuncios', methods=['GET'])
def get_anuncios_vinculados(outdoor_id):
    outdoors = read_outdoors()
    anuncios = read_anuncios()
    outdoor = next((o for o in outdoors if o['id'] == outdoor_id), None)
    if not outdoor:
        return jsonify({'error': 'Outdoor não encontrado'}), 404
    if 'anuncios' not in outdoor or not outdoor['anuncios']:
        return jsonify([])
    # Retorna os anúncios na ordem definida em outdoor['anuncios']
    anuncios_dict = {a['_id']: a for a in anuncios}
    vinculados_ordenados = []
    for aid in outdoor['anuncios']:
        if aid in anuncios_dict:
            anuncio = anuncios_dict[aid].copy()
            # Se houver sobrescrita local, aplica
            if 'anuncios_vinculados' in outdoor and aid in outdoor['anuncios_vinculados']:
                anuncio.update(outdoor['anuncios_vinculados'][aid])
            vinculados_ordenados.append(anuncio)
    return jsonify(vinculados_ordenados)

@app.route('/api/outdoors/<int:outdoor_id>/anuncios/<anuncio_id>/vinculado', methods=['PATCH'])
def patch_anuncio_vinculado(outdoor_id, anuncio_id):
    data = request.json
    outdoors = read_outdoors()
    anuncios = read_anuncios()
    outdoor = next((o for o in outdoors if o['id'] == outdoor_id), None)
    if not outdoor:
        return jsonify({'error': 'Outdoor não encontrado'}), 404
    if 'anuncios' not in outdoor or anuncio_id not in outdoor['anuncios']:
        return jsonify({'error': 'Anúncio não vinculado a este outdoor'}), 404
    # Busca se já existe sobrescrita local
    if 'anuncios_vinculados' not in outdoor:
        outdoor['anuncios_vinculados'] = {}
    if anuncio_id not in outdoor['anuncios_vinculados']:
        # Inicializa sobrescrita local a partir do global
        anuncio_global = next((a for a in anuncios if a['_id'] == anuncio_id), None)
        if not anuncio_global:
            return jsonify({'error': 'Anúncio não encontrado'}), 404
        outdoor['anuncios_vinculados'][anuncio_id] = {
            'titulo': anuncio_global['titulo'],
            'duracao': anuncio_global['duracao']
        }
    # Atualiza apenas título e duração
    if 'titulo' in data:
        outdoor['anuncios_vinculados'][anuncio_id]['titulo'] = data['titulo']
    if 'duracao' in data:
        outdoor['anuncios_vinculados'][anuncio_id]['duracao'] = data['duracao']
    save_outdoors(outdoors)
    return jsonify({'message': 'Anúncio vinculado atualizado com sucesso!', 'anuncio': outdoor['anuncios_vinculados'][anuncio_id]})

    outdoors = read_outdoors()
    anuncios = read_anuncios()
    outdoor = next((o for o in outdoors if o['id'] == outdoor_id), None)
    if not outdoor:
        return jsonify({'error': 'Outdoor não encontrado'}), 404
    if 'anuncios' not in outdoor or not outdoor['anuncios']:
        return jsonify([])
    # Retorna os anúncios na ordem definida em outdoor['anuncios']
    anuncios_dict = {a['_id']: a for a in anuncios}
    vinculados_ordenados = [anuncios_dict[aid] for aid in outdoor['anuncios'] if aid in anuncios_dict]
    return jsonify(vinculados_ordenados)

# Desvincular anúncio de outdoor
@app.route('/api/outdoors/<int:outdoor_id>/anuncios/<anuncio_id>', methods=['DELETE'])
def desvincular_anuncio(outdoor_id, anuncio_id):
    outdoors = read_outdoors()
    outdoor = next((o for o in outdoors if o['id'] == outdoor_id), None)
    if not outdoor or 'anuncios' not in outdoor or anuncio_id not in outdoor['anuncios']:
        return jsonify({'error': 'Vínculo não encontrado'}), 404
    outdoor['anuncios'].remove(anuncio_id)
    save_outdoors(outdoors)
    return jsonify({'message': 'Anúncio desvinculado com sucesso!'})

# ---- ANUNCIOS ----
import uuid
from werkzeug.utils import secure_filename
ANUNCIOS_FILE = os.path.join(os.path.dirname(__file__), 'anuncios.json')
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
def read_anuncios():
    if not os.path.exists(ANUNCIOS_FILE):
        return []
    with open(ANUNCIOS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)
def save_anuncios(anuncios):
    with open(ANUNCIOS_FILE, 'w', encoding='utf-8') as f:
        json.dump(anuncios, f, ensure_ascii=False, indent=2)
@app.route('/api/anuncios', methods=['POST'])
def create_anuncio():
    data = request.form
    titulo = data.get('titulo')
    tipo = data.get('tipo')
    duracao = data.get('duracao')
    arquivo = None
    if 'arquivo' in request.files:
        arquivo_obj = request.files['arquivo']
        # Gera nome seguro e único
        filename = f"{uuid.uuid4()}_{secure_filename(arquivo_obj.filename)}"
        caminho = os.path.join(UPLOAD_FOLDER, filename)
        arquivo_obj.save(caminho)
        arquivo = filename
    anuncio = {
        '_id': str(uuid.uuid4()),
        'titulo': titulo,
        'tipo': tipo,
        'duracao': duracao,
        'arquivo': arquivo
    }
    anuncios = read_anuncios()
    anuncios.append(anuncio)
    save_anuncios(anuncios)
    return jsonify({'message': 'Anúncio criado com sucesso!', 'anuncio': anuncio}), 201

@app.route('/uploads/<filename>')
def get_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/anuncios/meus', methods=['GET'])
def get_anuncios_meus():
    anuncios = read_anuncios()
    return jsonify(anuncios)

@app.route('/api/anuncios/<id>', methods=['PATCH'])
def patch_anuncio(id):
    data = request.json
    anuncios = read_anuncios()
    anuncio = next((a for a in anuncios if a['_id'] == id), None)
    if not anuncio:
        return jsonify({'error': 'Anúncio não encontrado'}), 404
    # Atualiza apenas campos permitidos
    for campo in ['titulo', 'tipo', 'duracao']:
        if campo in data:
            anuncio[campo] = data[campo]
    save_anuncios(anuncios)
    return jsonify({'message': 'Anúncio atualizado com sucesso!', 'anuncio': anuncio})

@app.route('/api/anuncios/<id>', methods=['DELETE'])
def delete_anuncio(id):
    anuncios = read_anuncios()
    anuncio = next((a for a in anuncios if a['_id'] == id), None)
    if not anuncio:
        return jsonify({'error': 'Anúncio não encontrado'}), 404
    # Excluir arquivo do disco, se existir
    if anuncio.get('arquivo'):
        caminho = os.path.join(UPLOAD_FOLDER, anuncio['arquivo'])
        if os.path.exists(caminho):
            try:
                os.remove(caminho)
            except Exception as e:
                print(f'Erro ao excluir arquivo: {e}')
    # Remove do json
    anuncios = [a for a in anuncios if a['_id'] != id]
    save_anuncios(anuncios)
    return jsonify({'message': 'Anúncio excluído com sucesso!'})

@app.route('/api/outdoors/<int:outdoor_id>/anuncios/ordem', methods=['PUT'])
def atualizar_ordem_anuncios(outdoor_id):
    data = request.json
    nova_ordem = data.get('ordem')
    if not isinstance(nova_ordem, list):
        return jsonify({'error': 'Ordem inválida'}), 400
    outdoors = read_outdoors()
    outdoor = next((o for o in outdoors if o['id'] == outdoor_id), None)
    if not outdoor:
        return jsonify({'error': 'Outdoor não encontrado'}), 404
    if 'anuncios' not in outdoor:
        outdoor['anuncios'] = []
    # Mantém apenas anúncios já vinculados
    outdoor['anuncios'] = [aid for aid in nova_ordem if aid in outdoor['anuncios']]
    save_outdoors(outdoors)
    return jsonify({'message': 'Ordem atualizada com sucesso!'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
