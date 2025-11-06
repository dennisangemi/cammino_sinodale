// Inizializza il documento (il contenuto HTML è già presente nella pagina)
function loadMarkdown() {
    // Usa requestAnimationFrame per distribuire il carico di lavoro
    requestAnimationFrame(() => {
        // Genera l'indice
        generateTOC();
        
        // Aggiungi smooth scrolling ai link dell'indice
        addSmoothScrolling();
        
        // Aggiungi listener per chiudere TOC su mobile
        addTocCloseBehavior();
        
        // Inserisci i grafici in modo asincrono
        requestAnimationFrame(() => {
            insertVoteCharts();
            insertGeneralVoteCharts();
            
            // Gestisci l'anchor nella URL dopo che tutto è renderizzato
            setTimeout(() => {
                handleUrlAnchor();
            }, 100);
        });
    });
}

// Genera l'indice automaticamente
function generateTOC() {
    const content = document.getElementById('markdown-content');
    const headings = content.querySelectorAll('h2, h3, h4');
    const tocContent = document.getElementById('toc-content');
    
    // Usa DocumentFragment per migliorare le prestazioni
    const fragment = document.createDocumentFragment();
    const ul = document.createElement('ul');
    
    headings.forEach((heading, index) => {
        const id = `section-${index}`;
        heading.id = id;
        
        // Aggiungi il link anchor per copiare
        addAnchorLink(heading, id);
        
        const level = heading.tagName.toLowerCase();
        const text = heading.textContent;
        
        const li = document.createElement('li');
        li.className = `toc-${level}`;
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = text;
        li.appendChild(a);
        ul.appendChild(li);
        
        // Cerca paragrafi numerati subito dopo questo heading
        let nextElement = heading.nextElementSibling;
        let foundPunti = [];
        
        // Scorri i prossimi elementi fino al prossimo heading
        while (nextElement) {
            // Se troviamo un altro heading, ci fermiamo
            if (nextElement.tagName && nextElement.tagName.match(/^H[2-4]$/)) {
                break;
            }
            
            // Cerca paragrafi che iniziano con un numero seguito da un punto
            if (nextElement.tagName === 'P') {
                const text = nextElement.textContent.trim();
                const puntoMatch = text.match(/^(\d+)\.\s/);
                if (puntoMatch) {
                    const puntoNumero = puntoMatch[1];
                    
                    // Evita duplicati
                    if (!foundPunti.includes(puntoNumero)) {
                        foundPunti.push(puntoNumero);
                        
                        // Crea un ID per questo paragrafo se non esiste
                        if (!nextElement.id) {
                            nextElement.id = `punto-${puntoNumero}`;
                        }
                        
                        // Aggiungi all'indice
                        const tocLevel = level === 'h2' ? 'toc-h3' : level === 'h3' ? 'toc-h4' : 'toc-h5';
                        const liPunto = document.createElement('li');
                        liPunto.className = `${tocLevel} toc-list-item`;
                        const aPunto = document.createElement('a');
                        aPunto.href = `#${nextElement.id}`;
                        aPunto.textContent = `Punto ${puntoNumero}`;
                        liPunto.appendChild(aPunto);
                        ul.appendChild(liPunto);
                    }
                }
            }
            
            nextElement = nextElement.nextElementSibling;
        }
    });
    
    fragment.appendChild(ul);
    tocContent.innerHTML = '';
    tocContent.appendChild(fragment);
    
    // Aggiungi anchor link anche agli elementi delle liste numerate
    addListItemAnchors();
}

// Aggiungi link anchor agli elementi delle liste numerate
function addListItemAnchors() {
    const content = document.getElementById('markdown-content');
    const listItems = content.querySelectorAll('ol > li');
    
    listItems.forEach((item, index) => {
        // Genera un ID unico basato sul contenuto o posizione
        const id = `punto-${index + 1}`;
        item.id = id;
        
        // Aggiungi il link anchor
        addAnchorLink(item, id);
    });
}

