const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    // Create a simple trading chart favicon
    const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <!-- Blue background -->
      <rect width="32" height="32" rx="6" fill="#1E40AF"/>
      
      <!-- Trading chart line -->
      <path d="M4 24 L8 20 L12 22 L16 16 L20 18 L24 14 L28 12" 
            stroke="#10B981" 
            stroke-width="2" 
            fill="none" 
            stroke-linecap="round"/>
      
      <!-- Upward arrow -->
      <path d="M24 14 L28 12 L28 16" 
            stroke="#10B981" 
            stroke-width="1.5" 
            fill="none" 
            stroke-linecap="round"/>
      
      <!-- Dollar symbol -->
      <circle cx="16" cy="26" r="3" fill="#FFFFFF"/>
      <text x="16" y="28.5" 
            font-family="Arial, sans-serif" 
            font-size="6" 
            font-weight="bold" 
            fill="#1E40AF" 
            text-anchor="middle">$</text>
    </svg>`;

    // Generate different sizes
    const sizes = [16, 32, 48];
    
    for (const size of sizes) {
      await sharp(Buffer.from(svgIcon))
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `public/favicon-${size}.png`));
    }

    // Generate main favicon.ico (using 32x32)
    await sharp(Buffer.from(svgIcon))
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'src/app/favicon.ico'));

    console.log('Favicon generated successfully!');
    
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();
