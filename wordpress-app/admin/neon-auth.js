/* Independent WordPress admin gate and navigation. */
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
  const renderGate = gate => {
    gate.hidden = false;
    gate.innerHTML = '<section class="wp-auth-card"><span class="wp-auth-kicker">PRIVATE WORDPRESS WORKSPACE</span><h1>Sign in to WordPress Studio</h1><p>This account is managed by the dedicated Neon Auth service. Halal Food Supabase sessions and credentials are not used here.</p><form id="wpAuthForm"><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button type="submit">Sign in securely</button></form><button type="button" id="wpAuthReset" class="wp-auth-reset">Forgot password?</button><p id="wpAuthStatus" role="status" aria-live="polite"></p></section>';
  };
  async function boot() {
    const gate = document.getElementById("authGate");
    const app = document.getElementById("adminApp");
    if (!gate || !app) return;
    app.hidden = true;
    try {
      const client = await window.WPNeonClientReady;
      const session = await window.WPAuthReady;
      if (session?.user?.id && normalizeEmail(session.user.email) === AUTHORIZED_EMAIL) {
        gate.hidden = true;
        app.hidden = false;
        await mountShell(app, client);
        return;
      }
      if (session?.user?.id) {
        await client.auth.signOut();
      }
      renderGate(gate);
      const form = gate.querySelector("#wpAuthForm");
      const status = gate.querySelector("#wpAuthStatus");
      form.addEventListener("submit", async event => {
        event.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const data = new FormData(form);
        button.disabled = true;
        const email = normalizeEmail(data.get("email"));
        if (email !== AUTHORIZED_EMAIL) {
          status.textContent = "Access restricted: use the authorized Halal Food admin email.";
          button.disabled = false;
          return;
        }
        status.textContent = "Verifying your authorized WordPress account…";
        try {
          const result = await client.auth.signIn.email({ email, password: String(data.get("password") || "") });
          if (result.error) throw result.error;
          location.reload();
        } catch (error) {
          status.textContent = error?.message || "Sign-in failed. Check your credentials and try again.";
          button.disabled = false;
        }
      });
      gate.querySelector("#wpAuthReset").addEventListener("click", async () => {
        const email = String(new FormData(form).get("email") || "").trim();
        if (!email) { status.textContent = "Enter your account email first."; return; }
        status.textContent = "Requesting a password reset…";
        try {
          const result = await client.auth.requestPasswordReset({ email, redirectTo: location.href.split("?")[0] });
          if (result.error) throw result.error;
          status.textContent = "If the account exists, Neon will send a password reset email.";
        } catch (error) { status.textContent = error?.message || "Could not request a reset email."; }
      });
    } catch (error) {
      gate.hidden = false;
      gate.innerHTML = '<section class="wp-auth-card"><h1>WordPress authentication unavailable</h1><p>' + esc(error?.message || "The dedicated Neon Auth service could not be reached.") + '</p><button type="button" onclick="location.reload()">Retry</button></section>';
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();