// Aggiungi link anchor ai titoli e agli elementi delle liste
function addAnchorLink(element, id) {
    const anchor = document.createElement('a');
    anchor.className = 'anchor-link';
    anchor.href = `#${id}`;
    anchor.setAttribute('aria-label', 'Copia link');
    anchor.title = 'Clicca per copiare il link';
    
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const url = window.location.origin + window.location.pathname + '#' + id;
        
        // Copia negli appunti
        navigator.clipboard.writeText(url).then(() => {
            // Feedback visivo
            anchor.classList.add('anchor-copied');
            
            // Mostra tooltip temporaneo
            const originalTitle = anchor.title;
            anchor.title = 'Link copiato!';
            
            setTimeout(() => {
                anchor.classList.remove('anchor-copied');
                anchor.title = originalTitle;
            }, 2000);
        }).catch(err => {
            console.error('Errore nella copia:', err);
            // Fallback per browser più vecchi
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                anchor.classList.add('anchor-copied');
                anchor.title = 'Link copiato!';
                setTimeout(() => {
                    anchor.classList.remove('anchor-copied');
                    anchor.title = originalTitle;
                }, 2000);
            } catch (err) {
                console.error('Errore nel fallback copia:', err);
            }
            document.body.removeChild(textArea);
        });
    });
    
    // Aggiungi l'anchor alla fine dell'elemento
    element.appendChild(anchor);
}

// Inserisce i grafici delle votazioni generali
function insertGeneralVoteCharts() {
    const content = document.getElementById('markdown-content');
    
    // Per ogni votazione generale, cerca il div anchor corrispondente e inserisci il grafico
    votiGenerali.forEach(voto => {
        const anchorId = `vote-${voto.sezione}`;
        const anchor = content.querySelector(`#${anchorId}`);
        
        if (anchor) {
            // Crea il container del grafico
            const chartContainer = document.createElement('div');
            chartContainer.className = 'vote-chart-container general-vote';
            chartContainer.style.marginTop = '2rem';
            chartContainer.style.marginBottom = '2rem';
            chartContainer.style.borderColor = 'var(--primary-color)';
            chartContainer.style.borderWidth = '2px';
            
            // Info votazioni
            const voteInfo = document.createElement('div');
            voteInfo.className = 'vote-info';
            voteInfo.style.paddingBottom = '0.75rem';
            voteInfo.innerHTML = `
                <div class="vote-info-item">
                    <span class="vote-label">Votanti:</span>
                    <span class="vote-value">${voto.votanti}</span>
                </div>
                <div class="vote-info-item favorevoli">
                    <span class="vote-label">Favorevoli:</span>
                    <span class="vote-value">${voto.favorevoli}</span>
                </div>
                <div class="vote-info-item contrari">
                    <span class="vote-label">Contrari:</span>
                    <span class="vote-value">${voto.non_favorevoli}</span>
                </div>
            `;
            
            // Crea grafico CSS invece di Chart.js
            const chartWrapper = document.createElement('div');
            chartWrapper.className = 'chart-wrapper-css';
            chartWrapper.innerHTML = createSimpleBarChart(voto);
            
            chartContainer.appendChild(voteInfo);
            chartContainer.appendChild(chartWrapper);
            
            // Inserisci il grafico subito dopo l'anchor
            anchor.parentNode.insertBefore(chartContainer, anchor.nextSibling);
        }
    });
}

// Inserisce i grafici delle votazioni
function insertVoteCharts() {
    const content = document.getElementById('markdown-content');
    
    // Per ogni votazione, cerca il div anchor corrispondente e inserisci il grafico
    votiData.forEach(voto => {
        const anchorId = `vote-${voto.punto}${voto.proposta}`;
        const anchor = content.querySelector(`#${anchorId}`);
        
        if (anchor) {
            // Crea il container del grafico
            const chartContainer = document.createElement('div');
            chartContainer.className = 'vote-chart-container';
            
            // Aggiungi tag se presente
            let tagHtml = '';
            if (voto.tag) {
                const tagClass = voto.tag === 'molto controverso' ? 'tag-molto-controverso' : 'tag-mediamente-controverso';
                tagHtml = `<span class="vote-tag ${tagClass}">${voto.tag}</span>`;
            }
            
            // Info votazioni (compatte)
            const voteInfo = document.createElement('div');
            voteInfo.className = 'vote-info';
            voteInfo.innerHTML = `
                ${tagHtml}
                <div class="vote-info-item">
                    <span class="vote-label">Votanti:</span>
                    <span class="vote-value">${voto.votanti}</span>
                </div>
                <div class="vote-info-item favorevoli">
                    <span class="vote-label">Favorevoli:</span>
                    <span class="vote-value">${voto.favorevoli}</span>
                </div>
                <div class="vote-info-item contrari">
                    <span class="vote-label">Contrari:</span>
                    <span class="vote-value">${voto.non_favorevoli}</span>
                </div>
            `;
            
            // Crea grafico CSS invece di Chart.js
            const chartWrapper = document.createElement('div');
            chartWrapper.className = 'chart-wrapper-css';
            chartWrapper.innerHTML = createSimpleBarChart(voto);
            
            chartContainer.appendChild(voteInfo);
            chartContainer.appendChild(chartWrapper);
            
            // Inserisci il grafico subito dopo l'anchor
            anchor.parentNode.insertBefore(chartContainer, anchor.nextSibling);
        }
    });
}

