/* Private preview authentication. Public storefront visitors remain anonymous. */
(() => {
  "use strict";
  if (new URLSearchParams(location.search).get("preview") !== "1") return;
  (async () => {
    try {
      const client = await window.WPNeonClientReady;
      const authState = await window.WPAuthReady;
      // WPAuthReady resolves the Neon getSession() data envelope: { session }.
      // Read both shapes for compatibility with older client bundles.
      const session = authState?.session || authState;
      if (session?.user?.id) return;
      const gate = document.createElement("div");
      gate.className = "wp-preview-auth";
      gate.innerHTML = '<form class="wp-preview-auth-card" id="wpPreviewAuthForm"><h2>Private preview sign-in</h2><p>Sign in with your merchant account to preview your own draft storefront.</p><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" minlength="12" required></label><button type="submit">Sign in</button><p><a href="./admin/index.html">Create or manage a merchant account</a></p><p id="wpPreviewAuthStatus" role="status"></p></form>';
      document.body.append(gate);
      const form = gate.querySelector("form"), status = gate.querySelector("#wpPreviewAuthStatus");
      form.addEventListener("submit", async event => {
        event.preventDefault();
        const values = new FormData(form), button = form.querySelector("button");
        button.disabled = true; status.textContent = "Signing in…";
        try {
          const email = String(values.get("email") || "").trim().toLowerCase();
          const password = String(values.get("password") || "");
          if (!email || password.length < 12) throw new Error("Enter a valid email and password of at least 12 characters.");
          const result = await client.auth.signIn.email({ email, password });
          if (result?.error) throw result.error;
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