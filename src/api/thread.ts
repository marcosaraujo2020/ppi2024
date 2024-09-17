import type { Request, Response } from "express";
import * as db from "../database";
import { validator as validator, expectFound, parseId, expectChanges } from "../utils";
import { z } from "zod";
import { expectAdmin, getUsuario } from "./auth";

export const api = { list, get, create, remove };

const validateCreateBody = validator(z.object({
    titulo: z.string().min(1),
}));

async function list(req: Request<{ sub_forum_id: string }>, res: Response) {
    const sub_forum_id = parseId(req.params.sub_forum_id);
    const rows = await db.query(`
        SELECT thread.id, thread.usuario_id, usuario.nome as usuario_nome, thread.titulo, thread.created_at
        FROM thread JOIN usuario ON usuario.id = thread.usuario_id
        WHERE thread.sub_forum_id = ?
    `, sub_forum_id);
    return res.send({ rows });
}

async function get(req: Request<{ sub_forum_id: string, id: string }>, res: Response) {
    const sub_forum_id = parseId(req.params.sub_forum_id);
    const id = parseId(req.params.id);
    const row = expectFound(await db.fetch(`
        SELECT thread.id, thread.usuario_id, usuario.nome as usuario_nome, thread.titulo, thread.created_at
        FROM thread JOIN usuario ON usuario.id = thread.usuario_id
        WHERE thread.sub_forum_id = ? AND thread.id = ?
    `, sub_forum_id, id));
    return res.send(row);
}

async function create(req: Request<{ sub_forum_id: string }>, res: Response) {
    const user = await getUsuario(req);
    const sub_forum_id = parseId(req.params.sub_forum_id);
    expectFound(await db.fetch("SELECT id FROM sub_forum WHERE id = ?", sub_forum_id));
    const data = validateCreateBody(req.body);
    const id = await db.execute("INSERT INTO thread(usuario_id, sub_forum_id, titulo) VALUES (?, ?, ?)", user.id, sub_forum_id, data.titulo).then(x => x.lastID);
    const row = expectFound(await db.fetch(`
        SELECT thread.id, thread.usuario_id, usuario.nome as usuario_nome, thread.titulo, thread.created_at
        FROM thread JOIN usuario ON usuario.id = thread.usuario_id
        WHERE thread.sub_forum_id = ? AND thread.id = ?
    `, sub_forum_id, id));
    return res.send(row);
}

async function remove(req: Request<{ sub_forum_id: string, id: string }>, res: Response) {
    expectAdmin(await getUsuario(req));
    const sub_forum_id = parseId(req.params.sub_forum_id);
    const id = parseId(req.params.id);
    expectChanges(await db.execute("DELETE FROM sub_forum WHERE sub_forum_id = ? AND id = ?", sub_forum_id, id));
    return res.send();
}
