
document.addEventListener('DOMContentLoaded', function() {

    var novoFormulario = document.getElementById('formulario');

   
   /*  api.sub_forum.list().then(response => {
        var teste = document.getElementById('testando');
        
        console.log(response.body.rows)
        response.body.rows.forEach(subforum => {
            var texto = document.createElement('h3');
            var p = document.createElement('p');
            texto.innerText = response.body.rows[subforum.id].nome
            p.innerText = response.body.rows[subforum.id].descricao
            teste.appendChild(texto)
            teste.appendChild(p)
        })       
    }) 
 */
   

    api.sub_forum.list().then(response => {
    
      var section = document.getElementById("teste");
      section.className = 'topico';
               
        console.log(response.body.rows)
        response.body.rows.forEach(subforum => {
            var ancora = document.createElement('a');
            var div = document.createElement('div');
            var titulo_topico = document.createElement('h4');
            var descricao_topico = document.createElement('p');
            var article = document.createElement('article');
            var hr = document.createElement('hr');
            var div_feedback = document.createElement('div');
            var div_autor = document.createElement('div');
            var div_icones = document.createElement('div');
            var autor_topico = document.createElement('p');
            var span_icone = document.createElement('span');
            var span_icone2 = document.createElement('span');

            div_feedback.id ='feedback';
            div_autor.id = 'autor';
            div_icones.id = 'icones';
            autor_topico.className = 'autor-topico';
            autor_topico.innerText = 'Postado por ';
            span_icone.className = 'material-symbols-outlined';
            span_icone.innerText = 'visibility';
            span_icone2.className = 'material-symbols-outlined';
            span_icone2.innerText = 'mode_comment';
            div.className = 'conteudo-forum';
            ancora.href = 'sub-forum.html'
            ancora.id = 'link-titulo-topico';
            titulo_topico.className = 'titulo-topico';
            descricao_topico.className = 'descricao-topico';
            article.className = 'post-forum';
            
            titulo_topico.innerText = subforum.nome;
            descricao_topico.innerText = subforum.descricao;
            
            ancora.appendChild(titulo_topico);
          
            div.appendChild(ancora);
            div.appendChild(descricao_topico);
            div_autor.appendChild(autor_topico);
            div_icones.appendChild(span_icone);
            div_icones.appendChild(span_icone2);
            div_feedback.appendChild(div_autor);
            div_feedback.appendChild(div_icones);
            article.appendChild(div);
            article.appendChild(div_feedback);
            section.appendChild(article);
            section.appendChild(hr);
        })       
    })
        

    document.getElementById('novoforum').addEventListener('click', function(){
        novoFormulario.classList.remove('oculto');
    });


    document.getElementById('novaPostagemForm').addEventListener("submit", async function (event) {
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


