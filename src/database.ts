import fs from "fs";
import { Database } from "sqlite3";
import { db_path } from "./config";

let db: Database | null = null;

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
    return fs.promises.rm(db_path, { force: true });
}

/** retorna a conecção, conecta se não tiver conectado ainda */
export function connect(): Database {
    if (db) return db;
    db = new Database(db_path);
    return db;
}

/** obtém um item do banco de dados */
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

/** executa uma query no banco de dados */
export function execute<T = any>(sql: string, ...params: any[]): Promise<{
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
