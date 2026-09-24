/* ============================================================
   Readily: login page controller
   One form, all three roles — the account found for that email
   decides where you land, exactly like the site's front door.
   ============================================================ */

(function () {
  const already = Store.getSession();
  if (already) {
    goTo(roleHome(already.role));
    return;
  }

  const form = document.getElementById("loginForm");
  const emailField = document.getElementById("loginEmail");
  const passField = document.getElementById("loginPassword");
  const errorBox = document.getElementById("loginError");

  const params = new URLSearchParams(location.search);
  const next = params.get("next");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const result = Store.login(emailField.value, passField.value);
    if (!result.ok) {
      errorBox.textContent = result.reason === "suspended"
        ? "This account has been suspended. Contact a librarian to reactivate it."
        : "No account matches that email and password. Check the demo logins above, or sign up.";
      errorBox.hidden = false;
      Sound.click();
      return;
    }

    Sound.success();
    const safeNext = next && /^[a-z0-9_-]+\.html(\?[a-z0-9=&%_-]*)?$/i.test(next) ? next : null;
    goTo(safeNext || roleHome(result.account.role));
  });
})();
