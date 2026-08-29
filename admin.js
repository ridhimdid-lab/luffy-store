// ==========================================
// LUFFY STORE - ADMIN LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginBtn = document.getElementById("loginBtn");


loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;


  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  loginError.textContent = "";


  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });


  if (error) {

    console.error(error);

    loginError.textContent =
      error.message;

    loginBtn.disabled = false;
    loginBtn.textContent = "Login";

    return;
  }


  window.location.href = "admin-dashboard.html";

});
