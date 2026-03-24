import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Global Backgrounds
    # Old Background: #FAACBF -> New Background: #0AC4E0
    content = content.replace('[#FAACBF]', '[#0AC4E0]')
    content = content.replace('#FAACBF', '#0AC4E0')  # for CSS
    
    # 2. Navbars & Sidebars to #0992C2, Buttons to #0B2D72
    # Currently everything is #FE81D4.
    if 'Layout' in filepath or 'Sidebar' in filepath or 'Navbar' in filepath:
        content = content.replace('[#FE81D4]', '[#0992C2]')
        # Change the text color inside navbars to white
        content = content.replace('text-gray-900', 'text-white')
        content = content.replace('text-[#111827]', 'text-white')
    else:
        # Everywhere else, #FE81D4 means it's a button or an accent tag. Change to #0B2D72
        content = content.replace('[#FE81D4]', '[#0B2D72]')
        # CSS variable
        content = content.replace('#FE81D4', '#0B2D72')
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    # Post-process for buttons to ensure text contrast for dark buttons
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('text-gray-900', 'text-white') if 'bg-[#0B2D72] text-gray-900' in content else content
    # A bit more aggressive for readability:
    content = re.sub(r'bg-\[#0B2D72\]([^>]*?)text-gray-900', r'bg-[#0B2D72]\g<1>text-white', content)
    content = re.sub(r'bg-\[#0992C2\]([^>]*?)text-gray-900', r'bg-[#0992C2]\g<1>text-white', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('c:/Users/niche/OneDrive/Desktop/Hotel booking/frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            process_file(os.path.join(root, file))

print("Theme update v4 complete.")
