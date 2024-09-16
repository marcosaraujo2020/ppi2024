import express from "express";
import cookieMiddleware from "cookie-parser";
import * as auth from "./api/auth";
import * as subForum from "./api/subForum";

// cria o objeto app do express
const app = express();

// configura a extração de jsons no corpo dos requests
app.use(express.json());

// configura a extração de jsons no corpo dos requests
app.use(cookieMiddleware());

// serve os arquivos na pasta public na raiz
app.use(express.static('public'));

// inclui as apis
subForum.setupApi(app);
auth.setupApi(app);

// retorna o app
export { app };