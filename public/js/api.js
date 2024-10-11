
/** @typedef {{id: number, nome: string, email: string, admin: boolean}} User */
/** @typedef {{id: number, nome: string, descricao: string}} SubForum */
/** @typedef {{id: number, usuario_id: number, usuario_nome: string, titulo: string, created_at: string}} Topico */
/** @typedef {{id: number, usuario_id: number, usuario_nome: string, texto: string, created_at: string}} Mensagem */

/** @typedef {{nome: string, descricao: string}} NewSubForum */
/** @typedef {{titulo: string, sub_forum_id: number}} NewTopico */
/** @typedef {{texto: string, topico_id: number}} NewMensagem */

const api = function () {
    return {
        auth: {
            /** @returns {Api<User>} */
            user: async () => GET("/api/usuario"),
            /**
             * @param {{nome: string, email: string, senha: string}} body 
             * @returns {Api<User>}
             */
            signup: async (body) => POST("/api/signup", body),
            /** @returns {Api<void>} */
            signoff: async () => POST("/api/signoff"),
            /**
             * @param {{email: string, senha: string}} body 
             * @returns {Api<User>}
             */
            login: async (body) => POST("/api/login", body),
            /** @returns {Api<User>} */
            logoff: async () => DELETE("/api/login"),
        },
        sub_forum: {
            /** @returns {Api<{rows: SubForum[]}>} */
            list: async () => GET(`/api/sub_forum`),
            /** @returns {Api<SubForum>} */
            get: async (id) => GET(`/api/sub_forum/${id}`),
            /**
             * @param {NewSubForum} body
             * @returns {Api<SubForum>}
             */
            post: async (body) => POST(`/api/sub_forum`, body),
            /** @returns {Api<void>} */
            delete: async (id) => DELETE(`/api/sub_forum/${id}`),
        },
        topico: {
            /** @returns {Api<{rows: Topico[]}>} */
            list: async (sub_forum_id) => GET(`/api/topico?sub_forum_id=${sub_forum_id}`),
            /** @returns {Api<Topico>} */
            get: async (id) => GET(`/api/topico/${id}`),
            /**
             * @param {NewTopico} body
             * @returns {Api<Topico>}
             */
            post: async (body) => POST(`/api/topico`, body),
            /** @returns {Api<void>} */
            delete: async (id) => DELETE(`/api/topico/${id}`),
        },
        mensagem: {
            /** @returns {Api<{rows: Mensagem[]}>} */
            list: async (topico_id) => GET(`/api/mensagem?topico_id=${topico_id}`),
            /** @returns {Api<Mensagem>} */
            get: async (id) => GET(`/api/mensagem/${id}`),
            /**
             * @param {NewMensagem} body
             * @returns {Api<Mensagem>}
             */
            post: async (body) => POST(`/api/mensagem`, body),
            /** @returns {Api<void>} */
            delete: async (id) => DELETE(`/api/mensagem/${id}`),
        },
        busca: async (texto) => GET(`/api/busca?q=${encodeURIComponent(texto)}`),
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


