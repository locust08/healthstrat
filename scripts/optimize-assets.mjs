import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const imageRoot = path.join(root, 'public', 'assets', 'img');
const manifestPath = path.join(root, 'public', 'assets', 'image-manifest.json');
const sourceExtensions = new Set(['.jpg', '.jpeg', '.png']);
const skipNames = new Set(['favicon.png']);

function toPublicPath(filePath) {
  return `/${path.relative(path.join(root, 'public'), filePath).replaceAll(path.sep, '/')}`;
}

function fromAssetPath(assetPath) {
  const normalized = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return path.join(root, 'public', normalized);
}

async function referencedImages() {
  const files = await fs.readdir(root);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  const cssFiles = ['public/assets/css/style.css'];
  const refs = new Set(['/assets/img/healthstrat/generated/global-hero-healthcare-transformation.png']);
  const imageRefPattern = /(?:src|href|data-src)=["']\/?(assets\/img\/[^"']+\.(?:png|jpe?g))["']|url\(["']?\.\.\/img\/([^"')]+\.(?:png|jpe?g))["']?\)/gi;

  for (const file of [...htmlFiles, ...cssFiles]) {
    const fullPath = path.join(root, file);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      for (const match of content.matchAll(imageRefPattern)) {
        const ref = match[1] ? `/${match[1]}` : `/assets/img/${match[2]}`;
        refs.add(ref.replaceAll('\\', '/'));
      }
    } catch {
      // Optional source files may not exist in every checkout.
    }
  }

  return [...refs].map(fromAssetPath);
}

function targetWidth(width, filePath) {
  const normalized = filePath.replaceAll(path.sep, '/');
  if (normalized.includes('/healthstrat/generated/')) return Math.min(width, 1440);
  if (normalized.endsWith('/map.png') || normalized.endsWith('/map1.png')) return Math.min(width, 1600);
  return Math.min(width, 1920);
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!sourceExtensions.has(ext) || skipNames.has(path.basename(filePath))) return null;

  const image = sharp(filePath, { animated: false });
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) return null;

  const outputPath = filePath.replace(ext, '.webp');
  const width = targetWidth(metadata.width, filePath);
  const optimized = sharp(filePath, { animated: false }).rotate();

  await optimized
    .resize({
      width,
      withoutEnlargement: true,
    })
    .webp({
      quality: filePath.includes(`${path.sep}generated${path.sep}`) ? 72 : 78,
      effort: 5,
    })
    .toFile(outputPath);

  const outputMetadata = await sharp(outputPath).metadata();
  return {
    source: toPublicPath(filePath),
    optimized: toPublicPath(outputPath),
    width: outputMetadata.width || metadata.width,
    height: outputMetadata.height || metadata.height,
  };
}

const allFiles = await referencedImages();
const manifest = {};

for (const filePath of allFiles) {
  try {
    await fs.access(filePath);
  } catch {
    continue;
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.webp') {
    const metadata = await sharp(filePath).metadata();
    manifest[toPublicPath(filePath)] = {
      optimized: toPublicPath(filePath),
      width: metadata.width,
      height: metadata.height,
    };
    continue;
  }

  const result = await optimizeImage(filePath);
  if (result) {
    manifest[result.source] = {
      optimized: result.optimized,
      width: result.width,
      height: result.height,
    };
  }
}

await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Optimized ${Object.keys(manifest).length} image assets.`);
