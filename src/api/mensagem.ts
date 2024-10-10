import type { Request, Response } from "express";
import * as db from "../database";
import { validator as validator, expectFound, parseId, expectChanges } from "../utils";
import { z } from "zod";
import { expectAdmin, getUsuario } from "./auth";

export const api = { list, get, create, remove };

const validateCreateBody = validator(z.object({
    texto: z.string().min(1),
    topico_id: z.number(),
}));

const validateListQuery = validator(z.object({
    sub_forum_id: z.string().optional(),
    topico_id: z.string().optional(),
}));

async function list(req: Request, res: Response) {
    const query = validateListQuery(req.query);
    let sql = `
        SELECT mensagem.id, mensagem.usuario_id, usuario.nome as usuario_nome, mensagem.texto, mensagem.created_at
        FROM mensagem JOIN usuario ON usuario.id = mensagem.usuario_id
    `;
    let rows;
    if (typeof query.sub_forum_id === "string" && typeof query.topico_id === "string") {
        rows = await db.query(sql + " WHERE mensagem.sub_forum_id = ? AND mensagem.topico_id = ?", Number(query.sub_forum_id), Number(query.topico_id));
    } else if (typeof query.sub_forum_id === "string") {
        rows = await db.query(sql + " WHERE mensagem.sub_forum_id = ?", Number(query.sub_forum_id));
    } else if (typeof query.topico_id === "string") {
        rows = await db.query(sql + " WHERE mensagem.topico_id = ?", Number(query.topico_id));
    } else {
        rows = await db.query(sql);
    }
    return res.send({ rows });
}

async function get(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);
    const row = expectFound(await db.fetch(`
        SELECT mensagem.id, mensagem.usuario_id, usuario.nome as usuario_nome, mensagem.texto, mensagem.created_at
        FROM mensagem JOIN usuario ON usuario.id = mensagem.usuario_id
        WHERE mensagem.id = ?
    `, id));
    return res.send(row);
}

async function create(req: Request, res: Response) {
    const user = await getUsuario(req);
    const data = validateCreateBody(req.body);
    expectFound(await db.fetch(`SELECT id FROM topico WHERE id = ?`, data.topico_id));
    const id = await db.execute("INSERT INTO mensagem(usuario_id, topico_id, texto) VALUES (?, ?, ?)", user.id, data.topico_id, data.texto).then(x => x.lastID);
    const row = expectFound(await db.fetch(`
        SELECT mensagem.id, mensagem.usuario_id, usuario.nome as usuario_nome, mensagem.texto, mensagem.created_at
        FROM mensagem JOIN usuario ON usuario.id = mensagem.usuario_id
        WHERE mensagem.id = ?
    `, id));
    return res.send(row);
}

async function remove(req: Request<{ id: string }>, res: Response) {
    expectAdmin(await getUsuario(req));
    const id = parseId(req.params.id);
    expectChanges(await db.execute("DELETE FROM sub_forum WHERE id = ?", id));
    return res.send();
}
