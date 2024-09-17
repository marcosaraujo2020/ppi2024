import type { Request, Response } from "express";
import * as db from "../database";
import { validator as validator, expectFound, parseId, expectChanges } from "../utils";
import { z } from "zod";
import { expectAdmin, getUsuario } from "./auth";

export const api = { list, get, create, remove };

const validateCreateBody = validator(z.object({
    texto: z.string().min(1),
}));

async function list(req: Request<{ sub_forum_id: string, thread_id: string }>, res: Response) {
    const sub_forum_id = parseId(req.params.sub_forum_id);
    const thread_id = parseId(req.params.thread_id);
    expectFound(await db.fetch(`SELECT id FROM thread WHERE sub_forum_id = ? AND id = ?`, sub_forum_id, thread_id));
    const rows = await db.query(`
        SELECT mensagem.id, mensagem.usuario_id, usuario.nome as usuario_nome, mensagem.texto, mensagem.created_at
        FROM mensagem JOIN usuario ON usuario.id = mensagem.usuario_id
        WHERE mensagem.thread_id = ?
    `, thread_id);
    return res.send({ rows });
}

async function get(req: Request<{ sub_forum_id: string, thread_id: string, id: string }>, res: Response) {
    const sub_forum_id = parseId(req.params.sub_forum_id);
    const thread_id = parseId(req.params.thread_id);
    expectFound(await db.fetch(`SELECT id FROM thread WHERE sub_forum_id = ? AND id = ?`, sub_forum_id, thread_id));
    const id = parseId(req.params.id);
    const row = expectFound(await db.fetch(`
        SELECT mensagem.id, mensagem.usuario_id, usuario.nome as usuario_nome, mensagem.texto, mensagem.created_at
        FROM mensagem JOIN usuario ON usuario.id = mensagem.usuario_id
        WHERE mensagem.thread_id = ? AND mensagem.id = ?
    `, thread_id, id));
    return res.send(row);
}

async function create(req: Request<{ sub_forum_id: string, thread_id: string }>, res: Response) {
    const user = await getUsuario(req);
    const sub_forum_id = parseId(req.params.sub_forum_id);
    const thread_id = parseId(req.params.thread_id);
    expectFound(await db.fetch(`SELECT id FROM thread WHERE sub_forum_id = ? AND id = ?`, sub_forum_id, thread_id));
    const data = validateCreateBody(req.body);
    const id = await db.execute("INSERT INTO mensagem(usuario_id, thread_id, texto) VALUES (?, ?, ?)", user.id, thread_id, data.texto).then(x => x.lastID);
    const row = expectFound(await db.fetch(`
        SELECT mensagem.id, mensagem.usuario_id, usuario.nome as usuario_nome, mensagem.texto, mensagem.created_at
        FROM mensagem JOIN usuario ON usuario.id = mensagem.usuario_id
        WHERE mensagem.thread_id = ? AND mensagem.id = ?
    `, thread_id, id));
    return res.send(row);
}

async function remove(req: Request<{ sub_forum_id: string, thread_id: string, id: string }>, res: Response) {
    expectAdmin(await getUsuario(req));
    const sub_forum_id = parseId(req.params.sub_forum_id);
    const thread_id = parseId(req.params.thread_id);
    expectFound(await db.fetch(`SELECT id FROM thread WHERE sub_forum_id = ? AND id = ?`, sub_forum_id, thread_id));
    const id = parseId(req.params.id);
    expectChanges(await db.execute("DELETE FROM sub_forum WHERE thread_id = ? AND id = ?", thread_id, id));
    return res.send();
}
