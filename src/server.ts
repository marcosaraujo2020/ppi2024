import express from "express";
import * as subForum from "./api/subForum";

// cria o objeto app do express
const app = express();

// configura a extração de jsons no corpo dos requests
app.use(express.json());

// serve os arquivos na pasta public na raiz
app.use(express.static('public'));

// inclui as apis do subForum
subForum.setupApi(app);

// retorna o app
export { app };