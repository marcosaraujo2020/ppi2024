// Lógica simples de validação
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    // Pega o valor dos inputs
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");
  
    // Validação simples
    if (username === "admin" && password === "1234") {
      errorMessage.style.display = "none";
      alert("Login bem-sucedido!");
    } else {
      errorMessage.style.display = "block";
      errorMessage.textContent = "Usuário ou senha incorretos!";
    }
  });
  