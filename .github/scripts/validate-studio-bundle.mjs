import { readFileSync } from "node:fs";
import vm from "node:vm";

const bundle = JSON.parse(readFileSync(new URL("../backups/studio-production-bundle.json", import.meta.url), "utf8"));
const required = ["admin/neon-builder-api.js", "admin/website-catalog.js", "admin/website-catalog.html", "storefront.js", "storefront.css", "storefront.html"];
for (const path of required) {
  if (typeof bundle[path] !== "string" || !bundle[path].length) throw new Error("Missing Studio runtime file: " + path);
}
const scripts = Object.entries(bundle).filter(([path]) => path.endsWith(".js"));
for (const [path, source] of scripts) new vm.Script(source, { filename: path });
const api = bundle["admin/neon-builder-api.js"];
const catalog = bundle["admin/website-catalog.js"];
const storefront = bundle["storefront.js"];
if (!api.includes("inventory_verified") || !api.includes("Publishing blocked")) throw new Error("Real-inventory publishing guard is missing.");
if (!catalog.includes("importProductsCsv") || !catalog.includes("exportProductsCsv") || !catalog.includes("hfStoreOperationsForm")) throw new Error("Catalogue CSV or operations workflow is missing.");
if (!storefront.includes("posts=docFor") || !storefront.includes("sf-rich-block") || !storefront.includes("WPNeonClientReady")) throw new Error("Rich storefront renderer or WordPress Neon integration is missing.");
for (const [path, content] of Object.entries(bundle)) {
  if (path.endsWith(".html") && content.includes("_ship=bv6dsk2")) throw new Error("Stale deployment pin remains in " + path);
}
console.log("Validated " + scripts.length + " Studio JavaScript files and the commerce safety checks.");
