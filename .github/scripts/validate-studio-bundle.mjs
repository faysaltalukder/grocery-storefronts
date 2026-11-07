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
const orderRpc = readFileSync(new URL("../../migrations/20261108_generic_storefront_order_processing.sql", import.meta.url), "utf8");
const quoteRpc = readFileSync(new URL("../../migrations/20261107_quote_response_rpc.sql", import.meta.url), "utf8");
if (!api.includes("inventory_verified") || !api.includes("Publishing blocked")) throw new Error("Real-inventory publishing guard is missing.");
if (!api.includes("Resolve all of these items first") || !api.includes("const blockers=[]")) throw new Error("Publish readiness does not report all launch blockers together.");
const commerce = bundle["admin/commerce.js"];
if (!api.includes("loadCentralCommerce") || !api.includes("centralAdjustInventory") || !api.includes("centralCreatePurchaseOrder") || !api.includes("centralRecordOrderPayment")) throw new Error("Central commerce Neon API methods are missing.");
if (!api.includes("documents,deliveryZones") || !api.includes("deliveryZones||[]).filter(z=>z.is_active)")) throw new Error("Publishing preflight does not validate real delivery-zone records.");
if (api.includes('if(!zones.length)blockers.push("Add at least one real delivery zone')) throw new Error("Publishing must not require area-specific delivery zones for a reusable template.");
if (!api.includes("defaultFee") || !api.includes("defaultMinimum")) throw new Error("Publishing must validate the optional store-wide delivery defaults.");
if (!api.includes("Product details cannot change stock") || !api.includes("centralAdjustInventory")) throw new Error("Product edits can bypass audited stock movements.");
for (const feature of ["Products & inventory", "Orders & fulfilment", "Customers", "Suppliers", "Purchasing", "Delivery & stores", "Finance & payments", "Returns", "Wholesale pricing", "Reports"]) if (!bundle["admin/commerce.html"].includes(feature)) throw new Error("Central commerce navigation is missing: " + feature);
if (!commerce.includes("ocCategoryForm") || !commerce.includes("Recent stock movements") || !commerce.includes("loadCentralCommerce")) throw new Error("Central product/category and inventory operations are incomplete.");
if (!bundle["admin/commerce.html"].includes("WPAuthReady") && !bundle["admin/commerce.js"].includes("WPAuthReady")) throw new Error("Central commerce owner authentication is missing.");
if (!catalog.includes("importProductsCsv") || !catalog.includes("exportProductsCsv") || !catalog.includes("hfStoreOperationsForm")) throw new Error("Catalogue CSV or operations workflow is missing.");
if (!storefront.includes("function docFor(page)") || !storefront.includes("sf-rich-block") || !storefront.includes("const storefrontApi=()=>window.HFNeonBuilderApi||window.WPNeonBuilderApi;") || !storefront.includes('name="area"') || !storefront.includes("Area / city (optional)")) throw new Error("Rich storefront renderer, delivery-area checkout or independent Neon API adapter is missing.");
if (!storefront.includes('location.pathname.endsWith("/storefront.html")')) throw new Error("Central Studio preview must keep product, cart and checkout routes on storefront.html instead of falling back to the Studio dashboard.");
if (!storefront.includes("priceForProduct") || !storefront.includes("deliveryFeeForArea") || !storefront.includes("minimumOrderForArea") || !storefront.includes("deliveryZones") || !storefront.includes("priceTiers")) throw new Error("Storefront wholesale pricing or delivery-zone totals are missing.");
if (!storefront.includes("sfReturnForm") || !storefront.includes("submitReturnRequest") || !storefront.includes("Quick bulk order sheet") || !storefront.includes("sfBrandFilter")) throw new Error("Customer returns, wholesale quick ordering or catalogue filters are missing.");
if (!api.includes("submitReturnRequest")) throw new Error("Storefront return request API is missing.");
if (!api.includes("updateCentralQuote") || !api.includes("quoteRequests:quoteRequests||[]") || !api.includes("rpc/respond_to_storefront_quote_request")) throw new Error("Central quotation request API is missing.");
if (!quoteRpc.includes("SECURITY DEFINER") || !quoteRpc.includes("auth.uid()") || !quoteRpc.includes("q.owner_id = v_user_id") || !quoteRpc.includes("TO authenticated") || !quoteRpc.includes("FROM anonymous")) throw new Error("Owner-scoped quotation response RPC security is incomplete.");
if (!commerce.includes("function quotesPage()") || !commerce.includes("data-quote-update") || !commerce.includes("updateCentralQuote")) throw new Error("Central wholesale quotation management is missing.");
if (!storefront.includes("function quantityStep(p)") || !storefront.includes("sfSubstitution") || !storefront.includes("const storefrontApi=()=>window.HFNeonBuilderApi||window.WPNeonBuilderApi;")) throw new Error("Fresh produce or private preview commerce features are missing.");
if (!storefront.includes("case\"about\":case\"contact\":case\"faq\":case\"delivery\":return contentPage(key);")) throw new Error("Storefront information pages are not routed correctly.");
if (!bundle["admin/commerce.html"].includes('data-tab="quotes"')) throw new Error("Central commerce quotation navigation is missing.");

if (!orderRpc.includes("product_price_tiers") || !orderRpc.includes("v_unit_price") || !orderRpc.includes("delivery_zones")) throw new Error("Server-side tier pricing or delivery-zone checks are missing.");
if (!orderRpc.includes("demo_catalog") || !orderRpc.includes("inventory_verified") || !orderRpc.includes("default_fee") || !orderRpc.includes("Duplicate product lines")) throw new Error("Database order RPC safety checks are incomplete.");
for (const [path, content] of Object.entries(bundle)) {
  if (path.endsWith(".html") && content.includes("_ship=bv6dsk2")) throw new Error("Stale deployment pin remains in " + path);
}
console.log("Validated " + scripts.length + " Studio JavaScript files and the commerce safety checks.");
