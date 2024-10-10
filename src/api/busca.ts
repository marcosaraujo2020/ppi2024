import type { Request, Response } from "express";
import * as db from "../database";
import { validator as validator } from "../utils";
import { z } from "zod";

const buscaQuery = validator(z.object({
    q: z.string(),
}));

export async function busca(req: Request, res: Response) {
    const { q: busca } = buscaQuery(req.query);
    const matches = busca.split(/[ \t\n\r]/).filter(x => x.length != 0);
    const relevancia = Array(matches.length).fill(`(CASE 
        WHEN mensagem.texto LIKE ? THEN 3
        WHEN mensagem.texto LIKE ? THEN 2
        ELSE 0 -- baixa relevância
    END)`).join("+");
    const dupMatches = matches.flatMap(x => [`%${x}%`, `%${x.replaceAll("r", "")}%`]);
    const rows = await db.query(`
        SELECT
            mensagem.id,
            mensagem.usuario_id,
            usuario.nome AS usuario_nome,
            mensagem.texto,
            mensagem.created_at,
            ${relevancia} AS relevancia
        FROM mensagem 
        JOIN usuario ON usuario.id = mensagem.usuario_id
        WHERE ${relevancia} > 1
        ORDER BY relevancia DESC, mensagem.created_at DESC;
    `,
        ...dupMatches, // parâmetros da relevância no select
        ...dupMatches, // parâmetros da relevância no where
    );
    res.json({ rows });
}