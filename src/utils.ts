import * as express from "express";

/** a mesam coisa que parseInt mas apenas aceita números positivos inteiros,
 *
 * e rejeita com um 400 caso seja inválido */
export function parseId(id: string): number | undefined {
    const number = parseInt(id);
    if (!Number.isSafeInteger(number)) {
        return undefined;
    }
    return number;
}
