/* Independent WordPress admin gate and owner password recovery. */
(() => {
  "use strict";
  const AUTHORIZED_EMAIL = "halalfoodbd.official@gmail.com";
  const normalizeEmail = value => String(value ?? "").trim().toLowerCase();
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const mountShell = async (app, client) => {
    if (!app || app.querySelector(".wp-admin-shell")) return;
    const header = document.createElement("header");
    header.className = "wp-admin-shell";
    header.innerHTML = '<a class="wp-admin-brand" href="./index.html"><span class="wp-admin-mark">W</span><span><strong>WordPress Studio</strong><small>Independent Grocery Builder</small></span></a><nav aria-label="WordPress workspace"><a href="./wordpress-templates.html?category=ecommerce-grocery&template=1">Templates</a><a href="./website-pages.html?template=general-supermarket">Pages</a><a href="./website-orders.html?template=general-supermarket">Orders</a></nav><button type="button" class="wp-admin-signout">Sign out</button>';
    app.prepend(header);
    header.querySelector(".wp-admin-signout").addEventListener("click", async () => {
      const button = header.querySelector(".wp-admin-signout");
      button.disabled = true;
      try { await client.auth.signOut(); location.replace("./index.html"); }
      catch (error) { button.disabled = false; alert(error?.message || "Could not sign out."); }
    });
  };
  const renderLogin = (gate) => {
    gate.hidden = false;
    gate.innerHTML = '<section class="wp-auth-card"><span class="wp-auth-kicker">PRIVATE WORDPRESS WORKSPACE</span><h1>Sign in to WordPress Studio</h1><p>Your private owner account is already registered. Sign in with its email and password, or set a password using the recovery email.</p><form id="wpAuthForm"><label>Owner email<input name="email" type="email" autocomplete="username" value="' + AUTHORIZED_EMAIL + '" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button type="submit">Sign in securely</button><button type="button" class="wp-auth-link" id="wpForgotPassword">Set / Reset Password</button></form><p class="wp-auth-note">Access is restricted to the authorized owner account. Public sign-up remains disabled.</p><p id="wpAuthStatus" role="status" aria-live="polite"></p></section>';
  };
  const renderReset = (gate, token) => {
    gate.hidden = false;
    gate.innerHTML = '<section class="wp-auth-card"><span class="wp-auth-kicker">PRIVATE WORDPRESS WORKSPACE</span><h1>Set your owner password</h1><p>Choose a strong password for your existing WordPress Studio owner account.</p><form id="wpResetForm"><label>New password<input name="password" type="password" autocomplete="new-password" minlength="12" required></label><label>Confirm new password<input name="confirmPassword" type="password" autocomplete="new-password" minlength="12" required></label><button type="submit">Save Password</button></form><p id="wpAuthStatus" role="status" aria-live="polite"></p></section>';
    const form = gate.querySelector("#wpResetForm");
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const data = new FormData(form);
      const password = String(data.get("password") || "");
      const confirmPassword = String(data.get("confirmPassword") || "");
      const status = gate.querySelector("#wpAuthStatus");
      if (password.length < 12 || password !== confirmPassword) {
        status.textContent = password !== confirmPassword ? "The two passwords do not match." : "Use at least 12 characters for your password.";
        return;
      }
      button.disabled = true;
      status.textContent = "Saving your new password securely…";
      try {
        const result = await window.WPNeonClient.auth.resetPassword({ newPassword: password, token });
        if (result?.error) throw result.error;
        status.textContent = "Password saved. Redirecting you to sign in…";
        window.history.replaceState({}, "", window.location.pathname);
        window.setTimeout(() => location.reload(), 1200);
      } catch (error) {
        status.textContent = error?.message || "The reset link is invalid or expired. Request a new password reset email.";
        button.disabled = false;
      }
    });
  };
  async function boot() {
    const gate = document.getElementById("authGate");
    const app = document.getElementById("adminApp");
    if (!gate || !app) return;
    app.hidden = true;
    try {
      const client = await window.WPNeonClientReady;
      const resetToken = new URLSearchParams(window.location.search).get("token");
      if (resetToken) {
        renderReset(gate, resetToken);
        return;
      }
      const session = await window.WPAuthReady;
      if (session?.user?.id && normalizeEmail(session.user.email) === AUTHORIZED_EMAIL) {
        gate.hidden = true;
        app.hidden = false;
        await mountShell(app, client);
        return;
      }
      if (session?.user?.id) await client.auth.signOut();
      renderLogin(gate);
      const status = gate.querySelector("#wpAuthStatus");
      const form = gate.querySelector("#wpAuthForm");
      form.addEventListener("submit", async event => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const data = new FormData(form);
        const email = normalizeEmail(data.get("email"));
        if (email !== AUTHORIZED_EMAIL) {
          status.textContent = "Access restricted: use the authorized owner email.";
          return;
        }
        button.disabled = true;
        status.textContent = "Verifying your authorized WordPress account…";
        try {
          const result = await client.auth.signIn.email({ email, password: String(data.get("password") || "") });
          if (result?.error) throw result.error;
          location.reload();
        } catch (error) {
          status.textContent = error?.message || "Sign-in failed. Check your password or use Set / Reset Password.";
          button.disabled = false;
        }
      });
      gate.querySelector("#wpForgotPassword").addEventListener("click", async event => {
        const button = event.currentTarget;
        button.disabled = true;
        status.textContent = "Sending a secure password setup link to the owner email…";
        try {
          const result = await client.auth.requestPasswordReset({
            email: AUTHORIZED_EMAIL,
            redirectTo: window.location.origin + window.location.pathname
          });
          if (result?.error) throw result.error;
          status.textContent = "If the owner email is registered, a password setup link has been sent. Check your inbox and spam folder.";
        } catch (error) {
          status.textContent = error?.message || "Could not send the password setup email. Please try again.";
          button.disabled = false;
        }
      });
    } catch (error) {
      gate.hidden = false;
      gate.innerHTML = '<section class="wp-auth-card"><h1>WordPress authentication unavailable</h1><p>' + esc(error?.message || "The dedicated Neon Auth service could not be reached.") + '</p><button type="button" onclick="location.reload()">Retry</button></section>';
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();