// Crea un grafico a barre semplice in HTML/CSS (molto più veloce di Chart.js)
function createSimpleBarChart(voto) {
    const percentFavorevoli = (voto.favorevoli / voto.votanti * 100).toFixed(1);
    const percentContrari = (voto.non_favorevoli / voto.votanti * 100).toFixed(1);
    
    return `
        <div class="simple-bar-chart">
            <div class="bar-segment favorevoli" 
                 style="width: ${percentFavorevoli}%"
                 title="Favorevoli: ${voto.favorevoli} (${percentFavorevoli}%)">
            </div>
            <div class="bar-segment contrari" 
                 style="width: ${percentContrari}%"
                 title="Contrari: ${voto.non_favorevoli} (${percentContrari}%)">
            </div>
        </div>
    `;
}

// Aggiungi smooth scrolling
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Aggiungi comportamento di chiusura TOC su mobile
function addTocCloseBehavior() {
    // Seleziona tutti i link nel TOC
    const tocLinks = document.querySelectorAll('#toc a[href^="#"]');
    
    tocLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Chiudi il TOC solo su schermi piccoli (mobile/tablet)
            if (window.innerWidth <= 1024) {
                setTimeout(() => {
                    const toc = document.getElementById('toc');
                    const main = document.getElementById('content');
                    const footer = document.querySelector('footer');
                    
                    if (toc && toc.classList.contains('visible')) {
                        toc.classList.remove('visible');
                        toc.classList.add('hidden');
                        main.classList.add('full-width');
                        footer.classList.add('full-width');
                    }
                }, 300); // Piccolo delay per permettere lo scroll
            }
        });
    });
}

// Gestisci l'anchor nella URL (es: #section-3 o #punto-24)
function handleUrlAnchor() {
    const hash = window.location.hash;
    
    if (hash) {
        // Rimuovi il # dall'hash
        const targetId = hash.substring(1);
        console.log('Tentativo di scroll a:', targetId);
        
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            console.log('Elemento trovato:', targetId);
            
            // Prova prima con scrollIntoView normale
            try {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Backup: scroll diretto dopo un piccolo delay
                setTimeout(() => {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100, // 100px di offset per l'header fisso
                        behavior: 'smooth'
                    });
                }, 100);
            } catch (e) {
                console.error('Errore nello scroll:', e);
                // Fallback: scroll senza smooth
                window.scrollTo(0, targetElement.offsetTop - 100);
            }
        } else {
            console.warn('Elemento non trovato:', targetId);
            console.log('Elementi disponibili con ID:', Array.from(document.querySelectorAll('[id]')).map(el => el.id).slice(0, 20));
        }
    }
}

// Gestisci anche i cambiamenti di hash durante la navigazione
window.addEventListener('hashchange', function() {
    const hash = window.location.hash;
    
    if (hash) {
        const targetId = hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Toggle per il menu TOC
document.getElementById('toggle-toc').addEventListener('click', function() {
    const toc = document.getElementById('toc');
    const main = document.getElementById('content');
    const footer = document.querySelector('footer');
    
    toc.classList.toggle('hidden');
    toc.classList.toggle('visible');
    
    if (toc.classList.contains('hidden')) {
        main.classList.add('full-width');
        footer.classList.add('full-width');
    } else {
        main.classList.remove('full-width');
        footer.classList.remove('full-width');
    }
});

// Carica il documento all'avvio
document.addEventListener('DOMContentLoaded', loadMarkdown);

// Gestisci il ridimensionamento della finestra
window.addEventListener('resize', function() {
    if (window.innerWidth <= 1024) {
        const toc = document.getElementById('toc');
        const main = document.getElementById('content');
        const footer = document.querySelector('footer');
        
        if (!toc.classList.contains('visible')) {
            toc.classList.add('hidden');
            main.classList.add('full-width');
            footer.classList.add('full-width');
        }
    }
});
