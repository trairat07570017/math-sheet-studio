#!/usr/bin/env node

/**
 * MathSheet AI Studio - Build Pipeline (Zero-Dependency)
 * 
 * Compiles modular sources from src/ into production-ready standalone index.html
 * for both GitHub Pages and Google Apps Script deployments.
 * 
 * Usage:
 *   node build.js          # Build index.html
 *   node build.js --check  # Verify build without modifying files
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');
const OUTPUT_FILE = path.join(ROOT_DIR, 'index.html');

function runBuild() {
  const isCheckMode = process.argv.includes('--check');
  console.log(`[build.js] ${isCheckMode ? 'Verifying' : 'Building'} MathSheet AI Studio from src/...`);

  // 1. Read Components
  const headHtml = fs.readFileSync(path.join(SRC_DIR, 'markup', 'head.html'), 'utf8');
  const mainCss = fs.readFileSync(path.join(SRC_DIR, 'styles', 'main.css'), 'utf8');
  const bodyHtml = fs.readFileSync(path.join(SRC_DIR, 'markup', 'body.html'), 'utf8');
  const curriculumJson = fs.readFileSync(path.join(SRC_DIR, 'data', 'curriculum.json'), 'utf8');
  
  // Modules
  const storeJs = fs.readFileSync(path.join(SRC_DIR, 'modules', 'curriculum-store.js'), 'utf8');
  const gatewayJs = fs.readFileSync(path.join(SRC_DIR, 'modules', 'storage-gateway.js'), 'utf8');
  const renderJs = fs.readFileSync(path.join(SRC_DIR, 'modules', 'sheet-render-engine.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(SRC_DIR, 'modules', 'app.js'), 'utf8');

  // 2. Validate JSON
  try {
    const parsedData = JSON.parse(curriculumJson);
    const lessonCount = Object.keys(parsedData).length;
    console.log(`[build.js] Verified curriculum.json: ${lessonCount} lessons loaded.`);
  } catch (err) {
    console.error('[build.js] ERROR: curriculum.json is invalid JSON!', err);
    process.exit(1);
  }

  // 3. Assemble Output HTML
  const parts = [];

  // Head
  parts.push(headHtml.trimEnd());
  parts.push('\n  <style>\n');
  parts.push(mainCss.trim());
  parts.push('\n  </style>\n</head>\n');

  // Body
  parts.push(bodyHtml.trim());
  parts.push('\n\n  <script>\n');

  // Data bootstrap
  parts.push('    // --- BOOTSTRAP CURRICULUM BASELINE DATA ---\n');
  parts.push(`    const VERIFIED_CURRICULUM_BASELINE = ${curriculumJson.trim()};\n\n`);

  // Inlined Modules
  parts.push('    // --- MODULE: CURRICULUM STORE ---\n');
  parts.push(storeJs.trim());
  parts.push('\n\n    // Initialize store with baseline data\n');
  parts.push('    window.CurriculumStore.init(VERIFIED_CURRICULUM_BASELINE);\n\n');

  parts.push('    // --- MODULE: STORAGE GATEWAY ---\n');
  parts.push(gatewayJs.trim());
  parts.push('\n\n');

  parts.push('    // --- MODULE: SHEET RENDER ENGINE ---\n');
  parts.push(renderJs.trim());
  parts.push('\n\n');

  parts.push('    // --- MODULE: APP ORCHESTRATOR ---\n');
  parts.push(appJs.trim());
  parts.push('\n  </script>\n');
  parts.push('</body>\n</html>\n');

  const compiledHtml = parts.join('');

  if (isCheckMode) {
    console.log(`[build.js] Check passed! Compiled size: ${(compiledHtml.length / 1024).toFixed(1)} KB`);
    return;
  }

  // Write file
  fs.writeFileSync(OUTPUT_FILE, compiledHtml, 'utf8');
  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`[build.js] Successfully built ${OUTPUT_FILE} (${(stats.size / 1024).toFixed(1)} KB)`);
}

runBuild();
