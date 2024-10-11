import type { Request, Response } from "express";
import * as db from "../database";
import { validator as validator, expectFound, parseId, expectChanges } from "../utils";
import { z } from "zod";
import { expectAdmin, getUsuario } from "./auth";

// cria o validar do corpo da requisição de criação de mensagem, exigindo texto e ID do tópico
const validateCreateBody = validator(z.object({
    texto: z.string().min(1),
    topico_id: z.number(),
}));

// cria o validar dos parâmetros da query na listagem de mensagens, opcionalmente filtrando por subfórum ou tópico
const validateListQuery = validator(z.object({
    sub_forum_id: z.string().optional(),
    topico_id: z.string().optional(),
}));

/** api que retorna todas as mensagens */
export async function list(req: Request, res: Response) {
    // valida os parâmetros da query
    const query = validateListQuery(req.query);

    // define a query SQL base para listar mensagens
    let sql = `
        SELECT mensagem.id, mensagem.usuario_id, usuario.nome as usuario_nome, mensagem.texto, mensagem.created_at
        FROM mensagem JOIN usuario ON usuario.id = mensagem.usuario_id
        WHERE 0 = 0
    `;
    
    // armazena os parâmetros para a query, se houver filtros de subfórum ou tópico
    let params = [];
    if (query.sub_forum_id) {
        // adiciona filtro por subfórum se especificado
        sql += " AND topico.sub_forum_id = ?";
        params.push(parseId(query.sub_forum_id));
    }
    if (query.topico_id) {
        // adiciona filtro por tópico se especificado
        sql += " AND mensagem.topico_id = ?";
        params.push(parseId(query.topico_id));
    }

    // executa a query no banco de dados
    const rows = await db.query(sql, ...params);
    
    // retorna os resultados como um JSON
    return res.json({ rows });
}

/** api que retorna uma mensagem */
export async function get(req: Request<{ id: string }>, res: Response) {
    // valida o ID do caminho
    const id = parseId(req.params.id);
    
    // busca a mensagem no banco de dados, retornando 404 se não for encontrada
    const row = expectFound(await db.fetch(`
        SELECT mensagem.id, mensagem.usuario_id, usuario.nome as usuario_nome, mensagem.texto, mensagem.created_at
        FROM mensagem JOIN usuario ON usuario.id = mensagem.usuario_id
        WHERE mensagem.id = ?
    `, id));
    
    // retorna a mensagem como um JSON
    return res.json(row);
}

/** api que cria uma mensagem */
export async function create(req: Request, res: Response) {
    // obtém o usuário logado (apenas usuários logados podem criar mensagens)
    const user = await getUsuario(req);
    
    // valida o corpo da requisição
    const data = validateCreateBody(req.body);
    
    // verifica se o tópico especificado existe, retornando erro se não for encontrado
    expectFound(await db.fetch(`SELECT id FROM topico WHERE id = ?`, data.topico_id));
    
    // insere a nova mensagem no banco de dados e obtém o ID gerado
    const id = await db.execute("INSERT INTO mensagem(usuario_id, topico_id, texto) VALUES (?, ?, ?)", user.id, data.topico_id, data.texto).then(x => x.lastID);
    
    // busca a mensagem recém-criada para retornar ao cliente
    const row = await db.fetch(`
        SELECT mensagem.id, mensagem.usuario_id, usuario.nome as usuario_nome, mensagem.texto, mensagem.created_at
        FROM mensagem JOIN usuario ON usuario.id = mensagem.usuario_id
        WHERE mensagem.id = ?
    `, id);
    
    // retorna a mensagem criada como um JSON
    return res.json(row);
}

/** api que remove uma mensagem */
export async function remove(req: Request<{ id: string }>, res: Response) {
    // verifica se o usuário logado é um administrador (apenas admins podem remover mensagens)
    expectAdmin(await getUsuario(req));
    
    // valida o ID do caminho
    const id = parseId(req.params.id);
    
    // remove a mensagem do banco de dados, retornando 404 se não for encontrada
    expectChanges(await db.execute("DELETE FROM mensagem WHERE id = ?", id));
    
    // retorna um JSON vazio
    return res.json({});
}
