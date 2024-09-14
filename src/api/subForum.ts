import type { Express } from "express";
import * as db from "../database";
import { BAD_REQUEST, NOT_FOUND, parseId } from "../utils";
import { z, TypeOf } from "zod";

/** infere o tipo do typescript do validador zod, para podermos usar também como um tipo */
type SubForum = TypeOf<typeof SubForum>;

/** validador do zod que verifica a estrutura json que chega no servidor */
const SubForum = z.object({
    id: z.number().refine(Number.isSafeInteger).optional(),
    nome: z.string().min(1),
    descricao: z.string().min(1),
});

/** configua as apis do subForum no app do Express */
export function setupApi(app: Express) {
    app.get("/api/sub_forum", async (req, res) => {
        // obtém todas as linhas
        const rows = await db.query<SubForum>("SELECT * FROM sub_forum");
        return res.send({ rows });
    });
    app.get("/api/sub_forum/:id", async (req, res) => {
        // valida o id
        const id = parseId(req.params.id);
        // se id é inválido, então BAD_REQUEST
        if (id === undefined) return res.sendStatus(BAD_REQUEST);
        // obtém a linha do banco
        const row = await db.fetch<SubForum>("SELECT * FROM sub_forum WHERE id = ?", id);
        // se o id não foi encontrado, então NOT_FOUND
        if (!row) return res.sendStatus(NOT_FOUND);
        return res.send({ row });
    });
    app.post("/api/sub_forum", async (req, res) => {
        // valida o corpo que chegou
        const parsed = SubForum.safeParse(req.body);
        // se o json não tiver no formato correto, então BAD_REQUEST
        if (!parsed.success) return res.sendStatus(BAD_REQUEST);
        const data = parsed.data;
        if (data.id !== undefined) {
            // o id foi especificado, atualiza a linha no banco
            const changes = await db.execute("UPDATE sub_forum SET nome = ?, descricao = ? WHERE id = ?", data.nome, data.descricao, data.id).then(x => x.changes);
            // se nada foi modificado, então NOT_FOUND
            if (!changes) return res.sendStatus(NOT_FOUND);
        } else {
            // o id não foi especificado, cria uma nova linha no banco, e obtém o id criado
            data.id = await db.execute("INSERT INTO sub_forum(nome, descricao) VALUES (?, ?)", data.nome, data.descricao).then(x => x.lastID);
        }
        return res.send({ row: data });
    });
    app.delete("/api/sub_forum/:id", async (req, res) => {
        // valida o id
        const id = parseId(req.params.id);
        // se id é inválido, então BAD_REQUEST
        if (!id) return res.sendStatus(BAD_REQUEST);
        // apaga a linha no banco
        const changes = await db.execute("DELETE FROM sub_forum WHERE id = ?", id).then(x => x.changes);
        // se nada foi apagado, então NOT_FOUND
        if (!changes) return res.sendStatus(NOT_FOUND);
        return res.send();
    });
}
