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

});


