const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateTradingFavicon() {
  try {
    // Create a clean, professional trading icon
    const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <!-- Background with rounded corners -->
      <rect width="32" height="32" rx="4" fill="#1E40AF"/>
      
      <!-- Chart grid lines (subtle) -->
      <line x1="6" y1="8" x2="26" y2="8" stroke="#3B82F6" stroke-width="0.5" opacity="0.3"/>
      <line x1="6" y1="16" x2="26" y2="16" stroke="#3B82F6" stroke-width="0.5" opacity="0.3"/>
      <line x1="6" y1="24" x2="26" y2="24" stroke="#3B82F6" stroke-width="0.5" opacity="0.3"/>
      
      <!-- Trading chart line (upward trend) -->
      <path d="M4 26 L8 22 L12 24 L16 18 L20 20 L24 14 L28 10" 
            stroke="#10B981" 
            stroke-width="2.5" 
            fill="none" 
            stroke-linecap="round" 
            stroke-linejoin="round"/>
      
      <!-- Small upward arrow -->
      <path d="M24 14 L28 10 L28 14 M28 10 L24 10" 
            stroke="#10B981" 
            stroke-width="1.5" 
            fill="none" 
            stroke-linecap="round" 
            stroke-linejoin="round"/>
      
      <!-- Dollar sign in bottom right -->
      <circle cx="25" cy="25" r="4" fill="#FBBF24"/>
      <text x="25" y="27.5" 
            font-family="Arial, sans-serif" 
            font-size="5" 
            font-weight="bold" 
            fill="#1E40AF" 
            text-anchor="middle">$</text>
    </svg>`;

    // Generate PNG files for different sizes
    const sizes = [16, 32, 48];
    const pngBuffers = [];
    
    for (const size of sizes) {
      const buffer = await sharp(Buffer.from(svgIcon))
        .resize(size, size)
        .png()
        .toBuffer();
      
      pngBuffers.push(buffer);
      
      // Save individual PNG files
      await sharp(buffer)
        .toFile(path.join(__dirname, `public/favicon-${size}.png`));
    }

    // Generate ICO file with multiple sizes
    const icoBuffer = await toIco(pngBuffers);
    fs.writeFileSync(path.join(__dirname, 'src/app/favicon.ico'), icoBuffer);

    // Also create apple-touch-icon
    await sharp(Buffer.from(svgIcon))
      .resize(180, 180)
      .png()
      .toFile(path.join(__dirname, 'public/apple-touch-icon.png'));

    console.log('Trading favicon generated successfully!');
    console.log('Files created:');
    console.log('- src/app/favicon.ico');
    console.log('- public/favicon-16.png');
    console.log('- public/favicon-32.png'); 
    console.log('- public/favicon-48.png');
    console.log('- public/apple-touch-icon.png');
    
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateTradingFavicon();
