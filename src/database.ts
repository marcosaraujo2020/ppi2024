import fs from "fs";
import { Database } from "sqlite3";
import { DB_PATH } from "./config";

let db: Database | null = null;

/** essa classe melhora um pouco as mensagens de erro de sql, mostrando a query que deu erro, e substitui os parâmetros antes de mostrar */
class SqlError extends Error {
    constructor(query: string, args: any[], cause?: Error) {
        const chunks = query.split("?");
        query = chunks.map((chunk, index) => {
            if (index == chunks.length - 1) {
                return chunk;
            } else if (index < args.length) {
                return chunk + JSON.stringify(args[index]);
            } else {
                return chunk + "?";
            }
        }).join("");
        super("erro na query:\n" + query);
        this.cause = cause;
    }
}

/** apaga o banco */
export function delete_database(): Promise<void> {
    return fs.promises.rm(DB_PATH, { force: true });
}

/** retorna o banco, conecta se não tiver conectado ainda */
export function connect(): Database {
    if (db) return db;
    db = new Database(DB_PATH);
    return db;
}

/** obtém uma linha do banco de dados, se o select retornar multiplas linhas, essa função retorna só a primeira */
export function fetch<T = any>(sql: string, ...params: any[]): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        connect().get(sql, params, (error, row) => {
            if (error) {
                reject(new SqlError(sql, params, error));
            } else {
                resolve(row as T);
            }
        })
    });
}

/** obtém várias linhas do banco de dados */
export function query<T = any>(sql: string, ...params: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
        connect().all(sql, params, (error, rows) => {
            if (error) {
                reject(new SqlError(sql, params, error));
            } else {
                resolve(rows as T[]);
            }
        })
    });
}

/** executa uma query no banco de dados, e retorna o último id criado (para INSERTs que criam ids), e o número de linhas afetadas (UPDATEs e DELETEs) */
export function execute(sql: string, ...params: any[]): Promise<{
    lastID: number,
    changes: number,
}> {
    return new Promise((resolve, reject) => {
        connect().run(sql, params, function (error) {
            if (error) {
                reject(new SqlError(sql, params, error));
            } else {
                resolve({
                    lastID: this.lastID,
                    changes: this.changes,
                });
            }
        })
    });
}
