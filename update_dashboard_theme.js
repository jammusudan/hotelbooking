const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'frontend/src/pages/AdminDashboard.jsx',
  'frontend/src/components/layout/AdminLayout.jsx',
  'frontend/src/components/layout/ManagerLayout.jsx',
  'frontend/src/pages/manager/Dashboard.jsx',
  'frontend/src/pages/manager/Reviews.jsx',
  'frontend/src/pages/manager/Rooms.jsx',
  'frontend/src/pages/manager/Bookings.jsx',
  'frontend/src/pages/manager/Hotels.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Switch text colors for dark background
    content = content.replace(/text-black/g, 'text-white');
    content = content.replace(/hover:text-black/g, 'hover:text-white');
    
    // Replace light background with the new dark blue
    content = content.replace(/bg-\[#EDF7BD\]/g, 'bg-[#003049]');
    content = content.replace(/from-\[#EDF7BD\]/g, 'from-[#003049]');
    content = content.replace(/to-\[#EDF7BD\]/g, 'to-[#003049]');
    content = content.replace(/shadow-\[#EDF7BD\]/g, 'shadow-[#003049]');
    content = content.replace(/border-\[#EDF7BD\]/g, 'border-[#003049]');
    content = content.replace(/bg-transparent border-r/g, 'bg-[#003049] border-r');
    
    // Adjust borders for visibility on dark background
    content = content.replace(/border-gray-800/g, 'border-white/10');
    content = content.replace(/border-gray-900/g, 'border-white/20');

    // Any raw #EDF7BD matches not caught above
    content = content.replace(/#EDF7BD/g, '#003049');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', file);
  } else {
    console.log('Not found:', file);
  }
});
