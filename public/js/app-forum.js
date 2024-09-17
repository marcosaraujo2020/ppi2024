document.addEventListener('DOMContentLoaded', function(){

    var novoFormulario = document.getElementById('formulario');

    document.getElementById('novoforum').addEventListener('click', function(){
        novoForum();
    });

    document.getElementById('btn-enviar').addEventListener('submit', function(){
        postarForum();
    });

    function novoForum(){
        novoFormulario.classList.remove('oculto');
    }
    
    
    function postarForum(){
        setTimeout(function() {
            novoFormulario.classList.add('oculto');
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


