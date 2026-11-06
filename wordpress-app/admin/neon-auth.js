/* Independent WordPress admin gate and first-owner bootstrap. */
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
  const renderGate = (gate, mode = "signin") => {
    gate.hidden = false;
    const creating = mode === "create";
    gate.innerHTML = '<section class="wp-auth-card"><span class="wp-auth-kicker">PRIVATE WORDPRESS WORKSPACE</span><h1>' + (creating ? "Create your owner account" : "Sign in to WordPress Studio") + '</h1><p>' + (creating ? "This one-time setup is reserved for the workspace owner. Use the owner email and create a strong password." : "Sign in with the owner account registered for this private workspace.") + '</p><div class="wp-auth-mode" role="group" aria-label="Account access"><button type="button" data-mode="signin" aria-pressed="' + (!creating) + '">Sign In</button><button type="button" data-mode="create" aria-pressed="' + creating + '">Create Account</button></div>' + (creating ? '<form id="wpCreateForm"><label>Your name<input name="name" type="text" autocomplete="name" maxlength="100" required></label><label>Owner email<input name="email" type="email" autocomplete="email" value="' + AUTHORIZED_EMAIL + '" readonly required></label><label>Create password<input name="password" type="password" autocomplete="new-password" minlength="12" required><small>Use at least 12 characters. Do not reuse another website password.</small></label><label>Confirm password<input name="confirmPassword" type="password" autocomplete="new-password" minlength="12" required></label><button type="submit">Create Owner Account</button></form>' : '<form id="wpAuthForm"><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button type="submit">Sign in securely</button></form>') + '<p class="wp-auth-note">Only ' + AUTHORIZED_EMAIL + ' is authorized to open this workspace.</p><p id="wpAuthStatus" role="status" aria-live="polite"></p></section>';
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
      if (session?.user?.id) await client.auth.signOut();

      let mode = "signin";
      const paint = () => {
        renderGate(gate, mode);
        const status = gate.querySelector("#wpAuthStatus");
        gate.querySelectorAll("[data-mode]").forEach(tab => tab.addEventListener("click", () => {
          mode = tab.dataset.mode;
          paint();
        }));
        const createForm = gate.querySelector("#wpCreateForm");
        if (createForm) createForm.addEventListener("submit", async event => {
          event.preventDefault();
          const button = createForm.querySelector('button[type="submit"]');
          const data = new FormData(createForm);
          const name = String(data.get("name") || "").trim();
          const email = normalizeEmail(data.get("email"));
          const password = String(data.get("password") || "");
          const confirmPassword = String(data.get("confirmPassword") || "");
          if (email !== AUTHORIZED_EMAIL) {
            status.textContent = "This one-time owner registration is restricted to the authorized email.";
            return;
          }
          if (password.length < 12 || password !== confirmPassword) {
            status.textContent = password !== confirmPassword ? "The two passwords do not match." : "Choose a password with at least 12 characters.";
            return;
          }
          button.disabled = true;
          status.textContent = "Creating your private WordPress owner account…";
          try {
            const result = await client.auth.signUp.email({ name, email, password });
            if (result?.error) throw result.error;
            const createdEmail = normalizeEmail(result?.data?.user?.email || result?.user?.email || email);
            if (createdEmail !== AUTHORIZED_EMAIL) {
              await client.auth.signOut();
              throw new Error("The returned account did not match the authorized owner email. Access was denied.");
            }
            status.textContent = "Owner account created. Opening your WordPress dashboard…";
            window.setTimeout(() => location.reload(), 900);
          } catch (error) {
            status.textContent = error?.message || "Account creation failed. Confirm that one-time registration is enabled, then try again.";
            button.disabled = false;
          }
        });
        const form = gate.querySelector("#wpAuthForm");
        if (form) form.addEventListener("submit", async event => {
          event.preventDefault();
          const button = form.querySelector('button[type="submit"]');
          const data = new FormData(form);
          button.disabled = true;
          const email = normalizeEmail(data.get("email"));
          if (email !== AUTHORIZED_EMAIL) {
            status.textContent = "Access restricted: use the authorized owner email.";
            button.disabled = false;
            return;
          }
          status.textContent = "Verifying your authorized WordPress account…";
          try {
            const result = await client.auth.signIn.email({ email, password: String(data.get("password") || "") });
            if (result?.error) throw result.error;
            location.reload();
          } catch (error) {
            status.textContent = error?.message || "Sign-in failed. Check your credentials and try again.";
            button.disabled = false;
          }
        });
      };
      paint();
    } catch (error) {
      gate.hidden = false;
      gate.innerHTML = '<section class="wp-auth-card"><h1>WordPress authentication unavailable</h1><p>' + esc(error?.message || "The dedicated Neon Auth service could not be reached.") + '</p><button type="button" onclick="location.reload()">Retry</button></section>';
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();