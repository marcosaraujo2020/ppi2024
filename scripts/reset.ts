import * as db from "../src/database";

async function create() {
    await db.execute(`CREATE TABLE sub_forum (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT NOT NULL
    )`);

    await db.execute(`CREATE TABLE thread (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sub_forum_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        descricao TEXT NOT NULL,
        FOREIGN KEY (sub_forum_id) REFERENCES sub_forum(id)
    )`);
}

async function populate() {
    await db.execute(`INSERT INTO sub_forum (nome, descricao) VALUES
        ('Javascript', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Javascript'),
        ('Typescript', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Typescript'),
        ('Python', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Python'),
        ('Java', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Java'),
        ('C', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao C'),
        ('C++', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao C++'),
        ('C#', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao C#'),
        ('Rust', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Rust'),
        ('MySQL', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao MySQL'),
        ('PostgreSQL', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao PostgreSQL'),
        ('Windows', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Windows'),
        ('Linux', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Linux'),
        ('Vim', 'Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Vim');
    `);
}

/** apaga o banco, então cria as tabela, então popula as tabelas
 *
 * nós exportamos a promessa para que o teste possa saber quando o reset terminou
 */
export const reset_promise = db.delete_database().then(create).then(populate);
