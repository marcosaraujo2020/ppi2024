import type { Request, Response } from "express";
import * as db from "../database";
import { validator as validator } from "../utils";
import { z } from "zod";

// cria o validador da query de busca, exigindo que haja um parâmetro "q" que contenha a string de busca
const buscaQuery = validator(z.object({
    q: z.string(),
}));

/** encontra mensagens que contenham o termo esperado */
export async function busca(req: Request, res: Response) {
    // extrai o parâmetro de busca (query "q") e o valida
    const { q: busca } = buscaQuery(req.query);

    // divide a string de busca em termos separados por espaços, tabs ou novas linhas, e remove termos vazios
    const terms = busca.split(/[ \t\n\r]/).filter(x => x.length != 0);

    // constrói a expressão de relevância, atribuindo diferentes pesos (3 e 2) para correspondências exatas e aproximadas
    const relevancia = Array(terms.length).fill(`(CASE 
        WHEN mensagem.texto LIKE ? THEN 3  -- alta relevância para correspondências exatas
        WHEN mensagem.texto LIKE ? THEN 2  -- relevância média para correspondências aproximadas
        ELSE 0  -- baixa relevância
    END)`).join("+");  // soma os pesos para cada termo encontrado

    // gera os parâmetros para correspondências exatas (%termo%) e aproximadas (%termo sem 'r'%)
    const matches = terms.flatMap(x => [`%${x}%`, `%${x.replace(/[rR]/g, "")}%`]);

    // executa a query no banco de dados, retornando mensagens com relevância maior que 1
    const rows = await db.query(`
        SELECT
            mensagem.id,
            mensagem.usuario_id,
            usuario.nome AS usuario_nome,
            mensagem.topico_id,
            topico.titulo AS topico_titulo,
            mensagem.texto,
            mensagem.created_at,
            ${relevancia} AS relevancia  -- calcula a relevância com base nos termos da busca
        FROM mensagem 
        JOIN usuario ON usuario.id = mensagem.usuario_id
        JOIN topico ON topico.id = mensagem.topico_id
        WHERE ${relevancia} > 1  -- apenas resultados com relevância maior que 1 são retornados
        ORDER BY relevancia DESC, mensagem.created_at DESC;  -- ordena por relevância e recência
    `,
        ...matches, // parâmetros da relevância no SELECT
        ...matches, // parâmetros da relevância no WHERE
    );

    // retorna as mensagens encontradas como um JSON
    res.json({ rows });
}
