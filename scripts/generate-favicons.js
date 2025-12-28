const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/uploads/logo.png');
const publicDir = path.join(__dirname, '../public');

// Favicon sizes
const favicons = [
  { size: 32, name: 'favicon_32.png' },
  { size: 192, name: 'favicon_192.png' },
  { size: 512, name: 'favicon_512.png' },
];

async function generateFavicons() {
  try {
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('Logo file not found at:', logoPath);
      process.exit(1);
    }

    console.log('Generating favicons from logo...');

    // Generate PNG favicons
    for (const favicon of favicons) {
      const outputPath = path.join(publicDir, favicon.name);
      await sharp(logoPath)
        .resize(favicon.size, favicon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${favicon.name} (${favicon.size}x${favicon.size})`);
    }

    // Generate favicon.ico (32x32)
    const icoPath = path.join(publicDir, 'favicon.ico');
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(icoPath);
    console.log('✓ Generated favicon.ico (32x32)');

    console.log('\n✅ All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();

