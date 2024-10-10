
document.addEventListener('DOMContentLoaded', function() {

    var novoFormulario = document.getElementById('formulario');
    
   // var id_subforum = 1;

    function getQueryParameter(param) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);    
    }
    
   
    function criarElemento(tipo, classe, texto = '') {
        const elemento = document.createElement(tipo);
        if (classe) elemento.className = classe;
        if (texto) elemento.innerText = texto;
        return elemento;
    }
    
    function exibirErro(tituloId, conteudoId, mensagemErro) {
        document.getElementById(tituloId).innerText = "Erro ao carregar";
        document.getElementById(conteudoId).innerText = mensagemErro;
    }
    

    if (window.location.pathname.includes('sub-forum.html')) {
        const subforumId = getQueryParameter('id');
        if (subforumId) {
            carregarSubforum(subforumId);
        }
    } else {
        listarSubforuns();
    }

    async function carregarSubforum(subforumId) {
        try {
            const response = await api.sub_forum.get(subforumId);
            const subforum = response.body;
            document.getElementById('titulo-sub-forum').innerText = "Sub-fórum: " + subforum.nome;

            document.getElementById('novotopico').addEventListener('click', function(){
                novoFormulario.classList.remove('oculto');
                criarTopico(subforum.id)
            });
    
            const section_topico = document.getElementById('topico-sub-forum');
            const topicosResponse = await api.topico.list(Number(subforum.id));

            const topicos = topicosResponse.body.rows;

                            
            topicos.forEach(element => {
                const post_forum_topico = criarElemento('article', 'post-forum-topico');
                const ancora_topico = criarElemento('a');
                const descricao_topico2 = criarElemento('p', '', element.titulo);
                const autor_post = criarElemento('p', '', element.usuario_nome);
                const data_post = criarElemento('p', '', `, ${element.created_at}`);
                const hr = criarElemento('hr');
                const autor_data = criarElemento('div', 'autor-data');
    
                ancora_topico.href = "mensagem.html?id=" + element.id;
                ancora_topico.appendChild(descricao_topico2);
                autor_data.appendChild(autor_post);
                autor_data.appendChild(data_post);
                post_forum_topico.appendChild(ancora_topico);
                post_forum_topico.appendChild(autor_data);
                section_topico.appendChild(post_forum_topico);
                section_topico.appendChild(hr);
            });
        } catch (error) {
            console.error("Erro ao obter subfórum:", error);
        }
    }

    async function listarSubforuns() {
        try {
            const response = await api.sub_forum.list();
            const section = document.getElementById("teste");
            section.className = 'topico';
    
            response.body.rows.forEach(subforum => {
                const ancora = criarElemento('a', 'link-titulo-topico');
                ancora.href = 'sub-forum.html?id=' + subforum.id;
    
                const titulo_topico = criarElemento('h4', 'titulo-topico', subforum.nome);
                const descricao_topico = criarElemento('p', 'descricao-topico', subforum.descricao);
    
                const quantidade_topicos = criarElemento('p', 'quantidade-topicos', '2');
               // const span_icone = criarElemento('span', 'material-symbols-outlined', 'visibility');
                const span_icone2 = criarElemento('span', 'material-symbols-outlined', 'mode_comment');
    
                const div = criarElemento('div', 'conteudo-forum');
                ancora.appendChild(titulo_topico);
                div.appendChild(ancora);
                div.appendChild(descricao_topico);
    
                const div_icones = criarElemento('div', 'icones');
               // div_icones.appendChild(span_icone);
                div_icones.appendChild(span_icone2);
                div_icones.appendChild(quantidade_topicos);
    
                const div_feedback = criarElemento('div', 'feedback');
                div_feedback.appendChild(div_icones);
    
                const article = criarElemento('article', 'post-forum');
                article.appendChild(div);
                article.appendChild(div_feedback);
    
                section.appendChild(article);
                section.appendChild(criarElemento('hr'));
            });
        } catch (error) {
            console.error("Erro ao obter lista de subfóruns:", error);
        }
    }
    
    

    async function carregarMensagensTopico(mensagemId) {
        try {
            const section_mensagem = document.getElementById("mensagem-topico");
            const tema_topico = document.getElementById("tema-topico");
    
            // Para carregar informações do tópico
            const topicoResponse = await api.topico.get(mensagemId);
            const topico = topicoResponse.body;
    
            const h4 = criarElemento('h4', '', `Tópico: ${topico.titulo}`);
            const p = criarElemento('p', 'autor-topico', `${topico.usuario_nome}, ${topico.created_at}`);
            
            tema_topico.appendChild(h4);
            tema_topico.appendChild(p);
    
            const mensagemResponse = await api.mensagem.list(mensagemId);
            const mensagens = mensagemResponse.body.rows;
    
            mensagens.forEach(element => {
                const post_forum_mensagem = criarElemento('article', 'post-forum-mensagem');
                const conteudo_mensagem = criarElemento('p', '', element.texto);
                const autor_data_mensagem = criarElemento('p', 'autor-data-mensagem', `Comentado por ${element.usuario_nome}, ${element.created_at}`);
                const hr = criarElemento('hr');
    
                post_forum_mensagem.appendChild(conteudo_mensagem);
                post_forum_mensagem.appendChild(autor_data_mensagem);
                section_mensagem.appendChild(post_forum_mensagem);
                section_mensagem.appendChild(hr);
            });
        } catch (error) {
            console.error("Erro ao obter mensagem:", error);
            exibirErro('titulo-mensagem', 'conteudo-mensagem', "Não foi possível carregar o conteúdo da mensagem.");
        }
    }
    

    if (window.location.pathname.includes('mensagem.html')) {
        const mensagemId = getQueryParameter('id');  
        
        if (mensagemId) {
            carregarMensagensTopico(mensagemId);
        } else {
            document.getElementById('titulo-mensagem').innerText = "Mensagem não encontrada";
            document.getElementById('conteudo-mensagem').innerText = "O ID da mensagem não foi fornecido.";
        }
    }
    


    
    async function criarTopico(idSubforum) {

        document.getElementById('novoTopicoForm').addEventListener("submit", async function (event) {
            event.preventDefault();
        
            const titulo_topico = document.getElementById('comentario-topico').value.trim();
        
            const novoPost = {
                sub_forum_id:idSubforum, 
                titulo: titulo_topico
            };
        
            try {
                const resultado = await api.topico.post(novoPost);
                
                if (resultado.status === 200) {
                    alert('Tópico criado com sucesso!');
                    document.getElementById('novaPostagemForm').reset();
                } else {
                    console.error('Erro ao criar o post:', resultado);
                }
            } catch (error) {
                console.error('Erro:', error);
            }
    
            setTimeout(function() {
                novoFormulario.classList.add('oculto');
            }, 2000);
    
            location.reload();
        });
    
    }



    


    api.auth.user().then(x => {
        if (x.status == 200) {
            document.body.classList.add("logado");
            document.getElementById("user-name").innerText = x.body.nome;
        }   
    });

    document.getElementById("logout-btn").addEventListener("click", async () => {
        await api.auth.logoff();
        location.reload();
    });





});


