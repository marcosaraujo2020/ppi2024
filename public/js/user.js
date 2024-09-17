
api.auth.user().then(x => {
    if (x.status == 200) {
        document.getElementById("user-name").innerText = x.body.nome;
    }   
});
