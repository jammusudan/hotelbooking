const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let dirPath = path.join(dir, file);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace hex color with transparent in Tailwind arbitrary values and CSS
    // e.g., bg-[#0B2D72] -> bg-transparent
    if (content.includes('#0B2D72')) {
      content = content.replace(/bg-\[#0B2D72\]/g, 'bg-transparent');
      content = content.replace(/border-\[#0B2D72\]/g, 'border-transparent');
      content = content.replace(/text-\[#0B2D72\]/g, 'text-transparent');
      content = content.replace(/shadow-\[#0B2D72\]/g, 'shadow-transparent');
      content = content.replace(/from-\[#0B2D72\]/g, 'from-transparent');
      content = content.replace(/via-\[#0B2D72\]/g, 'via-transparent');
      content = content.replace(/to-\[#0B2D72\]/g, 'to-transparent');
      
      // Fallback for any other #0B2D72 matches like in style={{...}} or standard css
      content = content.replace(/#0B2D72/g, 'transparent');
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Removed blue color in: ${filePath}`);
    }
  }
});
