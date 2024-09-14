import type { Server } from "http";
import { reset_promise } from "./reset";
import { app, port } from "../src/server";

const url = `http://127.0.0.1:${port}`;

test("teste do servidor", async () => {
    // espera o reset terminar
    await reset_promise;

    // espera o servidor ligar
    const server = await ligarServidor();

    try {
        await GET("/api/sub_forum")
            .then(expectOk)
            .then(expectJson(
                {
                    "rows": [
                        { "id": 1, "nome": "Javascript", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Javascript" },
                        { "id": 2, "nome": "Typescript", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Typescript" },
                        { "id": 3, "nome": "Python", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Python" },
                        { "id": 4, "nome": "Java", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Java" },
                        { "id": 5, "nome": "C", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao C" },
                        { "id": 6, "nome": "C++", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao C++" },
                        { "id": 7, "nome": "C#", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao C#" },
                        { "id": 8, "nome": "Rust", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Rust" },
                        { "id": 9, "nome": "MySQL", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao MySQL" },
                        { "id": 10, "nome": "PostgreSQL", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao PostgreSQL" },
                        { "id": 11, "nome": "Windows", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Windows" },
                        { "id": 12, "nome": "Linux", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Linux" },
                        { "id": 13, "nome": "Vim", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Vim" },
                    ]
                }
            ));

        await GET("/api/sub_forum/5")
            .then(expectOk)
            .then(expectJson(
                {
                    "row": { "id": 5, "nome": "C", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao C" }
                }
            ));

        await POST("/api/sub_forum", {
            "nome": "Novo sub-forum",
            "descricao": "Nova descricao"
        })
            .then(expectOk)
            .then(expectJson(
                {
                    "row":
                    {
                        "id": 14,
                        "nome": "Novo sub-forum",
                        "descricao": "Nova descricao"
                    }
                }
            ));

        await GET("/api/sub_forum/14")
            .then(expectOk)
            .then(expectJson(
                {
                    "row": { "id": 14, "nome": "Novo sub-forum", "descricao": "Nova descricao" }
                }
            ));

        await DELETE("/api/sub_forum/14")
            .then(expectOk);

        await GET("/api/sub_forum/14")
            .then(expectNotFound);

    } finally {
        // testes concluidos fecha o servidor
        server.close();
    }
});

function GET(caminho: string): Promise<Response> {
    return fetch(url + caminho);
}

function POST(caminho: string, body: any): Promise<Response> {
    return fetch(url + caminho, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    });
}

function DELETE(caminho: string): Promise<Response> {
    return fetch(url + caminho, { method: "DELETE" });
}

function expectOk(r: Response): Response {
    expect(r.status).toBeGreaterThanOrEqual(200);
    expect(r.status).toBeLessThan(300);
    return r;
}
function expectNotFound(r: Response): Response {
    expect(r.status).toBe(404);
    return r;
}
function expectJson(object: any): (r: Response) => Promise<void> {
    return async r => expect(await r.json()).toEqual(object);
}

function ligarServidor(): Promise<Server> {
    return new Promise((resolve) => {
        const server = app.listen(port, () => resolve(server))
    });
}
