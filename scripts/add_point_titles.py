#!/usr/bin/env python3
"""
Script per aggiungere titoli "Punto n" prima di ogni punto numerato nel documento di sintesi.
"""

import re
import sys

def add_point_titles(input_file, output_file):
    """
    Aggiunge titoli "Punto n" prima di ogni punto numerato nel documento markdown.
    
    Args:
        input_file: Percorso del file markdown di input
        output_file: Percorso del file markdown di output
    """
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern per trovare i punti numerati all'inizio della riga
    # Cerca pattern come "1. ", "2. ", "3. " etc all'inizio della riga
    pattern = r'^(\d+)\.\s'
    
    lines = content.split('\n')
    result_lines = []
    
    for i, line in enumerate(lines):
        match = re.match(pattern, line)
        
        if match:
            point_number = match.group(1)
            
            # Determina il livello del titolo basandosi sul contesto
            # Cerca il titolo precedente per determinare il livello appropriato
            heading_level = determine_heading_level(result_lines)
            
            # Aggiungi il titolo "Punto n"
            title = f"{'#' * heading_level} Punto {point_number}"
            
            # Aggiungi una riga vuota prima del titolo se la riga precedente non è vuota
            if i > 0 and result_lines and result_lines[-1].strip():
                result_lines.append('')
            
            result_lines.append(title)
            result_lines.append('')  # Riga vuota dopo il titolo
        
        result_lines.append(line)
    
    # Scrivi il risultato
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(result_lines))
    
    print(f"✓ File processato con successo!")
    print(f"  Input:  {input_file}")
    print(f"  Output: {output_file}")

def determine_heading_level(previous_lines):
    """
    Determina il livello appropriato del titolo basandosi sulle righe precedenti.
    
    Args:
        previous_lines: Lista delle righe precedenti
        
    Returns:
        int: Livello del titolo (numero di #)
    """
    # Cerca l'ultimo titolo nelle righe precedenti
    for line in reversed(previous_lines):
        if line.strip().startswith('#'):
            # Conta quanti # ci sono
            level = len(line) - len(line.lstrip('#'))
            # I punti numerati dovrebbero essere un livello sotto il titolo della sezione
            return min(level + 1, 6)  # Massimo 6 livelli in markdown
    
    # Default: livello 3 se non troviamo titoli precedenti
    return 3

def main():
    """Funzione principale"""
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.md', '_with_points.md')
    else:
        # File di default
        input_file = 'docs/documento_sintesi.md'
        output_file = 'docs/documento_sintesi_with_points.md'
    
    try:
        add_point_titles(input_file, output_file)
    except FileNotFoundError:
        print(f"✗ Errore: File '{input_file}' non trovato!")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Errore durante l'elaborazione: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
