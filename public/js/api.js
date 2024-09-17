
/** @typedef {{id: number, nome: string, email: string, admin: boolean}} User */
/** @typedef {{id: number, nome: string, descricao: string}} SubForum */

const api = function () {
    return {
        auth: {
            /**
             * @returns {Api<User>}
             */
            user: async () => GET("/api/usuario"),
            /**
             * @param {{nome: string, email: string, senha: string}} body 
             * @returns {Api<User>}
             */
            signup: async (body) => POST("/api/signup", body),
            /**
             * @returns {Api<User>}
             */
            signoff: async () => POST("/api/signoff"),
            /**
             * @param {{email: string, senha: string}} body 
             * @returns {Api<User>}
             */
            login: async (body) => POST("/api/login", body),
            /**
             * @returns {Api<User>}
             */
            logoff: async () => DELETE("/api/login"),
        },
        sub_forum: {
            /**
             * @returns {Api<{rows: SubForum[]}>}
             */
            list: async () => GET("/api/sub_forum"),
        }
    };

    /**
     * @template T
     * @typedef {Promise<{status: number, body: T}>} Api
     */

    /**
     * @param {string} caminho
     */
    function GET(caminho) {
        return fetch(caminho).then(handleResponse);
    }

    /**
     * @param {string} caminho
     * @param {any} [body]
     */
    function POST(caminho, body) {
        return fetch(caminho, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
        }).then(handleResponse);
    }

    /**
     * @param {string} caminho
     */
    function DELETE(caminho) {
        return fetch(caminho, { method: "DELETE" }).then(handleResponse);
    }

    /**
     * @returns {Promise<{status: number, body: any}>}
     */
    async function handleResponse(res) {
        const content_type = res.headers.get("Content-Type") || "";
        return {
            status: res.status,
            body: content_type.startsWith("application/json")
                ? await res.json()
                : null
        };
    }
}();


