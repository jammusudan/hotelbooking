import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update Global Backgrounds
    # Old Background: #ACBAC4 -> New Background: #85C79A
    content = content.replace('[#ACBAC4]', '[#85C79A]')
    content = content.replace('#ACBAC4', '#85C79A')  # for CSS
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('c:/Users/niche/OneDrive/Desktop/Hotel booking/frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            process_file(os.path.join(root, file))

print("Theme update v6 complete.")
