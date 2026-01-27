// scripts/migrate-csv.ts
/**
 * One-time migration script: CSV → JSON
 * 
 * Run with: npx tsx scripts/migrate-csv.ts
 * 
 * Input:  webflow-csv-data/*.csv
 * Output: data/*.json
 */

import * as fs from 'fs';
import * as path from 'path';

// --- Types for migration ---
interface RawPlatform {
  Name: string;
  Slug: string;
  Logo: string;
}

interface RawFeature {
  Feature: string;
  Slug: string;
  Description: string;
  'Sort (String)': string;
}

interface RawComparison {
  'Unique Semantic Name': string;
  'Linked Platform': string;
  'Linked Feature': string;
  Status: string;
  Context: string;
}

// --- Helpers ---
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Handle commas within quoted fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      record[header] = values[i] || '';
    });
    return record;
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// --- Platform slug normalization ---
const PLATFORM_SLUG_MAP: Record<string, string> = {
  'audiusmusic': 'audius',
  'spotify': 'spotify',
  'soundcloud': 'soundcloud',
};

// --- Feature ID mapping (Airtable Record ID → slug) ---
// This will be populated during feature processing
const featureIdToSlug: Record<string, string> = {};

// --- Main migration ---
async function migrate() {
  const csvDir = path.join(process.cwd(), 'webflow-csv-data');
  const dataDir = path.join(process.cwd(), 'data');
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // --- Process Platforms ---
  console.log('Processing platforms...');
  const platformsCSV = fs.readFileSync(
    path.join(csvDir, 'Compare _ Audius vs. Others - Platforms.csv'),
    'utf-8'
  );
  const rawPlatforms = parseCSV(platformsCSV);
  
  const platforms = rawPlatforms.map(p => {
    const originalSlug = p.Slug;
    const normalizedSlug = PLATFORM_SLUG_MAP[originalSlug] || originalSlug;
    
    return {
      id: normalizedSlug,
      name: p.Name,
      slug: normalizedSlug,
      logo: p.Logo,
      isAudius: normalizedSlug === 'audius',
    };
  });
  
  fs.writeFileSync(
    path.join(dataDir, 'platforms.json'),
    JSON.stringify(platforms, null, 2)
  );
  console.log(`  ✓ Wrote ${platforms.length} platforms`);
  
  // --- Process Features ---
  console.log('Processing features...');
  const featuresCSV = fs.readFileSync(
    path.join(csvDir, 'Compare _ Audius vs. Others - Features.csv'),
    'utf-8'
  );
  const rawFeatures = parseCSV(featuresCSV);
  
  const features = rawFeatures.map(f => {
    const slug = slugify(f.Feature);
    const airtableId = f.Slug; // The "Slug" column contains Airtable Record ID
    
    // Build the mapping for comparisons
    featureIdToSlug[airtableId] = slug;
    
    return {
      id: slug,
      name: f.Feature,
      slug: slug,
      description: f.Description,
      sortOrder: parseInt(f['Sort (String)'], 10) || 999,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
  
  fs.writeFileSync(
    path.join(dataDir, 'features.json'),
    JSON.stringify(features, null, 2)
  );
  console.log(`  ✓ Wrote ${features.length} features`);
  
  // --- Process Comparisons ---
  console.log('Processing comparisons...');
  const comparisonsCSV = fs.readFileSync(
    path.join(csvDir, 'Compare _ Audius vs. Others - Comparisons.csv'),
    'utf-8'
  );
  const rawComparisons = parseCSV(comparisonsCSV);
  
  const comparisons = rawComparisons.map(c => {
    const platformSlug = PLATFORM_SLUG_MAP[c['Linked Platform']] || c['Linked Platform'];
    const featureSlug = featureIdToSlug[c['Linked Feature']] || slugify(c['Linked Feature']);
    
    // Determine status
    let status: 'yes' | 'no' | 'partial' | 'custom';
    let displayValue: string | null = null;
    let context: string | null = null;
    
    const rawStatus = c.Status.trim().toLowerCase();
    
    if (rawStatus === 'yes') {
      status = 'yes';
    } else if (rawStatus === 'no') {
      status = 'no';
    } else if (rawStatus === 'partial') {
      status = 'partial';
      context = c.Context || null;
    } else {
      // Empty status with context = custom display value
      status = 'custom';
      displayValue = c.Context || null;
    }
    
    return {
      id: `${platformSlug}-${featureSlug}`,
      platformId: platformSlug,
      featureId: featureSlug,
      status,
      displayValue,
      context,
    };
  });
  
  fs.writeFileSync(
    path.join(dataDir, 'comparisons.json'),
    JSON.stringify(comparisons, null, 2)
  );
  console.log(`  ✓ Wrote ${comparisons.length} comparisons`);
  
  // --- Validation ---
  console.log('\nValidating data integrity...');
  const platformIds = new Set(platforms.map(p => p.id));
  const featureIds = new Set(features.map(f => f.id));
  
  let errors = 0;
  for (const comp of comparisons) {
    if (!platformIds.has(comp.platformId)) {
      console.error(`  ✗ Invalid platform: ${comp.platformId} in ${comp.id}`);
      errors++;
    }
    if (!featureIds.has(comp.featureId)) {
      console.error(`  ✗ Invalid feature: ${comp.featureId} in ${comp.id}`);
      errors++;
    }
  }
  
  if (errors === 0) {
    console.log('  ✓ All references valid');
  } else {
    console.error(`  ✗ Found ${errors} errors`);
    process.exit(1);
  }
  
  console.log('\n✓ Migration complete!');
}

migrate().catch(console.error);
