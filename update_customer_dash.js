const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/customer/Dashboard.jsx');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Legacy Access Cards
  content = content.replace(/bg-\[#EDF7BD\] border border-white\/5/g, 'bg-[#003049] border border-white/10');
  content = content.replace(/text-black mb-1 group-hover:text-black/g, 'text-white mb-1');
  content = content.replace(/text-black uppercase tracking-widest">{item.description}/g, 'text-gray-300 uppercase tracking-widest">{item.description}');
  content = content.replace(/text-black group-hover:scale-110 group-hover:bg-transparent group-hover:text-black/g, 'text-white group-hover:scale-110');
  content = content.replace(/ChevronRight className="w-6 h-6 text-black group-hover:text-black group-hover:translate-x-2/g, 'ChevronRight className="w-6 h-6 text-white group-hover:translate-x-2');

  // 2. Status Protocol Card
  content = content.replace(/bg-gradient-to-br from-white to-white rounded-\[3rem\] p-10 border border-white\/5/g, 'bg-[#003049] rounded-[3rem] p-10 border border-white/10');
  
  // Replace text-black with text-white inside the Status Protocol area specifically.
  // It's safer to replace all text-black with text-white for these lower elements in lg:col-span-5
  let splitParts = content.split('lg:col-span-5');
  if (splitParts.length === 2) {
    splitParts[1] = splitParts[1].replace(/text-black/g, 'text-white');
    content = splitParts[0] + 'lg:col-span-5' + splitParts[1];
  }

  // 3. Exclusive Offer Card
  // Since we did text-black -> text-white above, this might be handled, but let's change its background.
  content = content.replace(/className="bg-transparent p-10/g, 'className="bg-[#003049] border border-white/10 p-10');

  // Ensure button text remains black if it's the Secure Access button
  content = content.replace(/bg-\[#EDF7BD\] text-white px-8/g, 'bg-[#EDF7BD] text-black px-8');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Customer Dashboard sections updated to #003049');
}
