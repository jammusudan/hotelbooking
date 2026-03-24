import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Accent backgrounds, borders, and text 
    # Previously, accents were #281C59 (Deep Purple). Now they are #FE81D4 (Pink).
    # Replace background colors, border colors, text accents
    content = content.replace('[#281C59]', '[#FE81D4]')
    
    # 2. Update Global Backgrounds
    # Previously, backgrounds were #EDF7BD (Yellow-Green). Now they are #FAACBF (Peach-Pink).
    content = content.replace('[#EDF7BD]', '[#FAACBF]')

    # 3. Check for Contrast / Text colors
    # Text was typically text-[#281C59] -> Now text-[#FE81D4]. Since both #FE81D4 and #FAACBF are very light,
    # text-[#FE81D4] on #FAACBF or #FE81D4 is completely unreadable.
    # Therefore, we MUST change text-[#FE81D4] to a dark readble color, or text-gray-900.
    # But wait, we just globally replaced #281C59 with #FE81D4.
    content = content.replace('text-[#FE81D4]', 'text-gray-900')
    
    # Likewise, if text was originally light text-[#EDF7BD] inside the deep purple navbars/buttons, 
    # it just became text-[#FAACBF]. Again, light-on-light is unreadable.
    # Let's change text-[#FAACBF] to text-gray-900 as well inside buttons/navbars.
    content = content.replace('text-[#FAACBF]', 'text-gray-900')
    content = content.replace('text-white', 'text-gray-900') # any remaining white text should be dark
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('c:/Users/niche/OneDrive/Desktop/Hotel booking/frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            process_file(os.path.join(root, file))

print("Theme update v3 complete.")
