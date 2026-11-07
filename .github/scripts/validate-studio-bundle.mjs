import { readFileSync } from "node:fs";
import vm from "node:vm";

const bundle = JSON.parse(readFileSync(new URL("../backups/studio-production-bundle.json", import.meta.url), "utf8"));
const required = ["admin/neon-builder-api.js", "admin/website-catalog.js", "admin/website-catalog.html", "admin/commerce.html", "admin/commerce.css", "admin/commerce.js", "storefront.js", "storefront.css", "storefront.html"];
for (const path of required) {
  if (typeof bundle[path] !== "string" || !bundle[path].length) throw new Error("Missing Studio runtime file: " + path);
}
const scripts = Object.entries(bundle).filter(([path]) => path.endsWith(".js"));
for (const [path, source] of scripts) new vm.Script(source, { filename: path });
const api = bundle["admin/neon-builder-api.js"];
const catalog = bundle["admin/website-catalog.js"];
const storefront = bundle["storefront.js"];
const orderRpc = readFileSync(new URL("../backups/place_storefront_order.after.sql", import.meta.url), "utf8");
if (!api.includes("inventory_verified") || !api.includes("Publishing blocked")) throw new Error("Real-inventory publishing guard is missing.");
const commerce = bundle["admin/commerce.js"];
if (!api.includes("loadCentralCommerce") || !api.includes("centralAdjustInventory") || !api.includes("centralCreatePurchaseOrder") || !api.includes("centralRecordOrderPayment")) throw new Error("Central commerce Neon API methods are missing.");
for (const feature of ["Products & inventory", "Orders & fulfilment", "Customers", "Suppliers", "Purchasing", "Delivery & stores", "Finance & payments", "Returns", "Wholesale pricing", "Reports"]) if (!bundle["admin/commerce.html"].includes(feature)) throw new Error("Central commerce navigation is missing: " + feature);
if (!commerce.includes("ocCategoryForm") || !commerce.includes("Recent stock movements") || !commerce.includes("loadCentralCommerce")) throw new Error("Central product/category and inventory operations are incomplete.");
if (!bundle["admin/commerce.html"].includes("WPAuthReady") && !bundle["admin/commerce.js"].includes("WPAuthReady")) throw new Error("Central commerce owner authentication is missing.");
if (!catalog.includes("importProductsCsv") || !catalog.includes("exportProductsCsv") || !catalog.includes("hfStoreOperationsForm")) throw new Error("Catalogue CSV or operations workflow is missing.");
if (!storefront.includes("posts=docFor") || !storefront.includes("sf-rich-block") || !storefront.includes("WPNeonClientReady") || !storefront.includes('name="area" required')) throw new Error("Rich storefront renderer, delivery-area checkout or WordPress Neon integration is missing.");
if (!orderRpc.includes("demo_catalog") || !orderRpc.includes("inventory_verified") || !orderRpc.includes("Delivery is not available in the selected area") || !orderRpc.includes("Duplicate product lines")) throw new Error("Database order RPC safety checks are incomplete.");
for (const [path, content] of Object.entries(bundle)) {
  if (path.endsWith(".html") && content.includes("_ship=bv6dsk2")) throw new Error("Stale deployment pin remains in " + path);
}
console.log("Validated " + scripts.length + " Studio JavaScript files and the commerce safety checks.");
