// Lógica simples de validação
document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  // Pega o valor dos inputs
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error-message");

  const result = await api.login({email, senha: password});
  if (result.status == 200) {
    history.replaceState(null, "", "/forum.html");
    document.location = "/forum.html";
  } else if (result.status == 403) {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Usuário ou senha incorretos!";
  } else {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Ocorreu um erro, tente novamente mais tarde";
  }
});
