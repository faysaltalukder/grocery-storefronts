/* Independent WordPress admin gate and owner password recovery. */
(() => {
  "use strict";
  const AUTHORIZED_EMAIL = "halalfoodbd.official@gmail.com";
  const normalizeEmail = value => String(value ?? "").trim().toLowerCase();
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const mountShell = async (app, client) => {
    if (!app || app.querySelector(".wp-studio-layout")) return;
    const content = app.querySelector("#pageContent");
    if (!content) return;
    const path = window.location.pathname.split("/").pop() || "index.html";
    const groups = [
      { group: "WORKSPACE", items: [
        ["index.html", "⌂", "Overview"],
        ["wordpress-templates.html?category=ecommerce-grocery&template=1", "▦", "Templates", "wordpress-templates.html"],
        ["website-builder.html?template=general-supermarket", "✎", "Website editor", "website-builder.html"],
        ["website-pages.html?template=general-supermarket", "▤", "Pages", "website-pages.html"]
      ]},
      { group: "COMMERCE", items: [
        ["website-orders.html?template=general-supermarket", "▣", "Orders", "website-orders.html"]
      ]},
      { group: "PUBLISHING", items: [
        ["wordpress-live.html", "◉", "Live preview"]
      ]}
    ];
    const layout = document.createElement("div");
    layout.className = "wp-studio-layout";
    const sidebar = document.createElement("aside");
    sidebar.className = "wp-studio-sidebar";
    sidebar.innerHTML = '<a class="wp-studio-brand" href="./index.html"><span class="wp-studio-brand-mark">W</span><span><strong>WordPress Studio</strong><small>Independent workspace</small></span></a><div class="wp-studio-nav"></div><div class="wp-studio-sidebar-foot"><strong>Neon connected</strong><span>Private owner workspace</span></div>';
    const nav = sidebar.querySelector(".wp-studio-nav");
    groups.forEach(group => {
      const section = document.createElement("section");
      section.className = "wp-studio-nav-group";
      const label = document.createElement("p");
      label.className = "wp-studio-nav-label";
      label.textContent = group.group;
      section.append(label);
      group.items.forEach(([href, icon, title, activePath]) => {
        const a = document.createElement("a");
        a.className = "wp-studio-nav-link";
        a.href = "./" + href;
        a.innerHTML = '<span class="wp-studio-nav-icon" aria-hidden="true">' + icon + '</span><span>' + title + '</span>';
        const target = activePath || href.split("?")[0];
        if (path === target) { a.classList.add("active"); a.setAttribute("aria-current", "page"); }
        section.append(a);
      });
      nav.append(section);
    });
    const frame = document.createElement("div");
    frame.className = "wp-studio-frame";
    const topbar = document.createElement("header");
    topbar.className = "wp-studio-topbar";
    topbar.innerHTML = '<button class="wp-studio-menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false">☰</button><div class="wp-studio-breadcrumb"><span>WordPress Studio</span><b>/</b><strong></strong></div><div class="wp-studio-top-spacer"></div><span class="wp-studio-secure-label">● Secure Neon workspace</span><button type="button" class="wp-studio-signout">Sign out</button>';
    topbar.querySelector(".wp-studio-breadcrumb strong").textContent = sidebar.querySelector(".wp-studio-nav-link.active span:last-child")?.textContent || "Overview";
    const main = document.createElement("div");
    main.className = "wp-studio-content";
    content.classList.add("admin-main");
    main.append(content);
    frame.append(topbar, main);
    layout.append(sidebar, frame);
    app.append(layout);
    const toggle = topbar.querySelector(".wp-studio-menu-toggle");
    toggle.addEventListener("click", () => {
      const open = layout.classList.toggle("sidebar-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    layout.addEventListener("click", event => {
      if (event.target === layout && layout.classList.contains("sidebar-open")) {
        layout.classList.remove("sidebar-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    topbar.querySelector(".wp-studio-signout").addEventListener("click", async () => {
      const button = topbar.querySelector(".wp-studio-signout");
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
        const response = await fetch("https://ep-wild-lab-a1jqqu0p.neonauth.ap-southeast-1.aws.neon.tech/halal_food_db/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ newPassword: password, token })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result?.error) {
          throw new Error(result?.message || result?.error?.message || "Neon Auth rejected the password reset request (HTTP " + response.status + ").");
        }
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
      const params = new URLSearchParams(window.location.search);
      const resetToken = params.get("token");
      const resetError = params.get("error");
      if (resetError) {
        renderLogin(gate);
        gate.querySelector("#wpAuthStatus").textContent = "The password reset link is invalid or expired. Request a new reset email.";
        return;
      }
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