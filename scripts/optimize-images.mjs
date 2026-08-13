import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

const OPTIMOS_DIR = new URL('../public/images/optimos/', import.meta.url).pathname;

const DESKTOP_MAX_WIDTH = 1200;
const DESKTOP_QUALITY = 78;
const MOBILE_MAX_WIDTH = 640;
const MOBILE_QUALITY = 75;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

async function optimizeImages() {
  const files = await readdir(OPTIMOS_DIR);
  const webpFiles = files.filter(
    (f) => extname(f).toLowerCase() === '.webp' && !f.includes('-mobile')
  );

  console.log(`Found ${webpFiles.length} .webp files to optimize\n`);

  let totalOriginal = 0;
  let totalDesktop = 0;
  let totalMobile = 0;

  for (const file of webpFiles) {
    const filePath = join(OPTIMOS_DIR, file);
    const originalStats = await stat(filePath);
    const originalSize = originalStats.size;
    totalOriginal += originalSize;

    const nameWithoutExt = basename(file, '.webp');

    // Read original buffer
    const inputBuffer = await sharp(filePath).toBuffer();

    // Desktop version: max 1200px wide, quality 78
    const desktopBuffer = await sharp(inputBuffer)
      .resize({ width: DESKTOP_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: DESKTOP_QUALITY })
      .toBuffer();

    // Write desktop version (overwrite original)
    await sharp(desktopBuffer).toFile(filePath);
    const desktopSize = desktopBuffer.length;
    totalDesktop += desktopSize;

    // Mobile version: max 640px wide, quality 75
    const mobilePath = join(OPTIMOS_DIR, `${nameWithoutExt}-mobile.webp`);
    const mobileBuffer = await sharp(inputBuffer)
      .resize({ width: MOBILE_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: MOBILE_QUALITY })
      .toBuffer();

    await sharp(mobileBuffer).toFile(mobilePath);
    const mobileSize = mobileBuffer.length;
    totalMobile += mobileSize;

    const desktopReduction = ((1 - desktopSize / originalSize) * 100).toFixed(1);
    const mobileReduction = ((1 - mobileSize / originalSize) * 100).toFixed(1);

    console.log(`📷 ${file}`);
    console.log(`   Original:  ${formatBytes(originalSize)}`);
    console.log(`   Desktop:   ${formatBytes(desktopSize)} (-${desktopReduction}%)`);
    console.log(`   Mobile:    ${formatBytes(mobileSize)} (-${mobileReduction}%)`);
    console.log('');
  }

  console.log('━'.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   Total original:  ${formatBytes(totalOriginal)}`);
  console.log(`   Total desktop:   ${formatBytes(totalDesktop)} (-${((1 - totalDesktop / totalOriginal) * 100).toFixed(1)}%)`);
  console.log(`   Total mobile:    ${formatBytes(totalMobile)} (-${((1 - totalMobile / totalOriginal) * 100).toFixed(1)}%)`);
  console.log(`\n✅ Done! Optimized ${webpFiles.length} images.`);
}

optimizeImages().catch((err) => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});
