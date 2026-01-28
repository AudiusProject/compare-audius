// scripts/seed-db.ts

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { platforms, features, comparisons } from '../db/schema';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Read JSON files
const platformsJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data/platforms.json'), 'utf-8')
);
const featuresJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data/features.json'), 'utf-8')
);
const comparisonsJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data/comparisons.json'), 'utf-8')
);

async function seed() {
  console.log('🌱 Seeding database...');
  
  // Check environment variables
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL is not set');
  }
  
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  const db = drizzle(client);
  
  // Clear existing data (order matters due to foreign keys)
  console.log('Clearing existing data...');
  await db.delete(comparisons);
  await db.delete(features);
  await db.delete(platforms);
  
  // Seed platforms
  console.log('Seeding platforms...');
  const platformRecords = platformsJson.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    logo: p.logo,
    isAudius: p.isAudius,
    isDraft: false, // Existing data is published
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await db.insert(platforms).values(platformRecords);
  console.log(`  ✓ Inserted ${platformRecords.length} platforms`);
  
  // Seed features
  console.log('Seeding features...');
  const featureRecords = featuresJson.map((f: any) => ({
    id: f.id,
    name: f.name,
    slug: f.slug,
    description: f.description,
    sortOrder: f.sortOrder,
    isDraft: false, // Existing data is published
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await db.insert(features).values(featureRecords);
  console.log(`  ✓ Inserted ${featureRecords.length} features`);
  
  // Seed comparisons
  console.log('Seeding comparisons...');
  const comparisonRecords = comparisonsJson.map((c: any) => ({
    id: c.id,
    platformId: c.platformId,
    featureId: c.featureId,
    status: c.status,
    displayValue: c.displayValue,
    context: c.context,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await db.insert(comparisons).values(comparisonRecords);
  console.log(`  ✓ Inserted ${comparisonRecords.length} comparisons`);
  
  console.log('✅ Seed complete!');
  
  // Validate referential integrity
  console.log('\nValidating referential integrity...');
  const allPlatforms = await db.select().from(platforms);
  const allFeatures = await db.select().from(features);
  const allComparisons = await db.select().from(comparisons);
  
  const platformIds = new Set(allPlatforms.map(p => p.id));
  const featureIds = new Set(allFeatures.map(f => f.id));
  
  let errors = 0;
  for (const comp of allComparisons) {
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
  }
  
  console.log('\nDatabase summary:');
  console.log(`  - Platforms: ${allPlatforms.length}`);
  console.log(`  - Features: ${allFeatures.length}`);
  console.log(`  - Comparisons: ${allComparisons.length}`);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
