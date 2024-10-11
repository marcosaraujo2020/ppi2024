import * as db from "../src/database";

async function create() {
    await db.execute(`CREATE TABLE usuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        senha TEXT NOT NULL,
        admin BOOLEAN NOT NULL DEFAULT FALSE,
        sessao TEXT,
        sessao_validade TIMESTAMP
    )`);

    await db.execute(`CREATE TABLE sub_forum (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT NOT NULL
    )`);

    await db.execute(`CREATE TABLE topico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sub_forum_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sub_forum_id) REFERENCES sub_forum(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE NO ACTION ON UPDATE CASCADE
    )`);

    await db.execute(`CREATE TABLE mensagem (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topico_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        texto TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topico_id) REFERENCES topico(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE NO ACTION ON UPDATE CASCADE
    )`);
}

async function populate() {
    await db.execute(`INSERT INTO usuario (nome, email, senha, admin) VALUES
        ('Germano', 'germano@gmail.com', '12345', TRUE),
        ('Marcos', 'marcos@gmail.com', '12345', TRUE);
    `);

    // Germano = 1
    // Marcos = 2

    await db.execute(`INSERT INTO sub_forum (nome, descricao) VALUES
        ('Javascript', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Javascript'),
        ('Linux', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Linux');
    `);

    // Javascript = 1
    // Linux = 2

    await db.execute(`INSERT INTO topico (sub_forum_id, usuario_id, titulo) VALUES
        (1, 1, 'Como clonar um objeto recursivamente no javascript'),
        (2, 2, 'Como apago todos os node_modules recursivamente com find');
    `);

    // Pergunta do Javascript = 1
    // Pergunta do Linux = 2

    await db.execute(`INSERT INTO mensagem (topico_id, usuario_id, texto) VALUES
        (1, 1, 'Queria saber como é que se clona um objeto recursivamente, para poder mudar o novo objeto sem afetar o objeto original'),
        (1, 2, 'Tem uma nova api que é structuredClone, https://developer.mozilla.org/en-US/docs/Web/API/structuredClone mas se não estiver disponível onde você precisar também dá para usar JSON.stringify seguido por JSON.parse'),
        (2, 2, 'No linux, como faço para apgar todos os node_modules de uma pasta recursivamente'),
        (2, 1, 'Dá para gerar os comandos para apagar os arquivos com (find -name node_modules -type d -printf "rm -rf -- ''%p''\\n"), se estiver tudo certo, você pode repassar para o shell assim: (find -name node_modules -type d -printf "rm -rf -- ''%p''\n" | sh)');
    `);
}

// apaga o banco, então cria as tabela, então popula as tabelas
db.deleteDatabase().then(create).then(populate);
