import fs from "node:fs";
import assert from "node:assert/strict";
const api=fs.readFileSync("shared/neon-builder-api.js","utf8");
const storefront=fs.readFileSync("shared/storefront.js","utf8");
const css=fs.readFileSync("shared/storefront.css","utf8");
assert.ok(api.includes("async function authContext("),"Neon Auth context must be defined");
assert.ok(api.includes("async function getPublishPreflight("),"Publish preflight must exist");
assert.ok(api.includes("submit_storefront_quote_request"),"Quote submission RPC must be wired");
assert.ok(api.includes("inventory_verified"),"Publish preflight must require verified inventory");
assert.ok(storefront.includes("function quickOrderSheet("),"Wholesale quick order sheet must exist");
assert.ok(storefront.includes("async function submitQuote("),"Wholesale quote form must persist");
assert.ok(storefront.includes("function reorderTrackedOrder("),"Order reorder must exist");
assert.ok(storefront.includes("data-reorder-tracked"),"Reorder control must be rendered");
assert.ok(storefront.includes("deliveryZoneForArea"),"Checkout must use configured delivery zones");
assert.ok(css.includes("sf-quick-order"),"Wholesale quick order must be styled");
for(const site of ["general-supermarket","fresh-produce","express-grocery","wholesale-bulk"]){
 const html=fs.readFileSync(site+"/index.html","utf8");
 assert.ok(html.includes("@neon/neon-js"),site+" must use the independent Neon client");
 assert.ok(!html.toLowerCase().includes("supabase"),site+" must not use Supabase");
 assert.ok(html.includes("20261107-commerce-core-v6"),site+" must use the current asset cache version");
}
assert.ok(!api.toLowerCase().includes("supabase"),"Shared API must remain independent of Supabase");
assert.ok(!storefront.toLowerCase().includes("supabase"),"Shared storefront must remain independent of Supabase");
console.log("Grocery commerce integration checks passed.");
