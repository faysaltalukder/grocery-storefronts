import fs from "node:fs";
import assert from "node:assert/strict";

const api = fs.readFileSync("shared/neon-builder-api.js", "utf8");
const storefront = fs.readFileSync("shared/storefront.js", "utf8");
const css = fs.readFileSync("shared/storefront.css", "utf8");

assert.match(api, /async function authContext\s*\(/, "Neon auth context must be defined locally");
assert.match(api, /async function getPublishPreflight\s*\(/, "Publishing must expose a preflight audit");
for (const token of ["demo_catalog", "inventory_verified", "delivery_zones", "cod", "privacy", "terms"]) {
  assert.ok(api.includes(token), "Publish preflight is missing: " + token);
}
assert.match(api, /product_price_tiers/, "Storefront loader must fetch active quantity price tiers");
assert.match(storefront, /function deliveryAreas\s*\(/, "Checkout must derive real delivery areas");
assert.match(storefront, /id="sfArea" name="area" required/, "Checkout must require a configured delivery zone");
assert.match(storefront, /function wholesaleShopPage\s*\(/, "Wholesale must provide a quick order sheet");
assert.match(storefront, /function unitPriceFor\s*\(/, "Cart totals must honor server quantity price tiers");
assert.match(css, /\.sf-quick-order/, "Wholesale quick order sheet must be styled");

for (const site of ["general-supermarket", "fresh-produce", "express-grocery", "wholesale-bulk"]) {
  const html = fs.readFileSync(site + "/index.html", "utf8");
  assert.match(html, /20261107-audit-commerce-v1/, site + " must use the current cache version");
  assert.match(html, /@neon\/neon-js/, site + " must use the independent Neon client");
  assert.doesNotMatch(html, /supabase/i, site + " must not reference another backend");
}
assert.doesNotMatch(api, /supabase/i, "Shared API must remain independent of other backends");
assert.doesNotMatch(storefront, /supabase/i, "Shared renderer must remain independent of other backends");
console.log("Commerce foundation static validation passed for all four storefronts.");
