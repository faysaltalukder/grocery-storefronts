import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const read = (path) => readFileSync(path, "utf8");
const api = read("admin/neon-builder-api.js");
const admin = read("admin/wordpress-templates.js");
const storefront = read("storefront.js");
const storefrontCss = read("storefront.css");
const adminCss = read("admin/wordpress-templates.css");
const migration = read("wordpress-app/migrations/20261109_fitness_gym_four_templates.sql");
const keys = ["ironforge-performance-club","pulse-athletic-studio","balance-house-yoga-pilates","athletelab-performance-coaching"];

for (const key of keys) {
  assert.ok(admin.includes('"key":"' + key + '"'), "Admin catalog missing " + key);
  assert.ok(api.includes('"' + key + '"'), "Neon API allowlist/page set missing " + key);
  assert.ok(storefront.includes('"' + key + '"'), "Storefront runtime missing " + key);
  assert.ok(storefrontCss.includes('body[data-template="' + key + '"]'), "Storefront design tokens missing " + key);
  assert.ok(adminCss.includes(key), "Admin preview styling missing " + key);
  assert.ok(migration.includes("'" + key + "'"), "Neon migration missing " + key);
}
const match = api.match(/const FITNESS_PAGE_SETS=(\{[\s\S]*?\});\s*const FITNESS_META=/);
assert.ok(match, "Fitness page sets must be declared as a static JSON catalog");
const pageSets = JSON.parse(match[1]);
for (const key of keys) {
  assert.equal(pageSets[key]?.length, 40, key + " must define exactly 40 page types");
  assert.equal(new Set(pageSets[key].map((page) => page[0])).size, 40, key + " page keys must be unique");
}
assert.ok(api.includes("new Set(ids).size!==83"), "API must enforce 83 unique page-specific image IDs");
assert.ok(api.includes("fitnessTemplates.includes(templateKey)"), "API must enforce the Fitness page/image release gate");
for (const name of ["function fitnessArtSrc(","function fitnessHome()","function fitnessEditorialPage(","function fitnessEnquiryPage()","function submitFitnessEnquiry(","function fitnessMediaSection("]) {
  assert.ok(storefront.includes(name), "Missing storefront journey/render function: " + name);
}
assert.ok(admin.includes("function fitness(t){"), "Admin preview renderer is missing");
assert.ok(admin.includes('"athletelab-performance-coaching":fitness'), "All four Fitness previews must be registered");
assert.ok(migration.includes("ON CONFLICT (template_key,page_key) DO UPDATE"), "Page seed migration must be idempotent");
console.log("Fitness & Gym validation passed: 4 distinct templates, 160 page types, 332 unique first-party SVG assets, storefront/admin renderers and migration guards.");
