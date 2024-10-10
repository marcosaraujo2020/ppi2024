import express from "express";
import cookieMiddleware from "cookie-parser";
import * as auth from "./api/auth";
import * as subForum from "./api/subForum";
import * as topico from "./api/topico";
import * as mensagem from "./api/mensagem";
import { catchApiExceptions as api } from "./utils";
import { busca } from "./api/busca";

// cria o objeto app do express
const app = express();

// configura a extração de jsons no corpo dos requests
app.use(express.json());

// configura a extração de jsons no corpo dos requests
app.use(cookieMiddleware());

// serve os arquivos na pasta public na raiz
app.use(express.static('public'));

app.get("/api/usuario", api(auth.api.usuario));

app.post("/api/signup", api(auth.api.signup));
app.post("/api/signoff", api(auth.api.signoff));

app.post("/api/login", api(auth.api.login));
app.delete("/api/login", api(auth.api.logoff));

app.get("/api/sub_forum", api(subForum.api.list));
app.get("/api/sub_forum/:id", api(subForum.api.get));
app.post("/api/sub_forum", api(subForum.api.create));
app.delete("/api/sub_forum/:id", api(subForum.api.remove));

app.get("/api/topico", api(topico.api.list));
app.get("/api/topico/:id", api(topico.api.get));
app.post("/api/topico", api(topico.api.create));
app.delete("/api/topico/:id", api(topico.api.remove));

app.get("/api/mensagem", api(mensagem.api.list));
app.get("/api/mensagem/:id", api(mensagem.api.get));
app.post("/api/mensagem", api(mensagem.api.create));
app.delete("/api/mensagem/:id", api(mensagem.api.remove));

app.get("/api/busca", api(busca));

// retorna o app
export { app };