import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update text colors to be readable on light background (#EDF7BD)
    # text-white -> text-[#281C59] (except where we want to keep it on buttons/navbar)
    # Actually, let's just do bulk text replacements.
    
    # 2. Update Layouts (Sidebars) explicitly
    if 'Layout.jsx' in filepath or 'Sidebar' in filepath:
        # Sidebars typically use 'bg-black' or 'bg-[#0a0a0b]' or 'bg-[#111113]' for the sidebar panel
        content = content.replace('bg-[#0a0a0b]', 'bg-[#281C59]')
        content = content.replace('bg-[#111113]', 'bg-[#281C59]')
        content = content.replace('bg-black', 'bg-[#281C59]')
        
    # 3. Update Navbar explicitly
    elif 'Navbar.jsx' in filepath:
        content = content.replace('bg-black/90', 'bg-[#281C59]')
        content = content.replace('bg-black', 'bg-[#281C59]')
        
    # 4. Global Backgrounds to #EDF7BD for other pages
    else:
        content = content.replace('bg-[#0a0a0b]', 'bg-[#EDF7BD]')
        content = content.replace('bg-[#111113]', 'bg-[#EDF7BD]')
        content = content.replace('bg-black', 'bg-[#EDF7BD]')
        content = content.replace('bg-gray-900', 'bg-[#EDF7BD]')
        content = content.replace('bg-gray-950', 'bg-[#EDF7BD]')
        content = content.replace('bg-gray-50', 'bg-[#EDF7BD]') # If any light themes were left

    # But wait! If the global background is light, text-white is invisible.
    # We should replace text-white with text-[#281C59] everywhere EXCEPT inside sections that are still dark!
    # This is tricky with simple replace.
    # Let's replace `text-white` -> `text-[#281C59]` globally,
    # AND `text-gray-300`/`400` -> `text-gray-700`
    
    # Let's fix button texts: Buttons use 'bg-gold-500 text-black'. We will change gold to #281C59 via tailwind config, so buttons will be dark. text-black on dark button is bad, change to text-white.
    content = content.replace('bg-gold-500 text-black', 'bg-[#281C59] text-white')
    content = content.replace('bg-gold-500', 'bg-[#281C59]')
    content = content.replace('text-gold-500', 'text-[#281C59]')
    content = content.replace('border-gold-500', 'border-[#281C59]')

    # Now for text-white -> text-[#281C59]
    # But don't replace 'text-white' if it's right after 'bg-[#281C59] text-white' because we just created that.
    # A simple regex won't perfectly know what's in a dark div. 
    # Let's just blindly replace text-white with text-[#281C59] and text-gray-400 with text-gray-600.
    # AND fix any buttons that specifically just got bg-[#281C59] by forcing text-white.
    
    content = re.sub(r'\btext-white\b', 'text-[#281C59]', content)
    content = re.sub(r'\btext-gray-300\b', 'text-[#281C59]', content)
    content = re.sub(r'\btext-gray-400\b', 'text-[#281C59]', content)
    
    # We want text on the navbar and sidebar to be white because their bg is #281C59.
    if 'Navbar.jsx' in filepath or 'Layout.jsx' in filepath:
        # Revert text-[#281C59] to text-white for navbar and layouts.
        content = content.replace('text-[#281C59]', 'text-[#EDF7BD]')
        
    # Overrides for buttons we specifically changed
    content = content.replace('bg-[#281C59] text-[#281C59]', 'bg-[#281C59] text-[#EDF7BD]')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('c:/Users/niche/OneDrive/Desktop/Hotel booking/frontend/src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Theme update complete.")
