import type { Response, Request, NextFunction } from "express";
import { ZodType, ZodTypeDef } from "zod";

export const OK = 200;
export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;
export const CONFLICT = 409;
export const INTERNAL_SERVER_ERROR = 500;

/** a mesma coisa que parseInt mas apenas aceita números inteiros,
 *
 * e rejeita com um 400 caso seja inválido */
export function parseId(id: string): number {
    const number = parseInt(id);
    if (!Number.isSafeInteger(number)) {
        throw new StatusException(BAD_REQUEST);
    }
    return number;
}

/** essa classe é capturada por catchApiExceptions para retornar erros com status de forma mais prática */
export class StatusException {
    public status: number;
    public body: any;
    constructor(status: number, body?: any) {
        this.status = status;
        this.body = body;
    }
}

export function catchApiExceptions<T>(api: (req: Request<T>, res: Response, next?: NextFunction) => unknown | Promise<unknown>): (req: Request<T>, res: Response, next: NextFunction) => void | Promise<void> {
    return async (req, res, next) => {
        try {
            await api(req, res, next);
        } catch (e) {
            if (e instanceof StatusException) {
                if (e.body === undefined) {
                    res.status(e.status).send();
                } else {
                    res.status(e.status).json(e.body);
                }
            } else {
                console.log(e);
                res.status(INTERNAL_SERVER_ERROR).send();
            }
        }
    };
}

/** retorna o parâmetro, mas dá um 404 se value for null ou undefined */
export function expectFound<T>(value: T): T & {} {
    if (value === null || value === undefined) {
        throw new StatusException(NOT_FOUND);
    }
    return value;
}

/** dá um 404 se changes for zero, ou seja quando nada for alterado no banco porque não foi encontrado */
export function expectChanges(value: { changes: number }): void {
    if (value.changes == 0) {
        throw new StatusException(NOT_FOUND);
    }
}

/** cria uma função validadora a partir de um validador do zod que recebe um objeto e valida se está no formato correto, se não tiver retorna um 400 */
export function validator<A, B extends ZodTypeDef, C>(validator: ZodType<A, B, C>): (data: unknown) => A {
    return data => {
        const result = validator.safeParse(data);
        if (result.success) {
            return result.data;
        } else {
            throw new StatusException(BAD_REQUEST, {
                error: "zod error",
                cause: result.error
            });
        }
    }
}
