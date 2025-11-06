#!/bin/bash

# Script per convertire il documento Markdown in HTML
# Uso: ./scripts/convert_md_to_html.sh

# Percorsi dei file
MD_FILE="docs/documento_sintesi.md"
HTML_FILE="docs/documento_sintesi_content.html"

# Verifica se pandoc è installato
if ! command -v pandoc &> /dev/null; then
    echo "❌ Errore: pandoc non è installato."
    echo "Installa con: sudo apt-get install pandoc"
    exit 1
fi

# Verifica se il file Markdown esiste
if [ ! -f "$MD_FILE" ]; then
    echo "❌ Errore: file $MD_FILE non trovato."
    exit 1
fi

# Converti Markdown in HTML (solo contenuto, senza documento standalone)
echo "🔄 Conversione di $MD_FILE in $HTML_FILE..."
pandoc "$MD_FILE" -o "$HTML_FILE" --no-highlight

# Verifica il risultato
if [ $? -eq 0 ]; then
    echo "✅ Conversione completata con successo!"
    echo "📊 Dimensioni file:"
    echo "   Markdown: $(du -h "$MD_FILE" | cut -f1)"
    echo "   HTML: $(du -h "$HTML_FILE" | cut -f1)"
else
    echo "❌ Errore durante la conversione."
    exit 1
fi
