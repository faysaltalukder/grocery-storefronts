import fs from "node:fs";
import assert from "node:assert/strict";
const api=fs.readFileSync("shared/neon-builder-api.js","utf8"),storefront=fs.readFileSync("shared/storefront.js","utf8"),css=fs.readFileSync("shared/storefront.css","utf8");
assert.match(api,/async function authContext\\s*\\(/,"Neon Auth context must be defined");
assert.match(api,/async function getPublishPreflight\\s*\\(/,"Publish preflight must exist");
assert.match(api,/submit_storefront_quote_request/,"Quote submission RPC must be wired");
assert.match(api,/inventory_verified/,"Publish preflight must require verified inventory");
assert.match(storefront,/function quickOrderSheet\\s*\\(/,"Wholesale quick order sheet must exist");
assert.match(storefront,/async function submitQuote\\s*\\(/,"Wholesale quote form must persist");
assert.match(storefront,/function reorderTrackedOrder\\s*\\(/,"Order reorder must exist");
assert.match(storefront,/data-reorder-tracked/,"Reorder control must be rendered");
assert.match(storefront,/deliveryZoneForArea/,"Checkout must use configured delivery zones");
assert.match(css,/sf-quick-order/,"Wholesale quick order must be styled");
for(const site of ["general-supermarket","fresh-produce","express-grocery","wholesale-bulk"]){const html=fs.readFileSync(site+"/index.html","utf8");assert.match(html,/@neon\\/neon-js/,site+" must use Neon");assert.doesNotMatch(html,/supabase/i,site+" must not use Supabase");}
assert.doesNotMatch(api,/supabase/i,"Shared API must remain independent of Supabase");
assert.doesNotMatch(storefront,/supabase/i,"Shared storefront must remain independent of Supabase");
console.log("Grocery commerce integration checks passed.");
