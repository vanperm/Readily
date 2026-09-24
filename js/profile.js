/* ============================================================
   Readily: profile page
   ============================================================ */

(function () {
  const account = requireRole("member");
  if (!account) return;

  document.getElementById("profileMeta").textContent = `Member since ${Store.formatDate(account.joinedAt)}`;
  document.getElementById("pfName").value = account.name;
  document.getElementById("pfEmail").value = account.email;
  document.getElementById("pfCard").value = account.cardNo || "—";

  const profileForm = document.getElementById("profileForm");
  const profileError = document.getElementById("profileError");
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    profileError.hidden = true;
    const name = document.getElementById("pfName").value.trim();
    const email = document.getElementById("pfEmail").value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      profileError.textContent = "Please enter a valid name and email.";
      profileError.hidden = false;
      return;
    }
    const result = Store.updateAccountProfile(account.id, { name, email });
    if (!result.ok) {
      profileError.textContent = "That email is already used by another account.";
      profileError.hidden = false;
      return;
    }
    Sound.success();
    Toast.show("Profile updated.");
  });

  const passwordForm = document.getElementById("passwordForm");
  const passwordError = document.getElementById("passwordError");
  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    passwordError.hidden = true;
    const current = document.getElementById("pfCurrentPass").value;
    const next = document.getElementById("pfNewPass").value;
    if (next.length < 6) {
      passwordError.textContent = "New password must be at least 6 characters.";
      passwordError.hidden = false;
      return;
    }
    const result = Store.changePassword(account.id, current, next);
    if (!result.ok) {
      passwordError.textContent = "Current password is incorrect.";
      passwordError.hidden = false;
      return;
    }
    Sound.success();
    Toast.show("Password updated.");
    passwordForm.reset();
  });
})();
