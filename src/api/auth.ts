import type { Request, Response} from "express";
import * as db from "../database";
import { BAD_REQUEST, CONFLICT, FORBIDDEN, StatusException, UNAUTHORIZED } from "../utils";
import { z } from "zod";

type User = { id: number, nome: string, admin: boolean };

/** validador do zod que verifica a estrutura json que chega no servidor */
const namePassJson = z.object({
    nome: z.string().min(1),
    senha: z.string().min(1),
});

/** o nome do cookie usado para guardar a sessão */
const sessionCookieName = "PPI_2024_SESSION";

/** o regex que válida o formato do cookie */
const sessionCookieRegex = /^[0-9a-f]{64}$/;

/** o quanto tempo uma sessão é válida, em segundos */
const sessionMaxAgeSeconds = 24 * 60 * 60; // um dia

export const api = { signup, login, signoff, logoff };

async function signup(req: Request, res: Response) {
    // valida o corpo que chegou
    const parsed = namePassJson.safeParse(req.body);
    // se o json não tiver no formato correto, então BAD_REQUEST
    if (!parsed.success) return res.status(BAD_REQUEST).send();
    const { nome, senha } = parsed.data;
    // se nome já é usado, então CONFLICT
    if (await db.fetch("SELECT id FROM usuario WHERE nome = ?", nome)) {
        return res.status(CONFLICT).send();
    }
    // cria uma sessão aleatória
    const sessao = await generateRandomSHA256Hash();
    // cria o usuário já com a sessão
    const id = await db.execute(`INSERT INTO usuario (nome, senha, sessao, sessao_validade) VALUES (?, ?, ?, DATETIME(CURRENT_TIMESTAMP, '+${sessionMaxAgeSeconds} seconds'))`, nome, senha, sessao).then(x => x.lastID);
    // retorna o id do usuário criado com o header que salva a sessão no cookie
    return res.cookie(sessionCookieName, sessao, {
        path: "/",
        httpOnly: true,
        maxAge: sessionMaxAgeSeconds * 1000,
    }).send({ id, nome });
}
async function login(req: Request, res: Response) {
    // valida o corpo que chegou
    const parsed = namePassJson.safeParse(req.body);
    // se o json não tiver no formato correto, então BAD_REQUEST
    if (!parsed.success) return res.status(BAD_REQUEST).send();
    const { nome, senha } = parsed.data;
    // cria uma sessão aleatória
    const sessao = await generateRandomSHA256Hash();
    // salva a nova sessão no banco
    await db.execute("UPDATE usuario SET sessao = ?, sessao_validade = DATETIME(CURRENT_TIMESTAMP, '+${sessionMaxAgeSeconds} seconds') WHERE nome = ? AND senha = ?", sessao, nome, senha);
    // retorna a resposta com o header que salva a sessão no cookie
    return res.cookie(sessionCookieName, sessao, {
        path: "/",
        httpOnly: true,
        maxAge: sessionMaxAgeSeconds * 1000,
    }).send();
}
async function signoff(req: Request, res: Response) {
    // valida o corpo que chegou
    const parsed = namePassJson.safeParse(req.body);
    // se o json não tiver no formato correto, então BAD_REQUEST
    if (!parsed.success) return res.status(BAD_REQUEST).send();
    const { nome, senha } = parsed.data;
    // remove o usuário, setando tudo como NULL
    const changes = await db.execute("UPDATE usuario SET nome = NULL, senha = NULL, sessao = NULL, sessao_validade = NULL WHERE nome = ? AND senha = ?", nome, senha).then(x => x.changes);
    if (!changes) {
        // se nada foi removido então FORBIDDEN
        return res.status(FORBIDDEN).send();
    }
    return res.cookie(sessionCookieName, "", {
        path: "/",
        httpOnly: true,
        maxAge: 0,
    }).send();
}
async function logoff(req: Request, res: Response) {
        // obtém a sessão dos cookies do request
        const sessao = getSessao(req);
        // se não tiver sessão então UNAUTHORIZED
        if (!sessao) {
            return res.status(UNAUTHORIZED).send();
        }
        // remove a sessão do banco
        const changes = await db.execute("UPDATE usuario SET sessao = NULL, sessao_validade = NULL WHERE sessao = ? AND sessao_validade > CURRENT_TIMESTAMP", sessao).then(x => x.changes);
        if (!changes) {
            // se nada foi removido então FORBIDDEN
            return res.status(FORBIDDEN).send();
        }
        return res.cookie(sessionCookieName, "", {
            path: "/",
            httpOnly: true,
            maxAge: 0,
        }).send();
}

async function generateRandomSHA256Hash() {
    // Generate a random string
    const randomString = Math.random().toString(36).substring(2);

    // Convert the random string into a Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(randomString);

    // Hash the data using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the hashBuffer to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

/** obtém a sessão dos cookies do request */
function getSessao(req: Request): string | undefined {
    // obtém o cookie do request
    const sessao: string | undefined = req.cookies[sessionCookieName];
    // se o cookie do request não estiver no formato correto, retorna undefined
    if (sessao && !sessionCookieRegex.test(sessao)) return undefined;
    return sessao;
}

/** obtém o usuário atualmente logado, pode retornar um UNAUTHORIZED caso o usuário não esteja logado */
export async function getUsuario(req: Request): Promise<User> {
    // obtém a sessão do request
    const sessao = getSessao(req);
    // obtém o usuário do banco
    const user = sessao && await db.fetch("SELECT id, nome, admin FROM usuario WHERE sessao = ? AND sessao_validade > CURRENT_TIMESTAMP", sessao);
    if (!user) throw new StatusException(UNAUTHORIZED);
    return user
}

/** retorna um FORBIDDEN caso o usuario não seja admin  */
export function expectAdmin(user: User): User & { admin: true } {
    if (!user.admin) {
        throw new StatusException(FORBIDDEN);
    }
    return user as User & { admin: true };
}
