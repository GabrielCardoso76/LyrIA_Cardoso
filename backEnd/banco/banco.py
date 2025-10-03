import psycopg2
import psycopg2.extras
from datetime import datetime
import os

DB_URL = os.getenv("BANCO_API")

def criar_banco():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha_hash TEXT,
        persona_escolhida TEXT,
        foto_perfil_url TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        mensagens TEXT,
        iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_requests (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        conversa_id INTEGER NOT NULL,
        conteudo TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY(conversa_id) REFERENCES conversas(id)
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_responses (
        id SERIAL PRIMARY KEY,
        request_id INTEGER NOT NULL,
        conteudo TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modelo_usado TEXT,
        tokens INTEGER,
        FOREIGN KEY(request_id) REFERENCES user_requests(id)
    );    
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mensagens (
        id SERIAL PRIMARY KEY,
        conversa_id INTEGER NOT NULL,
        request_id INTEGER NOT NULL,
        response_id INTEGER NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(conversa_id) REFERENCES conversas(id),
        FOREIGN KEY(request_id) REFERENCES user_requests(id),
        FOREIGN KEY(response_id) REFERENCES ai_responses(id)
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS memorias (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        chave TEXT NOT NULL,
        valor TEXT NOT NULL,
        tipo TEXT,
        relevancia INTEGER DEFAULT 0,
        conversa_origem INTEGER,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expira_em TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    );
    """)
    conn.commit()
    conn.close()

def carregar_memorias(usuario, limite=20):
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("""
        SELECT ur.conteudo AS usuario_disse,
               ar.conteudo AS ia_respondeu,
               m.criado_em AS quando
        FROM mensagens m
        JOIN user_requests ur ON m.request_id = ur.id
        JOIN ai_responses ar ON m.response_id = ar.id
        JOIN conversas c ON m.conversa_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE u.nome = %s
        ORDER BY m.criado_em DESC
        LIMIT %s
    """, (usuario, limite))
    results = cursor.fetchall()
    conn.close()
    memorias = []
    for row in results:
        memorias.append(f"Usuário: {row['usuario_disse']}")
        memorias.append(f"IA: {row['ia_respondeu']}")
    return list(reversed(memorias))

def pegarPersonaEscolhida(usuario):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT persona_escolhida FROM usuarios WHERE nome = %s", (usuario,))
    result = cursor.fetchone()
    conn.close()
    return result["persona_escolhida"] if result else None

def escolherApersona(persona, usuario):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    cursor.execute("UPDATE usuarios SET persona_escolhida = %s WHERE nome = %s", (persona, usuario))
    conn.commit()
    conn.close()

def criarUsuario(nome, email, persona, senha_hash=None):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO usuarios (nome, email, persona_escolhida, senha_hash, criado_em, ultimo_acesso)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (nome, email, persona, senha_hash, datetime.now(), datetime.now()))
    usuario_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    return usuario_id

def procurarUsuarioPorEmail(usuarioEmail):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuarioEmail,))
    result = cursor.fetchone()
    conn.close()
    return dict(result) if result else None

def procurarUsuarioPorNome(usuarioNome):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT * FROM usuarios WHERE nome = %s", (usuarioNome,))
    result = cursor.fetchone()
    conn.close()
    return dict(result) if result else None


def procurarUsuarioPorId(user_id):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT id, nome, email, persona_escolhida, foto_perfil_url, ultimo_acesso FROM usuarios WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    conn.close()
    return dict(result) if result else None


def atualizarUsuario(user_id, nome=None, email=None, senha_hash=None, foto_perfil_url=None):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    query_parts = []
    params = []
    
    if nome:
        query_parts.append("nome = %s")
        params.append(nome)
    if email:
        query_parts.append("email = %s")
        params.append(email)
    if senha_hash:
        query_parts.append("senha_hash = %s")
        params.append(senha_hash)
    if foto_perfil_url:
        query_parts.append("foto_perfil_url = %s")
        params.append(foto_perfil_url)
        
    query_parts.append("ultimo_acesso = %s")
    params.append(datetime.now())
    
    params.append(user_id)

    query = f"UPDATE usuarios SET {', '.join(query_parts)} WHERE id = %s"
    
    cursor.execute(query, tuple(params))
    conn.commit()
    conn.close()

def pegarHistorico(usuario, limite=3):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("""
        SELECT ur.conteudo AS pergunta,
               ar.conteudo AS resposta,
               m.criado_em AS timestamp
        FROM mensagens m
        JOIN user_requests ur ON m.request_id = ur.id
        JOIN ai_responses ar ON m.response_id = ar.id
        JOIN conversas c ON m.conversa_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE u.nome = %s
        ORDER BY m.criado_em DESC
        LIMIT %s
    """, (usuario, limite))
    results = cursor.fetchall()
    conn.close()
    return [dict(row) for row in results]

def carregar_conversas(usuario, limite=12):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("""
        SELECT ur.conteudo AS pergunta, ar.conteudo AS resposta
        FROM mensagens m
        JOIN user_requests ur ON m.request_id = ur.id
        JOIN ai_responses ar ON m.response_id = ar.id
        JOIN conversas c ON m.conversa_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE u.nome = %s
        ORDER BY m.criado_em ASC
        LIMIT %s
    """, (usuario, limite))
    results = cursor.fetchall()
    conn.close()
    return [{"pergunta": row["pergunta"], "resposta": row["resposta"]} for row in results]

def salvarMensagem(usuario_id, pergunta, resposta, conversa_id=None, modelo_usado=None, tokens=None):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()

    if not conversa_id:
        cursor.execute("INSERT INTO conversas (usuario_id) VALUES (%s) RETURNING id", (usuario_id,))
        conversa_id = cursor.fetchone()[0]
    else:
        cursor.execute("UPDATE conversas SET atualizado_em = %s WHERE id = %s", (datetime.now(), conversa_id))

    cursor.execute("""
        INSERT INTO user_requests (usuario_id, conversa_id, conteudo)
        VALUES (%s, %s, %s)
        RETURNING id
    """, (usuario_id, conversa_id, pergunta))
    request_id = cursor.fetchone()[0]

    cursor.execute("""
        INSERT INTO ai_responses (request_id, conteudo, modelo_usado, tokens)
        VALUES (%s, %s, %s, %s)
        RETURNING id
    """, (request_id, resposta, modelo_usado, tokens))
    response_id = cursor.fetchone()[0]

    cursor.execute("""
        INSERT INTO mensagens (conversa_id, request_id, response_id)
        VALUES (%s, %s, %s)
    """, (conversa_id, request_id, response_id))

    cursor.execute("""
        INSERT INTO memorias (usuario_id, chave, valor, tipo, conversa_origem)
        VALUES (%s, %s, %s, 'conversa', %s)
    """, (usuario_id, f"pergunta_{request_id}", pergunta, conversa_id))

    cursor.execute("""
        INSERT INTO memorias (usuario_id, chave, valor, tipo, conversa_origem)
        VALUES (%s, %s, %s, 'conversa', %s)
    """, (usuario_id, f"resposta_{response_id}", resposta, conversa_id))

    conn.commit()
    conn.close()
    return {"conversa_id": conversa_id}


def pegar_conversas_por_usuario(user_id):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("""
        SELECT c.id, c.atualizado_em, COALESCE(ur.conteudo, 'Nova Conversa') as titulo
        FROM conversas c
        LEFT JOIN (
            SELECT conversa_id, conteudo, ROW_NUMBER() OVER(PARTITION BY conversa_id ORDER BY criado_em ASC) as rn
            FROM user_requests
        ) ur ON c.id = ur.conversa_id AND ur.rn = 1
        WHERE c.usuario_id = %s
        ORDER BY c.atualizado_em DESC
    """, (user_id,))
    results = cursor.fetchall()
    conn.close()
    return [dict(row) for row in results]


def carregar_mensagens_da_conversa(conversation_id):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("""
        SELECT ur.conteudo AS pergunta,
               ar.conteudo AS resposta,
               m.criado_em AS timestamp
        FROM mensagens m
        JOIN user_requests ur ON m.request_id = ur.id
        JOIN ai_responses ar ON m.response_id = ar.id
        WHERE m.conversa_id = %s
        ORDER BY m.criado_em ASC
    """, (conversation_id,))
    results = cursor.fetchall()
    conn.close()
    return [dict(row) for row in results]


def deletar_conversa(conversation_id):
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM mensagens WHERE conversa_id = %s", (conversation_id,))
    
    cursor.execute("SELECT id FROM user_requests WHERE conversa_id = %s", (conversation_id,))
    request_ids_tuples = cursor.fetchall()
    if request_ids_tuples:
        request_ids = [r[0] for r in request_ids_tuples]
        cursor.execute("DELETE FROM ai_responses WHERE request_id = ANY(%s)", (request_ids,))
        cursor.execute("DELETE FROM user_requests WHERE id = ANY(%s)", (request_ids,))

    cursor.execute("DELETE FROM memorias WHERE conversa_origem = %s", (conversation_id,))
    cursor.execute("DELETE FROM conversas WHERE id = %s", (conversation_id,))

    conn.commit()
    conn.close()
