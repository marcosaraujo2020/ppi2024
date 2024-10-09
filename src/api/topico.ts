import type { Request, Response } from "express";
import * as db from "../database";
import { validator as validator, expectFound, parseId, expectChanges } from "../utils";
import { z } from "zod";
import { expectAdmin, getUsuario } from "./auth";

export const api = { list, get, create, remove };

const validateCreateBody = validator(z.object({
    titulo: z.string().min(1),
    sub_forum_id: z.number(),
}));

const validateListQuery = validator(z.object({
    sub_forum_id: z.number().optional(),
}));

async function list(req: Request, res: Response) {
    const query = validateListQuery(req.query);
    const sql = `
        SELECT topico.id, topico.usuario_id, usuario.nome as usuario_nome, topico.titulo, topico.created_at
        FROM topico JOIN usuario ON usuario.id = topico.usuario_id
    `;
    let rows;
    if (typeof query.sub_forum_id === "number") {
        rows = await db.query(sql + " WHERE topico.sub_forum_id = ?", query.sub_forum_id);
    } else {
        rows = await db.query(sql);
    }
    return res.send({ rows });
}

async function get(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);
    const row = expectFound(await db.fetch(`
        SELECT topico.id, topico.usuario_id, usuario.nome as usuario_nome, topico.titulo, topico.created_at
        FROM topico JOIN usuario ON usuario.id = topico.usuario_id
        WHERE topico.id = ?
    `, id));
    return res.send(row);
}

async function create(req: Request, res: Response) {
    const user = await getUsuario(req);
    const data = validateCreateBody(req.body);
    expectFound(await db.fetch("SELECT id FROM sub_forum WHERE id = ?", data.sub_forum_id));
    const id = await db.execute("INSERT INTO topico(usuario_id, sub_forum_id, titulo) VALUES (?, ?, ?)", user.id, data.sub_forum_id, data.titulo).then(x => x.lastID);
    const row = expectFound(await db.fetch(`
        SELECT topico.id, topico.usuario_id, usuario.nome as usuario_nome, topico.titulo, topico.created_at
        FROM topico JOIN usuario ON usuario.id = topico.usuario_id
        WHERE topico.id = ?
    `, id));
    return res.send(row);
}

async function remove(req: Request<{ id: string }>, res: Response) {
    expectAdmin(await getUsuario(req));
    const id = parseId(req.params.id);
    expectChanges(await db.execute("DELETE FROM sub_forum WHERE id = ?", id));
    return res.send();
}
