import type { Express } from "express";
import * as db from "../database";
import { parseId } from "../utils";
import { z, TypeOf } from "zod";

type SubForum = TypeOf<typeof SubForum>;
const SubForum = z.object({
    id: z.number().refine(Number.isSafeInteger).optional(),
    nome: z.string().min(1),
    descricao: z.string().min(1),
});

export function setupApi(app: Express) {
    app.get("/api/sub_forum", async (req, res) => {
        return res.send({
            rows: await db.query<SubForum>("SELECT * FROM sub_forum")
        });
    });
    app.get("/api/sub_forum/:id", async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.sendStatus(400);
        const row = await db.fetch<SubForum>("SELECT * FROM sub_forum WHERE id = ?", id);
        if (!row) return res.sendStatus(404);
        return res.send({ row });
    });
    app.post("/api/sub_forum", async (req, res) => {
        const parsed = SubForum.safeParse(req.body);
        if (!parsed.success) return res.sendStatus(400);
        const data = parsed.data;
        if (data.id) {
            const changes = await db.execute("UPDATE sub_forum SET nome = ?, descricao = ? WHERE id = ?", data.nome, data.descricao, data.id).then(x => x.changes);
            if (!changes) return res.sendStatus(404);
        } else {
            data.id = await db.execute("INSERT INTO sub_forum(nome, descricao) VALUES (?, ?)", data.nome, data.descricao).then(x => x.lastID);
        }
        return res.send({ row: data });
    });
    app.delete("/api/sub_forum/:id", async (req, res) => {
        const id = parseId(req.params.id);
        if (!id) return res.sendStatus(400);
        const changes = await db.execute<SubForum>("DELETE FROM sub_forum WHERE id = ?", id).then(x => x.changes);
        if (!changes) return res.sendStatus(404);
        return res.send();
    });
}
