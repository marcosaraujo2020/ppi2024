import express from "express";
import cookieMiddleware from "cookie-parser";
import * as auth from "./api/auth";
import * as subForum from "./api/subForum";
import * as thread from "./api/thread";
import * as mensagem from "./api/mensagem";
import { catchApiExceptions } from "./utils";

// cria o objeto app do express
const app = express();

// configura a extração de jsons no corpo dos requests
app.use(express.json());

// configura a extração de jsons no corpo dos requests
app.use(cookieMiddleware());

// serve os arquivos na pasta public na raiz
app.use(express.static('public'));

app.get("/api/usuario", catchApiExceptions(auth.api.usuario));

app.post("/api/signup", catchApiExceptions(auth.api.signup));
app.post("/api/signoff", catchApiExceptions(auth.api.signoff));

app.post("/api/login", catchApiExceptions(auth.api.login));
app.delete("/api/login", catchApiExceptions(auth.api.logoff));

app.get("/api/sub_forum", catchApiExceptions(subForum.api.list));
app.get("/api/sub_forum/:id", catchApiExceptions(subForum.api.get));
app.post("/api/sub_forum", catchApiExceptions(subForum.api.create));
app.delete("/api/sub_forum/:id", catchApiExceptions(subForum.api.remove));

app.get("/api/sub_forum/:sub_forum_id/thread", catchApiExceptions(thread.api.list));
app.get("/api/sub_forum/:sub_forum_id/thread/:id", catchApiExceptions(thread.api.get));
app.post("/api/sub_forum/:sub_forum_id/thread", catchApiExceptions(thread.api.create));
app.delete("/api/sub_forum/:sub_forum_id/thread/:id", catchApiExceptions(thread.api.remove));

app.get("/api/sub_forum/:sub_forum_id/thread/:thread_id/mensagem", catchApiExceptions(mensagem.api.list));
app.get("/api/sub_forum/:sub_forum_id/thread/:thread_id/mensagem/:id", catchApiExceptions(mensagem.api.get));
app.post("/api/sub_forum/:sub_forum_id/thread/:thread_id/mensagem", catchApiExceptions(mensagem.api.create));
app.delete("/api/sub_forum/:sub_forum_id/thread/:thread_id/mensagem/:id", catchApiExceptions(mensagem.api.remove));

// retorna o app
export { app };