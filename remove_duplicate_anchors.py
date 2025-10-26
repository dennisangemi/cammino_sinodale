#!/usr/bin/env python3
import re

# Leggi il file markdown
with open('docs/documento_sintesi.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Trova tutti gli anchor duplicati
lines = content.split('\n')
new_lines = []
seen_anchors = set()
duplicates_removed = 0

for line in lines:
    # Verifica se la riga è un anchor
    anchor_match = re.match(r'^\s*<div id="(vote-[^"]+)"></div>\s*$', line)
    
    if anchor_match:
        anchor_id = anchor_match.group(1)
        
        # Se abbiamo già visto questo anchor, non lo aggiungiamo
        if anchor_id in seen_anchors:
            duplicates_removed += 1
            print(f"Rimosso duplicato: {anchor_id}")
            continue
        else:
            seen_anchors.add(anchor_id)
            new_lines.append(line)
    else:
        new_lines.append(line)

# Scrivi il file pulito
output_content = '\n'.join(new_lines)

with open('docs/documento_sintesi.md', 'w', encoding='utf-8') as f:
    f.write(output_content)

print(f"\n✓ Rimossi {duplicates_removed} anchor duplicati")
print(f"✓ Anchor unici conservati: {len(seen_anchors)}")
