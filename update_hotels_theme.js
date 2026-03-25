const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Hotels.jsx');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Split the file so we only apply dark mode text styles to Sidebar and Main Content, 
  // keeping the Page Header text black (since it sits on the light #EDF7BD background)
  const marker = '{/* LEFT: FILTER SIDEBAR */}';
  let parts = content.split(marker);
  
  if (parts.length === 2) {
    let headerPart = parts[0];
    let bodyPart = parts[1];
    
    // Apply styling transformations strictly to the bodyPart
    
    // Convert dark text classes to light text classes inside the dark #003049 sections
    bodyPart = bodyPart.replace(/text-black/g, 'text-white');
    bodyPart = bodyPart.replace(/placeholder:text-black/g, 'placeholder:text-gray-400');
    
    // Convert backgrounds
    bodyPart = bodyPart.replace(/bg-\[#EDF7BD\](?!\/)/g, 'bg-[#003049]'); // Exactly bg-[#EDF7BD]
    bodyPart = bodyPart.replace(/bg-\[#EDF7BD\]\/40/g, 'bg-white/5');
    bodyPart = bodyPart.replace(/bg-\[#EDF7BD\]\/5/g, 'bg-white/5');
    bodyPart = bodyPart.replace(/bg-\[#EDF7BD\]\/60/g, 'bg-[#003049]/80');
    bodyPart = bodyPart.replace(/hover:bg-\[#EDF7BD\]/g, 'hover:bg-white/10');
    bodyPart = bodyPart.replace(/focus:bg-\[#EDF7BD\]\/60/g, 'focus:bg-white/10');
    
    // Border conversions
    bodyPart = bodyPart.replace(/border-white\/5/g, 'border-white/10');
    
    // Gradient overlay on Hotel cards
    bodyPart = bodyPart.replace(/from-white/g, 'from-[#003049]');
    
    // Other specific tweaks to fix contrast
    bodyPart = bodyPart.replace(/focus:border-\[#EDF7BD\]\/50/g, 'focus:border-white/30');

    // Recombine
    content = headerPart + marker + bodyPart;
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated Hotels.jsx to match the #003049 theme in foreground sections.');
  } else {
    console.log('Could not find split marker.');
  }
} else {
  console.log('Hotels.jsx not found.');
}
