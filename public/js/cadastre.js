// Lógica de validação de cadastro
document.getElementById("registerForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  // Pega os valores dos inputs
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorMessage = document.getElementById("error-message");

  // Validação básica
  if (password !== confirmPassword) {
    errorMessage.style.display = "block";
    errorMessage.textContent = "As senhas não coincidem!";
    return;
  }

  const result = await api.signup({ nome: username, email, senha: password });
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
