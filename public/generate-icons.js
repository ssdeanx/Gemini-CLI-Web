import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template function for Gemini logo
function createIconSVG(size) {
  const cornerRadius = Math.round(size * 0.1875); // 18.75% corner radius for modern look
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="geminiGrad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#0891b2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0e7490;stop-opacity:1" />
    </linearGradient>
    <filter id="glow${size}">
      <feGaussianBlur stdDeviation="${size * 0.05}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background with gradient -->
  <rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#geminiGrad${size})"/>
  
  <!-- Gemini constellation symbol -->
  <g transform="translate(${size/2},${size/2})" filter="url(#glow${size})">
    <!-- Top star shape -->
    <path d="M0,${-size*0.3125} L${size*0.078125},0 L${-size*0.078125},0 Z" fill="white" opacity="0.95"/>
    <!-- Bottom star shape -->
    <path d="M0,${size*0.3125} L${-size*0.078125},0 L${size*0.078125},0 Z" fill="white" opacity="0.85"/>
    <!-- Connecting elements -->
    <circle cx="0" cy="${-size*0.15625}" r="${size*0.046875}" fill="white" opacity="0.9"/>
    <circle cx="0" cy="${size*0.15625}" r="${size*0.046875}" fill="white" opacity="0.9"/>
    <line x1="0" y1="${-size*0.15625}" x2="0" y2="${size*0.15625}" stroke="white" stroke-width="${size*0.03125}" opacity="0.7"/>
  </g>
</svg>`;
}

// Generate SVG and PNG files for each size
async function generateIcons() {
  for (const size of sizes) {
    const svgContent = createIconSVG(size);
    const svgFilename = `icon-${size}x${size}.svg`;
    const pngFilename = `icon-${size}x${size}.png`;
    const svgFilepath = path.join(__dirname, 'icons', svgFilename);
    const pngFilepath = path.join(__dirname, 'icons', pngFilename);
    
    // Write SVG file
    fs.writeFileSync(svgFilepath, svgContent);
    console.log(`Created ${svgFilename}`);
    
    // Convert SVG to PNG using sharp
    try {
      await sharp(Buffer.from(svgContent))
        .png()
        .toFile(pngFilepath);
      console.log(`Created ${pngFilename}`);
    } catch (error) {
      console.error(`Error creating ${pngFilename}:`, error.message);
    }
  }
  
  // Also create favicon.png from favicon.svg
  try {
    const faviconSvg = fs.readFileSync(path.join(__dirname, 'favicon.svg'), 'utf8');
    await sharp(Buffer.from(faviconSvg))
      .resize(64, 64)
      .png()
      .toFile(path.join(__dirname, 'favicon.png'));
    console.log('\nCreated favicon.png');
  } catch (error) {
    console.error('Error creating favicon.png:', error.message);
  }
}

generateIcons().then(() => {
  console.log('\nAll icons generated successfully!');
}).catch(error => {
  console.error('Error generating icons:', error);
});