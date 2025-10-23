import psycopg
from psycopg.rows import dict_row
from datetime import datetime
import os

DB_URL = os.getenv("BANCO_API")

def criar_banco():
    conn = psycopg.connect(DB_URL)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha_hash TEXT,
        persona_escolhida TEXT,
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
    # Adicionar a coluna de foto de perfil se ela não existir
    cursor.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='foto_perfil_url') THEN
            ALTER TABLE usuarios ADD COLUMN foto_perfil_url TEXT;
        END IF;
    END $$;
    """)
    conn.commit()
    conn.close()

def pegarPersonaEscolhida(usuario):
    conn = psycopg.connect(DB_URL)
    cursor = conn.cursor(row_factory=dict_row)
    cursor.execute("SELECT persona_escolhida FROM usuarios WHERE email = %s", (usuario,))
    result = cursor.fetchone()
    conn.close()
    return result["persona_escolhida"] if result else None

def escolherApersona(persona, usuario):
    conn = psycopg.connect(DB_URL)
    cursor = conn.cursor()
    cursor.execute("UPDATE usuarios SET persona_escolhida = %s WHERE email = %s", (persona, usuario))
    conn.commit()
    conn.close()

def criarUsuario(nome, email, persona, senha_hash=None):
    conn = psycopg.connect(DB_URL)
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
    conn = psycopg.connect(DB_URL)
    cursor = conn.cursor(row_factory=dict_row)
    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuarioEmail,))
    result = cursor.fetchone()
    conn.close()
    return dict(result) if result else None

def procurarUsuarioPorId(usuario_id):
    conn = psycopg.connect(DB_URL)
    cursor = conn.cursor(row_factory=dict_row)
    cursor.execute("SELECT id, nome, email, foto_perfil_url FROM usuarios WHERE id = %s", (usuario_id,))
    result = cursor.fetchone()
    conn.close()
    return dict(result) if result else None

def atualizarUsuario(usuario_id, nome=None, email=None, foto_perfil_url=None):
    conn = psycopg.connect(DB_URL)
    cursor = conn.cursor(row_factory=dict_row)

    updates = []
    params = []

    if nome is not None:
        updates.append("nome = %s")
        params.append(nome)
    if email is not None:
        updates.append("email = %s")
        params.append(email)
    if foto_perfil_url is not None:
        updates.append("foto_perfil_url = %s")
        params.append(foto_perfil_url)

    if not updates:
        return None

    params.append(usuario_id)

    query = "UPDATE usuarios SET " + ", ".join(updates) + " WHERE id = %s RETURNING id, nome, email, foto_perfil_url"

    cursor.execute(query, tuple(params))
    updated_user = cursor.fetchone()

    conn.commit()
    conn.close()

    return dict(updated_user) if updated_user else None

def carregar_conversas(usuario_email, limite=12):
    conn = psycopg.connect(DB_URL)
    cursor = conn.cursor(row_factory=dict_row)
    cursor.execute("""
        SELECT ur.conteudo AS pergunta, ar.conteudo AS resposta
        FROM mensagens m
        JOIN user_requests ur ON m.request_id = ur.id
        JOIN ai_responses ar ON m.response_id = ar.id
        JOIN conversas c ON m.conversa_id = c.id
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE u.email = %s
        ORDER BY m.criado_em ASC
        LIMIT %s
    """, (usuario_email, limite))
    
    results = cursor.fetchall()
    conn.close()
    
    return [{"pergunta": row["pergunta"], "resposta": row["resposta"]} for row in results] if results else []


def carregar_memorias(usuario_email, limite=20):
    try:
        conn = psycopg.connect(DB_URL)
        conn.autocommit = True
        cursor = conn.cursor(row_factory=dict_row)
        cursor.execute("""
            SELECT ur.conteudo AS usuario_disse,
                ar.conteudo AS ia_respondeu,
                m.criado_em AS quando
            FROM mensagens m
            JOIN user_requests ur ON m.request_id = ur.id
            JOIN ai_responses ar ON m.response_id = ar.id
            JOIN conversas c ON m.conversa_id = c.id
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE u.email = %s
            ORDER BY m.criado_em DESC
            LIMIT %s
        """, (usuario_email, limite))
        results = cursor.fetchall()
        conn.close()
        memorias = []
        for row in results:
            memorias.append(f"Usuário: {row['usuario_disse']}")
            memorias.append(f"IA: {row['ia_respondeu']}")
        return list(reversed(memorias)) if memorias else []
    except Exception as e:
        print(f" Erro ao carregar memórias: {e}")
        return []


def pegarHistorico(usuario_email, limite=3):
    try:
        conn = psycopg.connect(DB_URL)
        cursor = conn.cursor(row_factory=dict_row)
        cursor.execute("""
            SELECT m.id AS id_historico,
                ur.conteudo AS pergunta,
                ar.conteudo AS resposta,
                m.criado_em AS timestamp
            FROM mensagens m
            JOIN user_requests ur ON m.request_id = ur.id
            JOIN ai_responses ar ON m.response_id = ar.id
            JOIN conversas c ON m.conversa_id = c.id
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE u.email = %s
            ORDER BY m.criado_em DESC
            LIMIT %s
        """, (usuario_email, limite))
        results = cursor.fetchall()
        conn.close()
        return [dict(row) for row in results]
    except Exception as e:
        print(f" Erro ao carregar histórico: {e}")
        return []
    
def salvarMensagem(usuario_email, pergunta, resposta, modelo_usado=None, tokens=None):
    conn = psycopg.connect(DB_URL)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id FROM usuarios WHERE email = %s
    """, (usuario_email,))
    
    usuario_result = cursor.fetchone()
    if not usuario_result:
        conn.close()
        raise Exception(f"Usuário com email {usuario_email} não encontrado")
    
    usuario_id = usuario_result[0]

    cursor.execute("""
        SELECT id FROM conversas 
        WHERE usuario_id = %s
        ORDER BY iniciado_em DESC LIMIT 1
    """, (usuario_id,))
    
    conversa = cursor.fetchone()
    if conversa:
        conversa_id = conversa[0]
    else:
        cursor.execute("""
            INSERT INTO conversas (usuario_id) VALUES (%s)
            RETURNING id
        """, (usuario_id,))
        conversa_id = cursor.fetchone()[0]

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
    print(f" Mensagem salva para usuário {usuario_email}")