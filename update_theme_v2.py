import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Convert all old gold references to the new accent #281C59
    content = re.sub(r'gold-\d{3}', '[#281C59]', content)
    # Convert old dark theme backgrounds (including gradients) to the new #EDF7BD background
    # Since sidebars/navbars are already #281C59, this might be safe for the rest.
    content = content.replace('[#0a0a0b]', '[#EDF7BD]')
    content = content.replace('[#111113]', '[#EDF7BD]')
    content = content.replace('[#D4AF37]', '[#281C59]')
    content = content.replace('[#B5952F]', '[#281C59]')

    # Any lingering standard black backgrounds
    content = re.sub(r'\bbg-black\b', 'bg-[#EDF7BD]', content)
    content = re.sub(r'\bbg-gray-900\b', 'bg-[#EDF7BD]', content)

    # Convert common text colors to something readable on the light background
    content = re.sub(r'\btext-gray-300\b', 'text-[#281C59]', content)
    content = re.sub(r'\btext-gray-400\b', 'text-[#281C59]', content)
    content = re.sub(r'\btext-gray-500\b', 'text-[#281C59]', content)
    
    # Exceptions where the background is accent #281C59, so text MUST be #EDF7BD:
    # Sidebar components:
    if 'Layout' in filepath or 'Sidebar' in filepath or 'Navbar' in filepath:
        content = content.replace('bg-[#EDF7BD]', 'bg-[#281C59]')
        # The text inside nav/sidebar should be light
        content = content.replace('text-[#281C59]', 'text-[#EDF7BD]')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('c:/Users/niche/OneDrive/Desktop/Hotel booking/frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            process_file(os.path.join(root, file))

print("Theme update v2 complete.")
