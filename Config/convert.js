/*
 * Maestro Excel Data Driven Framework
 *
 * Copyright (c) 2026 Md. Mohai Minul Islam
 * Licensed under Apache License 2.0
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const testDataDir = path.join(__dirname, '../TestData');
const jsonDataBaseDir = path.join(__dirname, '../JsonData');

try {
  if (!fs.existsSync(testDataDir)) {
    console.error(`[ERROR] TestData folder not found at: ${testDataDir}`);
    process.exit(1);
  }

  // Get all files from TestData directory
  const files = fs.readdirSync(testDataDir);

  // Filter out non-Excel files or temporary lock files (e.g., ~$file.xlsx)
  const excelFiles = files.filter(file => 
    (file.endsWith('.xlsx') || file.endsWith('.xls')) && !file.startsWith('~$')
  );

  if (excelFiles.length === 0) {
    console.warn(`[WARNING] No Excel files found in: ${testDataDir}`);
    process.exit(0);
  }

  console.log(`[INFO] Found ${excelFiles.length} Excel file(s) to process.`);

  // Iterate over each Excel file found in TestData
  excelFiles.forEach((fileName) => {
    const inputPath = path.join(testDataDir, fileName);
    const excelFileName = path.basename(fileName, path.extname(fileName));
    const outputDir = path.join(jsonDataBaseDir, excelFileName);

    // Create a subfolder under JsonData for this specific Excel file
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`[INFO] Created folder: ${outputDir}`);
    }

    // Read the Excel workbook
    const workbook = XLSX.readFile(inputPath);

    // Convert each sheet into its own JSON file
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const safeFileName = `${sheetName.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
      const outputPath = path.join(outputDir, safeFileName);

      fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
      console.log(`  └─ [SUCCESS] Sheet '${sheetName}' -> JsonData/${excelFileName}/${safeFileName}`);
    });
  });

  console.log('[SUCCESS] All Excel files converted to JSON successfully.');
} catch (error) {
  console.error('[ERROR] Conversion failed:', error);
  process.exit(1);
}