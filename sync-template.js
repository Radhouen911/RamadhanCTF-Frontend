// Script to sync asset filenames from static/index.html to templates/base.html
// This is needed because Vite hashes filenames for cache-busting
// We need to update the Jinja template to reference the actual filenames
//
// Usage: npm run sync-template (add to package.json after build)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const staticIndexPath = path.join(__dirname, "static", "index.html");
const baseTemplatePath = path.join(__dirname, "templates", "base.html");

// Read the built index.html
const staticIndex = fs.readFileSync(staticIndexPath, "utf8");

// Extract JS and CSS filenames using regex
// Vite outputs hashed files like: index-abc123def.js and index-xyz789.css
const jsMatch = staticIndex.match(/src="\/assets\/(index-[^"]+\.js)"/);
const cssMatch = staticIndex.match(/href="\/assets\/(index-[^"]+\.css)"/);

if (!jsMatch || !cssMatch) {
  console.error("❌ Could not find asset filenames in static/index.html");
  console.error("  Make sure you have run 'npm run build' first");
  process.exit(1);
}

const jsFile = jsMatch[1];
const cssFile = cssMatch[1];

console.log("📦 Found assets:");
console.log("  JS: ", jsFile);
console.log("  CSS:", cssFile);

// Read the base template
let baseTemplate = fs.readFileSync(baseTemplatePath, "utf8");

// Replace ANY existing index-*.css with the new one (using regex to match any hash)
baseTemplate = baseTemplate.replace(
  /href="\/themes\/Ramadhan\/static\/assets\/index-[^"]+\.css"/g,
  `href="/themes/Ramadhan/static/assets/${cssFile}"`,
);

// Replace ANY existing index-*.js with the new one (using regex to match any hash)
baseTemplate = baseTemplate.replace(
  /src="\/themes\/Ramadhan\/static\/assets\/index-[^"]+\.js"/g,
  `src="/themes/Ramadhan/static/assets/${jsFile}"`,
);

// Write back to base.html
fs.writeFileSync(baseTemplatePath, baseTemplate, "utf8");

console.log("✅ Updated templates/base.html with new asset filenames");
