Il documento di sintesi del cammino sinodale italiano in versione navigabile con i voti della terza assemblea.

## Sviluppo

### Aggiornare il contenuto del documento

Il sito integra l'HTML del documento direttamente nella pagina per ottenere il massimo delle performance. Quando modifichi `docs/documento_sintesi.md`, devi ricostruire l'index.html:

```bash
./scripts/build_index.sh
```

Questo script:
1. Converte `documento_sintesi.md` → `documento_sintesi_content.html` (usando pandoc)
2. Ricostruisce `index.html` integrando il contenuto HTML
3. Crea automaticamente un backup (`index.html.backup`)

### Solo conversione Markdown → HTML

Se vuoi solo aggiornare il file HTML intermedio senza ricostruire l'index:

```bash
./scripts/convert_md_to_html.sh
```

**Requisiti**: `pandoc` installato sul sistema
- Ubuntu/Debian: `sudo apt-get install pandoc`
- Fedora: `sudo dnf install pandoc`
- Arch: `sudo pacman -S pandoc`

## Architettura

- Il contenuto HTML è **integrato direttamente** in `index.html` (non caricato via fetch)
- Nessuna dipendenza da librerie di rendering Markdown lato client
- JavaScript si occupa solo di: indice, grafici votazioni, smooth scrolling