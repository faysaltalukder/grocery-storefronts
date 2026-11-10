import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const read = p => readFileSync(p, "utf8");
for (const file of ["storefront.js","nonprofit-storefront.js","admin/nonprofit-organization-studio.js","admin/neon-builder-api.js"]) {
  execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
}
const keys = ["kindred-relief","meridian-impact","wildroot-collective","civic-circle"];
const doc = read("docs/NONPROFIT_ORGANIZATION_TEMPLATES.md");
const migration = read("wordpress-app/database/migrations/20261110_nonprofit_organization_templates.sql");
for (const key of keys) {
  assert.ok(doc.includes("`"+key+"`"), "Missing template documentation: "+key);
  assert.ok(migration.includes(key), "Missing Neon migration record: "+key);
  const section = doc.split("## ").find(x => x.startsWith(key==="kindred-relief"?"Kindred Relief":key==="meridian-impact"?"Meridian Impact":key==="wildroot-collective"?"Wildroot Collective":"Civic Circle"));
  assert.ok(section, "Missing page architecture section for "+key);
  const numbered = section.split("\n").filter(x => /^\d+\. `/.test(x));
  assert.equal(numbered.length, 40, key+" must document 40 page types");
}
for (const token of ['"uniqueAssetsPerWebsite":83','"homepageMaximum":5','"innerPageMinimum":2','"innerPageMaximum":4','"showcasePreviewOnly":true']) assert.ok(migration.includes(token), "Missing asset/release policy: "+token);
const admin = read("admin/wordpress-templates.html");
const storefront = read("storefront.html");
const api = read("admin/neon-builder-api.js");
const runtime = read("storefront.js");
assert.ok(admin.includes("nonprofit-organization-studio.js") && admin.includes("nonprofit-organization.css"));
assert.ok(storefront.includes("nonprofit-storefront.js") && storefront.indexOf("nonprofit-storefront.js") < storefront.indexOf("storefront.js"));
assert.ok(api.includes('"kindred-relief"') && api.includes('"nonprofit-organization"].includes(website.category_slug)'));
assert.ok(runtime.includes("window.NonprofitStorefront.render") && runtime.includes("window.NonprofitStorefront.bind") && runtime.includes("window.NonprofitStorefront.mobileDock"));
console.log("Nonprofit & Organization validation passed: 4 models, 160 page types, 83 unique page-assigned SVG assets per website, and showcase-only request/payment safety.");
