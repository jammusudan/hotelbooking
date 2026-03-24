import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update Global Backgrounds
    # Old Background: white -> New Background: #7FB77E
    
    # We only want to target the main backgrounds we changed in v7.
    # In v7 we changed 'bg-[#85C79A]' to 'bg-white'.
    # So we change 'bg-white' back away to our new hex. But wait, we don't want to break cards. 
    # Actually, in this theme, anything that was `bg-white` was intended to be the background.
    content = content.replace('bg-white', 'bg-[#7FB77E]')
    
    # In CSS, we replaced '#85C79A' with 'white'.
    content = content.replace('background-color: white', 'background-color: #7FB77E')
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('c:/Users/niche/OneDrive/Desktop/Hotel booking/frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            process_file(os.path.join(root, file))

print("Theme update v8 complete.")
