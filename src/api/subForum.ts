import type { Request, Response } from "express";
import * as db from "../database";
import { validator as validator, expectFound, parseId, expectChanges } from "../utils";
import { z } from "zod";
import { expectAdmin, getUsuario } from "./auth";

const validateCreateBody = validator(z.object({
    nome: z.string().min(1),
    descricao: z.string().min(1),
}));

/** api que retorna todos os subforums */
export async function list(req: Request, res: Response) {
    // obtém todas as linhas do banco
    const rows = await db.query("SELECT sub_forum.id, sub_forum.nome, sub_forum.descricao FROM sub_forum");
    // retorna como um json
    return res.json({ rows });
}

/** api que retorna um subforum */
export async function get(req: Request<{ id: string }>, res: Response) {
    // valida o id do caminho
    const id = parseId(req.params.id);
    // obtem a linha do banco, retornando 404 se não for encontrada
    const row = expectFound(await db.fetch("SELECT sub_forum.id, sub_forum.nome, sub_forum.descricao FROM sub_forum WHERE id = ?", id));
    // retorna como um json
    return res.json(row);
}

/** api que cria um subforum */
export async function create(req: Request, res: Response) {
    // verifica se o usuário está logado e se é admin (apenas admins podem criar sub forums)
    expectAdmin(await getUsuario(req));
    // valida o corpo do request
    const data = validateCreateBody(req.body);
    // insere os dados no banco
    const id = await db.execute("INSERT INTO sub_forum(nome, descricao) VALUES (?, ?)", data.nome, data.descricao).then(x => x.lastID);
    // obtém os dados inseridos para retorna ao cliente
    const row = await db.fetch("SELECT sub_forum.id, sub_forum.nome, sub_forum.descricao FROM sub_forum WHERE id = ?", id);
    // retorna como um json
    return res.json(row);
}

/** api que apaga um subforum */
export async function remove(req: Request<{id: string}>, res: Response) {
    // verifica se o usuário está logado e se é admin (apenas admins podem apagar sub forums)
    expectAdmin(await getUsuario(req));
    // valida o id do caminho
    const id = parseId(req.params.id);
    // apaga a linha do banco, retornando 404 se não for encontrada
    expectChanges(await db.execute("DELETE FROM sub_forum WHERE id = ?", id));
    // retorna um json vazio
    return res.json({});
}
