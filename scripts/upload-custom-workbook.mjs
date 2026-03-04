/**
 * Upload custom workbook HTML files to Supabase Storage
 * and register metadata in the custom_workbooks table.
 *
 * Usage:
 *   node scripts/upload-custom-workbook.mjs \
 *     --user-id <uuid> \
 *     --slug cooking-english \
 *     --title "Cooking English 30 Days" \
 *     --dir /path/to/html/files \
 *     [--days 30] \
 *     [--theme-color "#e8a4b8"] \
 *     [--navigator-name "Chef Bear"] \
 *     [--description "A 30-day cooking English course"]
 *
 * HTML files should be named: day1.html, day2.html, ..., day30.html
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
const envFile = readFileSync(resolve(__dirname, '../.env'), 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const eq = line.indexOf('=');
  if (eq > 0 && !line.startsWith('#')) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}

const SUPABASE_URL = env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

// Parse CLI args
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      args[key] = argv[i + 1] || '';
      i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const userId = args['user-id'];
const slug = args['slug'];
const title = args['title'];
const htmlDir = args['dir'];
const totalDays = parseInt(args['days'] || '30', 10);
const themeColor = args['theme-color'] || '#e8a4b8';
const navigatorName = args['navigator-name'] || null;
const description = args['description'] || null;

if (!userId || !slug || !title || !htmlDir) {
  console.error('Usage: node scripts/upload-custom-workbook.mjs --user-id <uuid> --slug <slug> --title <title> --dir <path>');
  process.exit(1);
}

const storagePath = `${userId}/${slug}`;

async function supabaseRequest(path, options = {}) {
  const url = `${SUPABASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      ...options.headers,
    },
  });
  return res;
}

async function main() {
  console.log(`Uploading custom workbook: ${title}`);
  console.log(`  User: ${userId}`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Dir:  ${htmlDir}`);
  console.log(`  Days: ${totalDays}`);
  console.log();

  // 1. Upload HTML files to Storage
  let uploaded = 0;
  for (let day = 1; day <= totalDays; day++) {
    const filename = `day${day}.html`;
    const filepath = join(htmlDir, filename);
    let content;
    try {
      content = readFileSync(filepath, 'utf-8');
    } catch {
      console.warn(`  SKIP: ${filename} not found`);
      continue;
    }

    const storageName = `${storagePath}/day${day}.html`;
    const res = await supabaseRequest(
      `/storage/v1/object/custom-workbooks/${storageName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/html',
          'x-upsert': 'true',
        },
        body: content,
      }
    );

    if (res.ok) {
      uploaded++;
      process.stdout.write(`  ✓ day${day} `);
    } else {
      const err = await res.text();
      console.error(`  ✗ day${day}: ${res.status} ${err}`);
    }
  }
  console.log();
  console.log(`  Uploaded ${uploaded}/${totalDays} files`);

  // 2. Upsert metadata in custom_workbooks table
  const metadata = {
    user_id: userId,
    slug,
    title,
    description,
    total_days: totalDays,
    theme_color: themeColor,
    navigator_name: navigatorName,
    storage_path: storagePath,
  };

  const res = await supabaseRequest('/rest/v1/custom_workbooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(metadata),
  });

  if (res.ok) {
    console.log('  ✓ Metadata saved');
  } else {
    const err = await res.text();
    console.error(`  ✗ Metadata error: ${res.status} ${err}`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
