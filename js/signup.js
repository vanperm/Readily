/* ============================================================
   Readily: signup page controller (member accounts only —
   Librarian and Store Staff accounts are seeded, not self-serve).
   ============================================================ */

(function () {
  const already = Store.getSession();
  if (already) {
    goTo(roleHome(already.role));
    return;
  }

  const form = document.getElementById("signupForm");
  const nameField = document.getElementById("suName");
  const emailField = document.getElementById("suEmail");
  const passField = document.getElementById("suPassword");
  const confirmField = document.getElementById("suConfirm");
  const errorBox = document.getElementById("signupError");

  function setFieldError(field, on) {
    field.closest(".field").classList.toggle("error", on);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    [nameField, emailField, passField, confirmField].forEach(f => setFieldError(f, false));

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const password = passField.value;
    const confirm = confirmField.value;

    let hasError = false;
    if (!name) { setFieldError(nameField, true); hasError = true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError(emailField, true); hasError = true; }
    if (password.length < 6) { setFieldError(passField, true); hasError = true; }
    if (confirm !== password) { setFieldError(confirmField, true); hasError = true; }
    if (hasError) return;

    const result = Store.createMemberAccount({ name, email, password });
    if (!result.ok) {
      errorBox.textContent = "An account with that email already exists. Try logging in instead.";
      errorBox.hidden = false;
      return;
    }

    Store.login(email, password);
    Sound.success();
    goTo("index.html");
  });
})();
