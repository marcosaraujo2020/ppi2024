
const api = function () {
    /**
     * @template T
     * @typedef {Promise<{status: number, body: T}>} Api
     */
    return {
        /**
         * @returns {Api<{id: number, nome: string, email: string, admin: boolean}>}
         */
        async user() {
            return GET("/api/usuario");
        },
        /**
         * @param {{nome: string, email: string, senha: string}} body 
         * @returns {Api<{id: number, nome: string, email: string, admin: boolean}>}
         */
        async signup(body) {
            return POST("/api/signup", body);
        },
        /**
         * @returns {Api<{id: number, nome: string, email: string, admin: boolean}>}
         */
        async signoff() {
            return POST("/api/signoff", );
        },
        /**
         * @param {{email: string, senha: string}} body 
         * @returns {Api<{id: number, nome: string, email: string, admin: boolean}>}
         */
        async login(body) {
            return POST("/api/login", body);
        },
        /**
         * @returns {Api<{id: number, nome: string, email: string, admin: boolean}>}
         */
        async logoff() {
            return DELETE("/api/login");
        },
    };

    /**
     * @param {string} caminho
     * @returns {Promise<{status: number, body: any}>}
     */
    function GET(caminho) {
        return fetch(caminho).then(handleResponse);
    }

    /**
     * @param {string} caminho
     * @param {any} [body]
     * @returns {Promise<{status: number, body: any}>}
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
     * @returns {Promise<{status: number, body: any}>}
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


