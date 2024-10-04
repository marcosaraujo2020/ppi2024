
document.addEventListener('DOMContentLoaded', function() {

    var novoFormulario = document.getElementById('formulario');
    
    var id_subforum = 1;
   
    if (window.location.pathname.includes('sub-forum.html')) {
        var subforumId = getQueryParameter('id');

        

        if (subforumId) {
            api.sub_forum.get(subforumId).then(response => {
                var subforum = response.body;
                

                console.log(subforum);

                var titulo_sub_forum = document.getElementById('titulo-sub-forum');
                var section_topico = document.getElementById('topico-sub-forum');
                titulo_sub_forum.innerText = subforum.nome

                api.topico.list(subforumId).then(response => {
                    var topicos = response.body;
                   
                    topicos.rows.forEach(element => {
                        var post_forum_topico = document.createElement('article');
                        var ancora_topico = document.createElement('a');
                        var descricao_topico2 = document.createElement('p');
                        var autor_post = document.createElement('p');
                        var data_post = document.createElement('p');
                        var hr = document.createElement('hr');
                        var autor_data = document.createElement('div');

                        autor_data.className = "autor-data";
                        ancora_topico.href = "mensagem.html?id=" + element.id;
                        post_forum_topico.className = "post-forum-topico";
                        descricao_topico2.innerText = element.titulo;
                        autor_post.innerText = element.usuario_nome;
                        data_post.innerText = ", " + element.created_at;
                        ancora_topico.appendChild(descricao_topico2);
                        autor_data.appendChild(autor_post);
                        autor_data.appendChild(data_post);
                        post_forum_topico.appendChild(ancora_topico);
                        post_forum_topico.appendChild(autor_data)
                        section_topico.appendChild(post_forum_topico);
                        section_topico.appendChild(hr);

                    });
                })
               

            }).catch(error => {
                console.error("Erro ao obter subfórum:", error);
            });
        }
    } else {
        api.sub_forum.list().then(response => {
    
            var section = document.getElementById("teste");
            section.className = 'topico';
                   
            console.log(response.body.rows);
    
            response.body.rows.forEach(subforum => {
                var ancora = document.createElement('a');
                var div = document.createElement('div');
                var titulo_topico = document.createElement('h4');
                var descricao_topico = document.createElement('p');
                var article = document.createElement('article');
                var hr = document.createElement('hr');
                var div_feedback = document.createElement('div');
                var div_esquerda = document.createElement('div');
                var div_icones = document.createElement('div');
                var span_icone = document.createElement('span');
                var span_icone2 = document.createElement('span');
    
                div_feedback.className ='feedback';
                div_icones.className = 'icones';
                span_icone.className = 'material-symbols-outlined';
                span_icone.innerText = 'visibility';
                span_icone2.className = 'material-symbols-outlined';
                span_icone2.innerText = 'mode_comment';
                div.className = 'conteudo-forum';
                ancora.href = 'sub-forum.html?id=' + subforum.id;
                ancora.className = 'link-titulo-topico';
                titulo_topico.className = 'titulo-topico';
                descricao_topico.className = 'descricao-topico';
                article.className = 'post-forum';
                
                titulo_topico.innerText = subforum.nome;
                descricao_topico.innerText = subforum.descricao;
                
                ancora.appendChild(titulo_topico);
              
                div.appendChild(ancora);
                div.appendChild(descricao_topico);
                div_icones.appendChild(span_icone);
                div_icones.appendChild(span_icone2);
                div_feedback.appendChild(div_esquerda);
                div_feedback.appendChild(div_icones);
                article.appendChild(div);
                article.appendChild(div_feedback);
                section.appendChild(article);
                section.appendChild(hr);
            })       
        }).catch(error => {
            console.error("Erro ao obter lista de subfóruns:", error);
        });
    }

    

    if (window.location.pathname.includes('mensagem.html')) {
        
        var mensagemId = getQueryParameter('id');       
    
        if (mensagemId) {
            api.mensagem.list(id_subforum, mensagemId).then(response => {
                var mensagem = response.body;
                
                mensagem.rows.forEach(element => {
                    document.getElementById('titulo-mensagem').innerText = element.usuario_nome;
                    document.getElementById('conteudo-mensagem').innerText = element.texto;
                })
    
            }).catch(error => {
                console.error("Erro ao obter mensagem:", error);
                document.getElementById('titulo-mensagem').innerText = "Erro ao carregar a mensagem";
                document.getElementById('conteudo-mensagem').innerText = "Não foi possível carregar o conteúdo da mensagem.";
            });
        } else {
            document.getElementById('titulo-mensagem').innerText = "Mensagem não encontrada";
            document.getElementById('conteudo-mensagem').innerText = "O ID da mensagem não foi fornecido.";
        }
    }
    

    function getQueryParameter(param) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);    
    }
    
   
    

    document.getElementById('novotopico').addEventListener('click', function(){
        novoFormulario.classList.remove('oculto');
    });


    document.getElementById('novoTopicoForm').addEventListener("submit", async function (event) {
        event.preventDefault();
    
        const titulo = document.getElementById('titulo').value.trim();
        const conteudo = document.getElementById('conteudo').value.trim();
    
        const novoPost = {nome: titulo, descricao: conteudo};
    
        try {
            const resultado = await api.sub_forum.post(novoPost);
            
            if (resultado.status === 200) {
                alert('Post criado com sucesso!');
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


