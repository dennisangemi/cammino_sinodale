#!/usr/bin/env python3
import re

# Leggi il file markdown
with open('docs/documento_sintesi.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Mappa dei punti con le loro proposte
voti_map = {}
with open('js/voti-data.js', 'r', encoding='utf-8') as f:
    voti_content = f.read()
    matches = re.findall(r'punto:\s*(\d+).*?proposta:\s*"([a-z])"', voti_content, re.DOTALL)
    for punto, proposta in matches:
        punto = int(punto)
        if punto not in voti_map:
            voti_map[punto] = []
        if proposta not in voti_map[punto]:
            voti_map[punto].append(proposta)

print(f"Trovati {len(voti_map)} punti con votazioni")

new_lines = []
current_punto = None
anchor_generali_added = {
    'intero-documento': False,
    'introduzione': False,
    'prima-parte': False,
    'seconda-parte': False,
    'terza-parte': False
}

i = 0
while i < len(lines):
    line = lines[i].rstrip('\n')
    new_lines.append(line)
    
    # Anchor all'inizio (dopo il titolo principale)
    if line.startswith('# Lievito di pace e di speranza') and not anchor_generali_added['intero-documento']:
        new_lines.append('')
        new_lines.append('<div id="vote-intero-documento"></div>')
        anchor_generali_added['intero-documento'] = True
    
    # Anchor alla fine dell'Introduzione (appena prima di Parte I)
    elif line.startswith('## Parte I') and not anchor_generali_added['introduzione']:
        # Inserisci prima della riga corrente
        new_lines.pop()  # Rimuovi la riga appena aggiunta
        new_lines.append('')
        new_lines.append('<div id="vote-introduzione"></div>')
        new_lines.append('')
        new_lines.append(line)
        anchor_generali_added['introduzione'] = True
    
    # Anchor alla fine della Parte I (appena prima di Parte II)
    elif line.startswith('## Parte II') and not anchor_generali_added['prima-parte']:
        new_lines.pop()
        new_lines.append('')
        new_lines.append('<div id="vote-prima-parte"></div>')
        new_lines.append('')
        new_lines.append(line)
        anchor_generali_added['prima-parte'] = True
    
    # Anchor alla fine della Parte II (appena prima di Parte III)
    elif line.startswith('## Parte III') and not anchor_generali_added['seconda-parte']:
        new_lines.pop()
        new_lines.append('')
        new_lines.append('<div id="vote-seconda-parte"></div>')
        new_lines.append('')
        new_lines.append(line)
        anchor_generali_added['seconda-parte'] = True
    
    # Anchor alla fine della Parte III (appena prima di Appendice)
    elif line.startswith('## Appendice') and not anchor_generali_added['terza-parte']:
        new_lines.pop()
        new_lines.append('')
        new_lines.append('<div id="vote-terza-parte"></div>')
        new_lines.append('')
        new_lines.append(line)
        anchor_generali_added['terza-parte'] = True
    
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
            new_lines.append('')
            new_lines.append(f'    <div id="vote-{current_punto}{letter}"></div>')
    
    i += 1

# Scrivi il nuovo contenuto
with open('docs/documento_sintesi.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print(f"\n✓ Anchor aggiunti al file documento_sintesi.md")
print(f"✓ Anchor generali: {sum(anchor_generali_added.values())}/5")
for key, value in anchor_generali_added.items():
    print(f"  - {key}: {'✓' if value else '✗'}")
