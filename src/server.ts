import express from "express";
import * as subForum from "./api/subForum";

export const port = 80;
export const app = express();

app.use(express.json());

app.use(express.static('public'));

subForum.setupApi(app);
