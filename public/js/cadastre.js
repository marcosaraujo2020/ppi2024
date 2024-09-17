// Lógica de validação de cadastro
document.getElementById("registerForm").addEventListener("submit", function(event) {
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
  
    if (username && email && password && confirmPassword) {
      errorMessage.style.display = "none";
      alert("Cadastro realizado com sucesso!");
    } else {
      errorMessage.style.display = "block";
      errorMessage.textContent = "Preencha todos os campos!";
    }
  });
  