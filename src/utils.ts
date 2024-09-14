export const BAD_REQUEST = 400;
export const NOT_FOUND = 404;

/** a mesma coisa que parseInt mas apenas aceita números inteiros,
 *
 * e rejeita com um 400 caso seja inválido */
export function parseId(id: string): number | undefined {
    const number = parseInt(id);
    if (!Number.isSafeInteger(number)) {
        return undefined;
    }
    return number;
}
