import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = path => readFileSync(resolve(path), "utf8");
const required = [
  "admin/index.html","admin/neon-client.js","admin/neon-auth.js","admin/neon-builder-api.js",
  "admin/wordpress-live.html","admin/wordpress-sandbox.js","admin/wordpress.css",
  "admin/wordpress-templates.html","admin/wordpress-templates.js","admin/wordpress-templates.css",
  "admin/website-builder.html","admin/website-builder.js","admin/website-builder.css",
  "admin/website-pages.html","admin/website-pages.js","admin/website-pages.css",
  "admin/website-orders.html","admin/website-orders.js","admin/website-orders.css",
  "storefront.html","storefront.js","storefront.css"
];
for (const file of required) assert.ok(existsSync(resolve(file)), "missing standalone WordPress file: " + file);

const client = read("admin/neon-client.js");
const auth = read("admin/neon-auth.js");
const api = read("admin/neon-builder-api.js");
const storefrontHtml = read("storefront.html");
const storefrontJs = read("storefront.js");
assert.ok(client.includes("@neon/neon-js") && client.includes("WPNeonClientReady"), "standalone Neon client must initialize");
assert.ok(auth.includes("client.auth.signIn.email") && auth.includes("client.auth.signOut"), "WordPress must manage its own sign-in and sign-out");
assert.ok(api.includes("WPNeonClientReady") && api.includes("client.auth.getSession") && api.includes("client.rpc("), "WordPress API must use its own Neon session and RPC");
assert.ok(storefrontHtml.includes("admin/neon-client.js") && storefrontHtml.includes("admin/neon-builder-api.js"), "storefront must load its own Neon client and API");
assert.ok(storefrontJs.includes("WPNeonClientReady") && storefrontJs.includes("placeOrder") && storefrontJs.includes("trackOrder"), "storefront must support independent preview, COD order and tracking");

for (const file of required.filter(x => x.endsWith(".html") || x.endsWith(".js"))) {
  const source = read(file).toLowerCase();
  for (const forbidden of ["supabase.co","supabase-js","hfadminready","hfneon","store-config.js","shared.js","app.js"]) {
    assert.ok(!source.includes(forbidden), file + " contains forbidden Halal Food runtime dependency: " + forbidden);
  }
}
for (const file of ["admin/wordpress-templates.html","admin/website-builder.html","admin/website-pages.html","admin/website-orders.html"]) {
  const html = read(file);
  assert.ok(html.includes("neon-client.js") && html.includes("neon-auth.js"), file + " must use standalone WordPress auth");
}
assert.ok(read("database/migrations/20261106_neon_data_api_rls.sql").includes("ENABLE ROW LEVEL SECURITY"), "WordPress Neon data must retain RLS");
console.log("Independent WordPress contract passed: standalone Neon auth, API, admin routes, public storefront and no Halal Food Supabase runtime coupling.");
