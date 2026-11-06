/* Private preview authentication only; public storefront visitors remain anonymous. */
(() => {
  "use strict";
  if (new URLSearchParams(location.search).get("preview") !== "1") return;
  (async () => {
    try {
      const client = await window.WPNeonClientReady;
      const session = await window.WPAuthReady;
      if (session?.user?.id && String(session.user.email || "").trim().toLowerCase() === "halalfoodbd.official@gmail.com") return;
      if (session?.user?.id) await client.auth.signOut();
      const gate = document.createElement("div");
      gate.className = "wp-preview-auth";
      gate.innerHTML = '<form class="wp-preview-auth-card" id="wpPreviewAuthForm"><h2>Private preview sign-in</h2><p>Sign in with your separate WordPress workspace account to preview this draft.</p><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button type="submit">Sign in</button><p id="wpPreviewAuthStatus" role="status"></p></form>';
      document.body.append(gate);
      const form = gate.querySelector("form"), status = gate.querySelector("#wpPreviewAuthStatus");
      form.addEventListener("submit", async event => {
        event.preventDefault();
        const values = new FormData(form), button = form.querySelector("button");
        button.disabled = true; status.textContent = "Signing in…";
        try {
          const email = String(values.get("email") || "").trim().toLowerCase();
          if (email !== "halalfoodbd.official@gmail.com") throw new Error("Access restricted: use the authorized owner email.");
          const result = await client.auth.signIn.email({ email, password: String(values.get("password") || "") });
          if (result.error) throw result.error;
          location.reload();
        } catch (error) { status.textContent = error?.message || "Sign-in failed."; button.disabled = false; }
      });
    } catch (error) {
      const gate = document.createElement("div");
      gate.className = "wp-preview-auth";
      gate.textContent = "Private preview authentication is unavailable: " + String(error?.message || error);
      document.body.append(gate);
    }
  })();
})();