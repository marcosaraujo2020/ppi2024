import { reset_promise } from "./reset";
import { app } from "../src/server";
import { TEST_PORT } from "../src/config";
import { OK } from "../src/utils";

const url = `http://127.0.0.1:${TEST_PORT}`;

async function testar_servidor() {
    await GET("/api/sub_forum").then(({ status, body }) => {
        expect(status).toBe(OK);
        expect(body).toEqual({
            "rows": [
                { "id": 1, "nome": "Javascript", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Javascript" },
                { "id": 2, "nome": "Linux", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Linux" },
            ]
        });
    });
    await GET("/api/sub_forum/1").then(({ status, body }) => {
        expect(status).toBe(OK);
        expect(body).toEqual(
            { "id": 1, "nome": "Javascript", "descricao": "Este sub-forum é dedicado a perguntas, respostas e discussão de tudo relacionado ao Javascript" }
        );
    });
    await GET("/api/sub_forum/1/thread").then(({ status, body }) => {
        expect(status).toBe(OK);
        expect(new Date(body.rows[0].created_at).getTime()).not.toBeNaN();
        body.rows[0].created_at = "";
        expect(body).toEqual({
            "rows": [
                {
                    "created_at": "",
                    "id": 1,
                    "titulo": "Como clonar um objeto recursivamente no javascript",
                    "usuario_id": 1,
                    "usuario_nome": "Germano",
                },
            ],
        });
    });
    await GET("/api/sub_forum/1/thread/1").then(({ status, body }) => {
        expect(status).toBe(OK);
        expect(new Date(body.created_at).getTime()).not.toBeNaN();
        body.created_at = "";
        expect(body).toEqual({
            "created_at": "",
            "id": 1,
            "titulo": "Como clonar um objeto recursivamente no javascript",
            "usuario_id": 1,
            "usuario_nome": "Germano",
        });
    });
    await GET("/api/sub_forum/1/thread/1/mensagem").then(({ status, body }) => {
        expect(status).toBe(OK);
        body.rows.forEach((row: any) => {
            expect(new Date(row.created_at).getTime()).not.toBeNaN();
            row.created_at = "";
        });
        expect(body).toEqual({
            "rows": [
                {
                    "created_at": "",
                    "id": 1,
                    "texto": "Queria saber como é que se clona um objeto recursivamente, para poder mudar o novo objeto sem afetar o objeto original",
                    "usuario_id": 1,
                    "usuario_nome": "Germano",
                },
                {
                    "created_at": "",
                    "id": 2,
                    "texto": "Tem uma nova api que é structuredClone, https://developer.mozilla.org/en-US/docs/Web/API/structuredClone mas se não estiver disponível onde você precisar também dá para usar JSON.stringify seguido por JSON.parse",
                    "usuario_id": 2,
                    "usuario_nome": "Marcos",
                },
            ],
        });
    });
    await GET("/api/sub_forum/1/thread/1/mensagem/1").then(({ status, body }) => {
        expect(status).toBe(OK);
        expect(new Date(body.created_at).getTime()).not.toBeNaN();
        body.created_at = "";
        expect(body).toEqual({
            "created_at": "",
            "id": 1,
            "texto": "Queria saber como é que se clona um objeto recursivamente, para poder mudar o novo objeto sem afetar o objeto original",
            "usuario_id": 1,
            "usuario_nome": "Germano",
        });
    });
}

test("testa o servidor", async () => {
    // espera o reset terminar
    await reset_promise;
    await new Promise((resolve, reject) => {
        // liga o servidor
        const server = app.listen(TEST_PORT, "127.0.0.1", () => {
            // quando o servidor ligar, roda os testes
            testar_servidor()
                // quando os testes terminarem,
                .finally(() => server.close())
                // retorna sucessos e erros para o jest
                .then(resolve, reject);
        });
    });
});

type ResponseSummary = { status: number, body: any };

function GET(caminho: string): Promise<ResponseSummary> {
    return fetch(url + caminho).then(handleResponse);
}

function POST(caminho: string, body: any): Promise<ResponseSummary> {
    return fetch(url + caminho, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    }).then(handleResponse);
}

function DELETE(caminho: string): Promise<ResponseSummary> {
    return fetch(url + caminho, { method: "DELETE" }).then(handleResponse);
}

async function handleResponse(res: Response): Promise<ResponseSummary> {
    const content_type = res.headers.get("Content-Type") || "";
    return {
        status: res.status,
        body: content_type.startsWith("application/json")
            ? await res.json()
            : "Não foi possível pegar o corpo do request porque Content-Type é " + content_type
    };
}
