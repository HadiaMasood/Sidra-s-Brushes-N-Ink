/**
 * Image Compression Script
 * 
 * This script compresses images in the public folder
 * Run: node scripts/compress-images.js
 * 
 * Requirements:
 * npm install sharp --save-dev
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '../public');
const QUALITY = 80;
const SIZES = [400, 800, 1200, 1920]; // Responsive image sizes

// Image extensions to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

/**
 * Get all image files recursively
 */
function getImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Compress and convert image to WebP
 */
async function compressImage(imagePath) {
  try {
    const ext = path.extname(imagePath);
    const basename = path.basename(imagePath, ext);
    const dirname = path.dirname(imagePath);

    console.log(`Processing: ${imagePath}`);

    // Get original image metadata
    const metadata = await sharp(imagePath).metadata();
    const originalSize = fs.statSync(imagePath).size;

    // 1. Optimize original format
    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(imagePath)
        .jpeg({ quality: QUALITY, progressive: true })
        .toFile(path.join(dirname, `${basename}-optimized${ext}`));
      
      // Replace original with optimized
      fs.renameSync(
        path.join(dirname, `${basename}-optimized${ext}`),
        imagePath
      );
    } else if (ext === '.png') {
      await sharp(imagePath)
        .png({ quality: QUALITY, compressionLevel: 9 })
        .toFile(path.join(dirname, `${basename}-optimized${ext}`));
      
      // Replace original with optimized
      fs.renameSync(
        path.join(dirname, `${basename}-optimized${ext}`),
        imagePath
      );
    }

    // 2. Create WebP version
    const webpPath = path.join(dirname, `${basename}.webp`);
    await sharp(imagePath)
      .webp({ quality: QUALITY })
      .toFile(webpPath);

    // 3. Create responsive sizes (optional)
    for (const size of SIZES) {
      if (metadata.width > size) {
        // Original format
        await sharp(imagePath)
          .resize(size, null, { withoutEnlargement: true })
          .toFile(path.join(dirname, `${basename}-${size}w${ext}`));

        // WebP format
        await sharp(imagePath)
          .resize(size, null, { withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(path.join(dirname, `${basename}-${size}w.webp`));
      }
    }

    const newSize = fs.statSync(imagePath).size;
    const webpSize = fs.statSync(webpPath).size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    const webpSavings = ((originalSize - webpSize) / originalSize * 100).toFixed(2);

    console.log(`  ✓ Optimized: ${(originalSize / 1024).toFixed(2)}KB → ${(newSize / 1024).toFixed(2)}KB (${savings}% smaller)`);
    console.log(`  ✓ WebP: ${(webpSize / 1024).toFixed(2)}KB (${webpSavings}% smaller than original)`);

  } catch (error) {
    console.error(`  ✗ Error processing ${imagePath}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Image Compression Script\n');
  console.log(`Directory: ${PUBLIC_DIR}`);
  console.log(`Quality: ${QUALITY}%`);
  console.log(`Responsive sizes: ${SIZES.join(', ')}px\n`);

  const imageFiles = getImageFiles(PUBLIC_DIR);
  console.log(`Found ${imageFiles.length} images to process\n`);

  let processed = 0;
  for (const imagePath of imageFiles) {
    await compressImage(imagePath);
    processed++;
    console.log(`Progress: ${processed}/${imageFiles.length}\n`);
  }

  console.log('✅ All images processed!');
}

// Run script
main().catch(console.error);
