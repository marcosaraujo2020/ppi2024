import type { Request, Response } from "express";
import * as db from "../database";
import { validator as validator, expectFound, parseId, expectChanges } from "../utils";
import { z } from "zod";
import { expectAdmin, getUsuario } from "./auth";

// cria o validador do o corpo da requisição de criação de tópico, exigindo título e ID de subfórum
const validateCreateBody = validator(z.object({
    titulo: z.string().min(1),
    sub_forum_id: z.number(),
}));

// cria o validador dos parâmetros da query na listagem de tópicos, opcionalmente filtrando por subfórum
const validateListQuery = validator(z.object({
    sub_forum_id: z.string().optional(),
}));

/** api que retorna todos os topicos */
export async function list(req: Request, res: Response) {
    // valida os parâmetros da query
    const query = validateListQuery(req.query);
    
    // define a query SQL base para listar tópicos
    let sql = `
        SELECT topico.id, topico.usuario_id, usuario.nome as usuario_nome, topico.titulo, topico.created_at
        FROM topico JOIN usuario ON usuario.id = topico.usuario_id
    `;
    
    // armazena os parâmetros para a query, se houver um filtro de subfórum
    let params = [];
    if (typeof query.sub_forum_id === "string") {
        // adiciona a cláusula WHERE se o ID do subfórum for fornecido
        sql += " WHERE topico.sub_forum_id = ?";
        params.push(parseId(query.sub_forum_id));
    }
    
    // executa a query no banco de dados
    const rows = await db.query(sql, ...params);
    
    // retorna os resultados como um JSON
    return res.json({ rows });
}
/** api que retorna um topico */
export async function get(req: Request<{ id: string }>, res: Response) {
    // valida o ID do caminho
    const id = parseId(req.params.id);
    
    // busca o tópico no banco de dados, retornando 404 se não for encontrado
    const row = expectFound(await db.fetch(`
        SELECT topico.id, topico.usuario_id, usuario.nome as usuario_nome, topico.titulo, topico.created_at
        FROM topico JOIN usuario ON usuario.id = topico.usuario_id
        WHERE topico.id = ?
    `, id));
    
    // retorna o tópico como um JSON
    return res.json(row);
}

/** api que cria um topico */
export async function create(req: Request, res: Response) {
    // obtém o usuário logado (apenas usuários logados podem criar tópicos)
    const user = await getUsuario(req);
    
    // valida o corpo da requisição
    const data = validateCreateBody(req.body);
    
    // verifica se o subfórum especificado existe, retornando erro se não for encontrado
    expectFound(await db.fetch("SELECT id FROM sub_forum WHERE id = ?", data.sub_forum_id));
    
    // insere o novo tópico no banco de dados e obtém o ID gerado
    const id = await db.execute("INSERT INTO topico(usuario_id, sub_forum_id, titulo) VALUES (?, ?, ?)", user.id, data.sub_forum_id, data.titulo).then(x => x.lastID);
    
    // busca o tópico recém-criado para retornar ao cliente
    const row = await db.fetch(`
        SELECT topico.id, topico.usuario_id, usuario.nome as usuario_nome, topico.titulo, topico.created_at
        FROM topico JOIN usuario ON usuario.id = topico.usuario_id
        WHERE topico.id = ?
    `, id);
    
    // retorna o tópico criado como um JSON
    return res.json(row);
}

/** api que apaga um topico */
export async function remove(req: Request<{ id: string }>, res: Response) {
    // verifica se o usuário logado é um administrador (apenas admins podem remover tópicos)
    expectAdmin(await getUsuario(req));
    
    // valida o ID do caminho
    const id = parseId(req.params.id);
    
    // remove o tópico do banco de dados, retornando 404 se não for encontrado
    expectChanges(await db.execute("DELETE FROM topico WHERE id = ?", id));
    
    // retorna um JSON vazio
    return res.json({});
}
