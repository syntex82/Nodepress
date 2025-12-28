/**
 * Generate Android app icons and Play Store assets
 * Run: npm install sharp && node scripts/generate-assets.js
 */

const fs = require('fs');
const path = require('path');

async function generateAssets() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('Installing sharp...');
    const { execSync } = require('child_process');
    execSync('npm install sharp', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    sharp = require('sharp');
  }

  const svgPath = path.join(__dirname, '../../public/pwa/icons/icon-512.svg');
  const resDir = path.join(__dirname, '../app/src/main/res');
  const assetsDir = path.join(__dirname, '../play-store-assets');

  // Icon sizes for different densities
  const iconSizes = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
  ];

  console.log('📱 Generating Android app icons...\n');

  // Read the SVG
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate icons for each density
  for (const { folder, size } of iconSizes) {
    const outputPath = path.join(resDir, folder, 'ic_launcher.png');
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ ${folder}/ic_launcher.png (${size}x${size})`);
  }

  // Generate 512x512 icon for Play Store
  const icon512Path = path.join(assetsDir, 'icon-512.png');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(icon512Path);
  console.log(`  ✓ play-store-assets/icon-512.png (512x512)`);

  console.log('\n🎨 Generating feature graphic...\n');

  // Create feature graphic (1024x500) with brand colors
  const featureGraphic = await sharp({
    create: {
      width: 1024,
      height: 500,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a
    }
  })
    .composite([
      {
        input: await sharp(svgBuffer).resize(200, 200).png().toBuffer(),
        top: 150,
        left: 100
      },
      {
        input: Buffer.from(`
          <svg width="600" height="200">
            <text x="0" y="60" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">Learn Online</text>
            <text x="0" y="120" font-family="Arial, sans-serif" font-size="28" fill="#94a3b8">Learn Anywhere. Connect Everywhere.</text>
            <text x="0" y="170" font-family="Arial, sans-serif" font-size="20" fill="#4f46e5">Courses • Messaging • Video Calls</text>
          </svg>
        `),
        top: 150,
        left: 350
      }
    ])
    .png()
    .toFile(path.join(assetsDir, 'feature-graphic.png'));

  console.log('  ✓ play-store-assets/feature-graphic.png (1024x500)');

  console.log('\n✅ All assets generated successfully!\n');
  console.log('Next steps:');
  console.log('1. Take screenshots of your app and save to play-store-assets/screenshots/phone/');
  console.log('2. Generate signing keystore (see PLAY_STORE_RELEASE_GUIDE.md)');
  console.log('3. Build release AAB: gradlew.bat bundleRelease');
}

generateAssets().catch(console.error);

