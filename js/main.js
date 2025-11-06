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
            
            // Cerca liste ordinate di tipo "1" (numerate)
            if (nextElement.tagName === 'OL' && nextElement.getAttribute('type') === '1') {
                const startValue = parseInt(nextElement.getAttribute('start')) || 1;
                const listItems = nextElement.querySelectorAll(':scope > li');
                
                listItems.forEach((item, index) => {
                    const puntoNumero = startValue + index;
                    
                    // Evita duplicati
                    if (!foundPunti.includes(puntoNumero)) {
                        foundPunti.push(puntoNumero);
                        
                        // Crea un ID per questo elemento se non esiste
                        const itemId = `punto-${puntoNumero}`;
                        if (!item.id) {
                            item.id = itemId;
                        }
                        
                        // Aggiungi all'indice
                        const tocLevel = level === 'h2' ? 'toc-h3' : level === 'h3' ? 'toc-h4' : 'toc-h5';
                        const liPunto = document.createElement('li');
                        liPunto.className = `${tocLevel} toc-list-item`;
                        const aPunto = document.createElement('a');
                        aPunto.href = `#${itemId}`;
                        aPunto.textContent = `Punto ${puntoNumero}`;
                        liPunto.appendChild(aPunto);
                        ul.appendChild(liPunto);
                    }
                });
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
    const orderedLists = content.querySelectorAll('ol[type="1"]');
    
    orderedLists.forEach(ol => {
        // Ottieni il valore iniziale dalla lista (attributo start)
        const startValue = parseInt(ol.getAttribute('start')) || 1;
        const listItems = ol.querySelectorAll(':scope > li');
        
        listItems.forEach((item, index) => {
            // Calcola il numero effettivo del punto
            const puntoNumero = startValue + index;
            const id = `punto-${puntoNumero}`;
            
            // Assegna l'ID solo se non esiste già
            if (!item.id) {
                item.id = id;
            }
            
            // Aggiungi il link anchor
            addAnchorLink(item, id);
        });
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
            
            const percentFavorevoli = (voto.favorevoli / voto.votanti * 100).toFixed(1);
            const percentContrari = (voto.non_favorevoli / voto.votanti * 100).toFixed(1);
            
            voteInfo.innerHTML = `
                <div class="vote-info-item">
                    <span class="vote-label">Votanti:</span>
                    <span class="vote-value">${voto.votanti}</span>
                </div>
                <div class="vote-info-item favorevoli">
                    <span class="vote-label">Favorevoli:</span>
                    <span class="vote-value">${voto.favorevoli} <span class="vote-label">(${percentFavorevoli}%)</span></span>
                </div>
                <div class="vote-info-item contrari">
                    <span class="vote-label">Contrari:</span>
                    <span class="vote-value">${voto.non_favorevoli} <span class="vote-label">(${percentContrari}%)</span></span>
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
            
            // Info votazioni (compatte)
            const voteInfo = document.createElement('div');
            voteInfo.className = 'vote-info';
            
            const percentFavorevoli = (voto.favorevoli / voto.votanti * 100).toFixed(1);
            const percentContrari = (voto.non_favorevoli / voto.votanti * 100).toFixed(1);
            
            voteInfo.innerHTML = `
                <div class="vote-info-item">
                    <span class="vote-label">Votanti:</span>
                    <span class="vote-value">${voto.votanti}</span>
                </div>
                <div class="vote-info-item favorevoli">
                    <span class="vote-label">Favorevoli:</span>
                    <span class="vote-value">${voto.favorevoli} <span class="vote-label">(${percentFavorevoli}%)</span></span>
                </div>
                <div class="vote-info-item contrari">
                    <span class="vote-label">Contrari:</span>
                    <span class="vote-value">${voto.non_favorevoli} <span class="vote-label">(${percentContrari}%)</span></span>
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

// Aggiungi smooth scrolling ottimizzato
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                scrollToElement(target);
            }
        });
    });
}

// Funzione centralizzata per lo scroll ottimizzato
function scrollToElement(element) {
    // Calcola l'offset necessario per l'header fisso
    const headerHeight = document.getElementById('navbar')?.offsetHeight || 60;
    const offset = headerHeight + 20;
    
    // Posizione target
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    const currentPosition = window.pageYOffset;
    const distance = Math.abs(offsetPosition - currentPosition);
    
    // Scroll istantaneo per distanze brevi, smooth per lunghe
    // Se la distanza è minore di 800px, usa scroll istantaneo
    const behavior = distance < 800 ? 'auto' : 'smooth';
    
    window.scrollTo({
        top: offsetPosition,
        behavior: behavior
    });
    
    // Evidenzia brevemente l'elemento solo per scroll smooth
    if (behavior === 'smooth') {
        setTimeout(() => {
            element.classList.add('highlight-target');
            setTimeout(() => {
                element.classList.remove('highlight-target');
            }, 1500);
        }, 300);
    } else {
        // Per scroll istantaneo, evidenzia subito
        element.classList.add('highlight-target');
        setTimeout(() => {
            element.classList.remove('highlight-target');
        }, 1500);
    }
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
        const targetId = hash.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Usa un piccolo delay per permettere il caricamento completo della pagina
            setTimeout(() => {
                scrollToElement(targetElement);
            }, 100);
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
            scrollToElement(targetElement);
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
