import { PORT } from "./config";
import express from "express";
import cookieMiddleware from "cookie-parser";
import { api as authApi } from "./api/auth";
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

app.get("/api/usuario", api(authApi.usuario));

app.post("/api/signup", api(authApi.signup));
app.post("/api/signoff", api(authApi.signoff));

app.post("/api/login", api(authApi.login));
app.delete("/api/login", api(authApi.logoff));

app.get("/api/sub_forum", api(subForum.list));
app.get("/api/sub_forum/:id", api(subForum.get));
app.post("/api/sub_forum", api(subForum.create));
app.delete("/api/sub_forum/:id", api(subForum.remove));

app.get("/api/topico", api(topico.list));
app.get("/api/topico/:id", api(topico.get));
app.post("/api/topico", api(topico.create));
app.delete("/api/topico/:id", api(topico.remove));

app.get("/api/mensagem", api(mensagem.list));
app.get("/api/mensagem/:id", api(mensagem.get));
app.post("/api/mensagem", api(mensagem.create));
app.delete("/api/mensagem/:id", api(mensagem.remove));

app.get("/api/busca", api(busca));

// roda o servidor e avisa que estamos online
app.listen(PORT, () => {
    console.log("Escutando na porta " + PORT);
});
