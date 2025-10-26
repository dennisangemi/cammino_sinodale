#!/usr/bin/env python3
import re

# Leggi il file markdown
with open('docs/documento_sintesi.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Mappa dei punti con le loro proposte (basato sui dati di votazione)
voti_map = {}
with open('js/voti-data.js', 'r', encoding='utf-8') as f:
    voti_content = f.read()
    # Estrai tutti i punti e proposte
    matches = re.findall(r'punto:\s*(\d+).*?proposta:\s*"([a-z])"', voti_content, re.DOTALL)
    for punto, proposta in matches:
        punto = int(punto)
        if punto not in voti_map:
            voti_map[punto] = []
        if proposta not in voti_map[punto]:
            voti_map[punto].append(proposta)

print(f"Trovati {len(voti_map)} punti con votazioni")
for punto in sorted(voti_map.keys()):
    print(f"  Punto {punto}: proposte {', '.join(voti_map[punto])}")

lines = content.split('\n')
new_lines = []
current_punto = None

for i, line in enumerate(lines):
    new_lines.append(line)
    
    # Aggiungi anchor all'inizio del documento (dopo il titolo principale)
    if line.startswith('# Lievito di pace e di speranza'):
        new_lines.append('')
        new_lines.append('<div id="vote-intero-documento"></div>')
    
    # Aggiungi anchor alla fine dell'Introduzione (prima di Parte I)
    if line.startswith('## Parte I'):
        new_lines.insert(-1, '')
        new_lines.insert(-1, '<div id="vote-introduzione"></div>')
        new_lines.insert(-1, '')
    
    # Aggiungi anchor alla fine della Parte I (prima di Parte II)
    if line.startswith('## Parte II'):
        new_lines.insert(-1, '')
        new_lines.insert(-1, '<div id="vote-prima-parte"></div>')
        new_lines.insert(-1, '')
    
    # Aggiungi anchor alla fine della Parte II (prima di Parte III)
    if line.startswith('## Parte III'):
        new_lines.insert(-1, '')
        new_lines.insert(-1, '<div id="vote-seconda-parte"></div>')
        new_lines.insert(-1, '')
    
    # Aggiungi anchor alla fine della Parte III (prima di Appendice)
    if line.startswith('## Appendice'):
        new_lines.insert(-1, '')
        new_lines.insert(-1, '<div id="vote-terza-parte"></div>')
        new_lines.insert(-1, '')
    
    # Identifica il numero del punto corrente
    punto_match = re.match(r'^(\d+)\.\s', line.strip())
    if punto_match:
        current_punto = int(punto_match.group(1))
    
    # Identifica le proposte (linee che iniziano con spazi + lettera + punto)
    proposta_match = re.match(r'^(\s+)([a-z])\.\s+(.+)$', line)
    
    if proposta_match and current_punto and current_punto in voti_map:
        letter = proposta_match.group(2)
        
        # Verifica che questa lettera sia nelle votazioni per questo punto
        if letter in voti_map[current_punto]:
            # Aggiungi riga vuota e anchor
            new_lines.append('')
            new_lines.append(f'    <div id="vote-{current_punto}{letter}"></div>')

# Scrivi il nuovo contenuto
output_content = '\n'.join(new_lines)

with open('docs/documento_sintesi.md', 'w', encoding='utf-8') as f:
    f.write(output_content)

print(f"\n✓ Anchor aggiunti al file documento_sintesi.md")
print(f"✓ Anchor generali aggiunti per le votazioni delle sezioni principali")
