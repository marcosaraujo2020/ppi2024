import type { Request, Response } from "express";
import * as db from "../database";
import { validator as validator, expectFound, parseId, expectChanges } from "../utils";
import { z } from "zod";
import { expectAdmin, getUsuario } from "./auth";

export const api = { list, get, create, remove };

const validateCreateBody = validator(z.object({
    nome: z.string().min(1),
    descricao: z.string().min(1),
}));

async function list(req: Request, res: Response) {
    const rows = await db.query("SELECT sub_forum.id, sub_forum.nome, sub_forum.descricao FROM sub_forum");
    return res.send({ rows });
}

async function get(req: Request<{ id: string }>, res: Response) {
    const id = parseId(req.params.id);
    const row = expectFound(await db.fetch("SELECT sub_forum.id, sub_forum.nome, sub_forum.descricao FROM sub_forum WHERE id = ?", id));
    return res.send(row);
}

async function create(req: Request, res: Response) {
    expectAdmin(await getUsuario(req));
    const data = validateCreateBody(req.body);
    const id = await db.execute("INSERT INTO sub_forum(nome, descricao) VALUES (?, ?)", data.nome, data.descricao).then(x => x.lastID);
    return res.send({ id, ...data });
}

async function remove(req: Request<{id: string}>, res: Response) {
    expectAdmin(await getUsuario(req));
    const id = parseId(req.params.id);
    expectChanges(await db.execute("DELETE FROM sub_forum WHERE id = ?", id));
    return res.send();
}
