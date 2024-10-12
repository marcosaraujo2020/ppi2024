
function id(id) {
    const elem = document.getElementById(id);
    if (elem === null) throw new Error(`id ${id} não existe`);
    return elem;
}

document.addEventListener('DOMContentLoaded', function() {

    var novoFormulario = document.getElementById('formulario');
    var novoFormularioComentario = document.getElementById('formulario-comentario');
    
    function getQueryParameter(param) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);    
    }
    
   
    function criarElemento(tipo, classe, texto = '', id) {
        const elemento = document.createElement(tipo);
        if (classe) elemento.className = classe;
        if (texto) elemento.innerText = texto;
        if (id) elemento.id = id;
        return elemento;
    }
    
    function exibirErro(tituloId, conteudoId, mensagemErro) {
        document.getElementById(tituloId).innerText = "Erro ao carregar";
        document.getElementById(conteudoId).innerText = mensagemErro;
    }
    

    async function carregarSubforum(subforumId) {
        try {
            const response = await api.sub_forum.get(subforumId);
            const subforum = response.body;

            document.getElementById('titulo-sub-forum').innerText = "Sub-fórum: " + subforum.nome;
        

            const section_topico = document.getElementById('topico-sub-forum');
            const topicosResponse = await api.topico.list(subforum.id);         

            document.getElementById("novoTopicoForm").addEventListener("submit", (ev) => {
                ev.preventDefault();
                const titulo = document.getElementById("titulo-topico").value.trim();
                const texto = document.getElementById("comentario-topico").value.trim();
                async function criaTopicoAsync() {
                    const topico = await api.topico.post({
                        titulo,
                        sub_forum_id: subforum.id,
                    });
                    await api.mensagem.post({
                        texto, topico_id: topico.body.id
                    });
                    document.location = "/mensagem.html?id=" + topico.body.id;
                }
                criaTopicoAsync();
            });

            topicosResponse.body.rows.forEach(element => {
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

                api.topico.list(subforum.id).then(element=>{
                    const valor = element.body.rows.length
               
                    const ancora = criarElemento('a', 'link-titulo-topico');
                    ancora.href = 'sub-forum.html?id=' + subforum.id;
        
                    const titulo_topico = criarElemento('h4', 'titulo-topico', subforum.nome);
                    const descricao_topico = criarElemento('p', 'descricao-topico', subforum.descricao);
        
                    const quantidade_topicos = criarElemento('p', 'quantidade-topicos', `${valor}`);
                    const span_icone2 = criarElemento('span', 'material-symbols-outlined', 'mode_comment');
        
                    const div = criarElemento('div', 'conteudo-forum');
                    ancora.appendChild(titulo_topico);
                    div.appendChild(ancora);
                    div.appendChild(descricao_topico);
        
                    const div_icones = criarElemento('div', 'icones');
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
            });
        } catch (error) {
            console.error("Erro ao obter lista de subfóruns:", error);
        }
    }

    
    if (window.location.pathname.includes('sub-forum.html')) {
        const subforumId = getQueryParameter('id');
        if (subforumId) {
            carregarSubforum(subforumId);
        }
    } else if (window.location.pathname.includes('forum.html')) {
        listarSubforuns();
    }



    async function carregarMensagensTopico(topicoId) {
        try {

            const tema_topico = document.getElementById("tema-topico");
    
            const topicoResponse = await api.topico.get(topicoId);
            const topico = topicoResponse.body;
            
            const h4 = criarElemento('h4', '', `Tópico: ${topico.titulo}`);
            const p = criarElemento('p', 'autor-topico', `${topico.usuario_nome}, ${topico.created_at}`);

            tema_topico.appendChild(h4)
            tema_topico.appendChild(p)
           
            document.getElementById("novoComentarioForm").addEventListener("submit", (ev) => {
                ev.preventDefault();
                const texto = document.getElementById("comentario-topico").value.trim();
                api.mensagem.post({
                    texto, topico_id: topico.id
                }).then((response) => {
                    if (response.status == 200) {
                        document.location.reload();
                    }
                })
            });

           /*  const div_esquerda = criarElemento('div');
            const div_direita = criarElemento('div');
            const h4 = criarElemento('h4', '', `Tópico: ${topico.titulo}`);
            const p = criarElemento('p', 'autor-topico', `${topico.usuario_nome}, ${topico.created_at}`);
            const a = criarElemento('a');
            const span = criarElemento('span', 'material-symbols-outlined', 'post_add','nova-mensagem')
            
            a.href = '#';
            span.title = "Novo comentário";
            a.appendChild(span);
            div_esquerda.appendChild(h4);
            div_esquerda.appendChild(p);
            div_direita.appendChild(a);
            tema_topico.appendChild(div_esquerda);
            tema_topico.appendChild(div_direita); */

            /*document.getElementById('nova-mensagem').addEventListener('click', async function(){
                
                const response = await api.auth.user();
                if (response.body){
                    novoFormularioComentario.classList.remove('oculto');
                    criarComentario(topico.id)
                } else {
                    alert("Faça seu login ou cadastre-se.")
                }
                
            });*/
    
            const mensagemResponse = await api.mensagem.list(topico.id);
            const mensagens = mensagemResponse.body.rows;
    
            mensagens.forEach(element => {
                const post_forum_mensagem = criarElemento('article', 'post-forum-mensagem');
                const conteudo_mensagem = criarElemento('p', '', element.texto, 'conteudo-mensagem');
                const autor_data_mensagem = criarElemento('p', 'autor-data-mensagem', `Comentado por ${element.usuario_nome}, ${element.created_at}`);
                const hr = criarElemento('hr');
    
                post_forum_mensagem.appendChild(conteudo_mensagem);
                post_forum_mensagem.appendChild(autor_data_mensagem);
                novoFormularioComentario.before(post_forum_mensagem);
                novoFormularioComentario.before(hr);
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
    


    async function carregarResultadosBusca(busca) {
        try {

            const tema_topico = document.getElementById("tema-topico");
    
            const h4 = criarElemento('h4', '', `Resultados da busca por "${busca}"`);
            const p = criarElemento('p');

            tema_topico.appendChild(h4)
            tema_topico.appendChild(p)
           
            const mensagem_topico = document.getElementById("mensagem-topico");
            const buscaResponse = await api.busca(busca);
            const mensagens = buscaResponse.body.rows;
            
            mensagens.forEach(element => {
                const post_forum_mensagem = criarElemento('article', 'post-forum-mensagem');


                const ancora = criarElemento('a', 'search-input');
                ancora.href = 'mensagem.html?id=' + element.topico_id;
    
                const titulo_topico = criarElemento('h4', 'titulo-topico', element.topico_titulo);
    
                ancora.appendChild(titulo_topico);
                post_forum_mensagem.appendChild(ancora);
    
                
                const conteudo_mensagem = criarElemento('p', '', element.texto, 'conteudo-mensagem');
                const autor_data_mensagem = criarElemento('p', 'autor-data-mensagem', `Comentado por ${element.usuario_nome}, ${element.created_at}`);
                const hr = criarElemento('hr');
    
                post_forum_mensagem.appendChild(conteudo_mensagem);
                post_forum_mensagem.appendChild(autor_data_mensagem);
                mensagem_topico.appendChild(post_forum_mensagem);
                mensagem_topico.appendChild(hr);
            });
        } catch (error) {
            console.error("Erro ao obter mensagem:", error);
            exibirErro('titulo-mensagem', 'conteudo-mensagem', "Não foi possível carregar o conteúdo da mensagem.");
        }
    }
    

    if (window.location.pathname.includes('busca.html')) {
        const busca = getQueryParameter('q');
        carregarResultadosBusca(busca);
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


    /* async function criarComentario(idSubforum) {

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
 */

/*     async function deletarTopico(idTopico) {
        try {
            await api.topico.delete(idTopico);
            alert("Tópico deletado com sucesso!");
            console.log(`Tópico com ID ${idTopico} deletado com sucesso.`);
        } catch (error) {
            console.error(`Erro ao deletar o tópico com ID ${idTopico}:`, error);
        }
    } */
       


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


    const search_submit =  document.getElementById("search-submit");
    const search_input =  document.getElementById("search-input");
    search_submit.addEventListener("click", fazBusca);
    search_input.addEventListener("keydown", (ev) => {
        if (ev.key == "Enter") {
            fazBusca();
        }
    })
    search_input.value = getQueryParameter('q');

    function fazBusca() {
        if (search_input.value.trim())
        document.location = "/busca.html?q=" + search_input.value.trim();
    }

});


