/*
 * Maestro Excel Data Driven Framework
 *
 * Copyright (c) 2026 Md. Mohai Minul Islam
 * Licensed under Apache License 2.0
 */


const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Path to your JsonData directory (relative to project root)
const jsonDataDir = path.join(__dirname, '..', 'JsonData');

// Recursively find and read all .json files in JsonData and its subdirectories
function loadJsonDataRecursively(dir) {
  let combinedData = {};

  if (!fs.existsSync(dir)) {
    console.error(`[ERROR] Directory not found: ${dir}`);
    return combinedData;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively merge subfolders
      Object.assign(combinedData, loadJsonDataRecursively(fullPath));
    } else if (entry.isFile() && path.extname(entry.name) === '.json') {
      try {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(fileContent);

        // Derive endpoint key from filename without extension (e.g., LoginData.json -> LoginData)
        const key = path.basename(entry.name, '.json');

        combinedData[key] = parsed;
        console.log(`[LOADED] ${fullPath} -> Endpoint: http://localhost:8080/${key}`);
      } catch (err) {
        console.error(`[ERROR] Failed to parse JSON file ${fullPath}:`, err.message);
      }
    }
  }

  return combinedData;
}

// Build in-memory database object
const db = loadJsonDataRecursively(jsonDataDir);

// Initialize router with dynamic database object
const router = jsonServer.router(db);

server.use(middlewares);
server.use(router);

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`\n[SUCCESS] JSON Server is running on http://localhost:${PORT}`);
});