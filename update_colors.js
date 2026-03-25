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

const colorRegex = /\btext-(white|gray-\d+|dark|primary-\d+|gold-\d+|black-\d+)\b/g;

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.match(colorRegex)) {
      let newContent = content.replace(colorRegex, 'text-black');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated text colors in: ${filePath}`);
    }
  }
});
