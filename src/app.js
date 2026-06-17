const HERO = "/media/images/heroes/hero_the_movement.png";
const HEROES = {
  presence: "/media/images/heroes/hero_presence.png",
  worship: "/media/images/heroes/hero_worship_night.png",
  generation: "/media/images/heroes/hero_generation.png",
  city: "/media/images/heroes/hero_light_in_the_city.png",
};
const HERO_SEQUENCE = [HERO, HEROES.presence, HEROES.worship, HEROES.generation, HEROES.city];

// Dynamic content loaded from archived Wix pages (fallbacks provided)
let HERO_TITLE = "Il Movimento\nSenza Misura";
let HERO_LEDE = "Decenni di adorazione, predicazioni, missioni e formazione. Materiale liberamente condiviso — migliaia di download, centinaia di sermoni, decine di missioni documentate. Questa è la loro casa digitale, ora curata e accessibile.";

let imageMapping = {}; // Wix remote URL → local path mapping

const state = {
  media: [],
  query: "",
  category: "all",
  status: "all",
  collection: "local-audio",
  visibleCount: 12,
  playing: null,
  filters: { year: "all", category: "all" },
  queue: [],
  currentIndex: -1,
};

const sections = [
  ["who", "Chi siamo"],
  ["vision", "Visione"],
  ["mission", "Missione"],
  ["story", "Storia"],
  ["leadership", "Guida"],
  ["ministries", "Ministeri"],
  ["media", "Archivio"],
  ["events", "Eventi"],
  ["donations", "Dona"],
];

const ministries = [
  ["01", "Giubileo", "Comunità a Catania e Palermo: adorazione, famiglia, scuola biblica e intercessione."],
  ["02", "Network Italia", "Una rete di comunità che condivide risorse, connessione e moltiplicazione."],
  ["03", "CuoreAfrica", "Missioni documentate dal 2008 al 2026: presenza, servizio e continuità."],
  ["04", "iChurch", "Formazione biblica sistematica: Spirito Santo, Regno, Beatitudini, Intercessione."],
  ["05", "Adorazione", "Decenni di musica, adorazione spontanea, album e canti diffusi gratuitamente."],
  ["06", "Memoria multimediale", "Archivio storico di predicazioni, audio, video, PDF e testimonianze digitali."],
];

const timeline = [
  ["1996", "Prime produzioni musicali preservate: Apri i miei occhi."],
  ["2006", "Il passo di fede: tutto il materiale viene messo a disposizione gratuitamente."],
  ["2008", "Inizia la memoria missionaria CuoreAfrica, con archivi fotografici continuativi."],
  ["2014", "Nasce l'ecosistema iChurch: corsi, predicazioni e formazione audio/video."],
  ["2018", "La produzione worship entra in una fase video/streaming con playlist complete."],
  ["2026", "Senza Misura Reborn preserva l'eredità e la porta in una piattaforma globale."],
];

const testimonials = [
  ["Una parola", "Niente potrà mai sostituire la potenza di una sola Parola che esce dalla Sua bocca."],
  ["Una famiglia", "Dove Gesù Cristo è il Signore e la Chiesa una famiglia."],
  ["Una semina", "Scaricate e diffondete: la decisione di seminare ha raggiunto migliaia di persone."],
];

const resourceCards = [
  ["Mappa dei contenuti", "Inventario completo generato dalla preservazione digitale.", "/content-map.md"],
  ["Inventario media", "Metadati tecnici per ogni risorsa indicizzata.", "/data/media-inventory.json"],
  ["Archivio ricercabile", "File dati usato dall’Archivio Media intelligente.", "/data/media-library.json"],
  ["Legacy: Download","Pagina di download storica contenente link a predicazioni, musica e risorse.", "http://www.senzamisura.org/senza_misura/Download.html"],
  ["Legacy: Wix Home","Sito Wix storico con pagine ministeriali (Giubileo, CuoreAfrica, Musica).", "https://adoratore.wixsite.com/senzamisura"]
];

const blogPosts = [
  ["Perché Senza Misura?", "Il nome nasce da una visione: la Grazia che non viene data con misura."],
  ["Il valore della memoria", "Ogni predicazione, canto e documento è un frammento di storia spirituale da preservare."],
  ["Dal locale al globale", "Catania, Palermo, Network Italia, CuoreAfrica: una presenza con respiro più ampio."],
];

const legacyHighlights = [
  ["Radice del nome", "“Perchè colui che Dio ha mandato, proferisce le parole di Dio, perchè Dio non dà lo Spirito con misura”.", "Dal dominio storico senzamisura.org"],
  ["Benvenuto originale", "“Il nostro desiderio è che visitando questo sito e gustandone il contenuto, tu possa sperimentare la sovrabbondante Grazia di Dio che è in Cristo Gesù il nostro Signore”.", "Dalla home Wix"],
  ["Una sola Parola", "“Niente potrà mai sostituire la potenza di una sola Parola che esce dalla Sua bocca”.", "Dalla home Wix"],
  ["La famiglia", "“Dove Gesù Cristo è il Signore e la Chiesa una famiglia”.", "Dalla pagina Giubileo"],
];

const realPillars = [
  ["Musica", "Nel settembre 2006 Corrado Salmé scrive di aver ricevuto dal Signore la direzione di mettere gratuitamente a disposizione canti, prediche, insegnamenti, libri e tutto il resto."],
  ["Oltre 80.000 download", "Dopo la pubblicazione dei canti, il sito registrò nel primo mese più di 80.000 download da tutto il mondo."],
  ["Network Italia", "Uno strumento nato per servire le persone, condividendo risorse e promuovendo connessione e interscambi tra comunità."],
  ["Giubileo", "Preghiera di intercessione per l’opera Giubileo, per la città, per la regione, per la nazione e per tutte le autorità."],
  ["CuoreAfrica", "Archivio missionario reale con viaggi documentati da Ottobre 2008 ad Aprile 2026."],
  ["iChurch", "Corsi storici con Corrado Salmé: Spirito Santo, Intercessione, Identità-Eredità-Autorità, Beatitudini, Evangelizzazione, Regno di Dio."],
];

const missionYears = ["Ottobre 2008", "Febbraio 2009", "Giugno 2009", "Ottobre 2010", "Marzo 2011", "Dicembre 2013", "Gennaio 2014", "Settembre 2014", "Maggio 2015", "Dicembre 2017", "Febbraio 2023", "Febbraio 2024", "Febbraio 2025", "Dicembre 2025", "Aprile 2026"];

const courseCollections = [
  ["Conoscere lo Spirito Santo", "2014–2015 · 10 parti"],
  ["Corso di Addestramento per Intercessori", "2015 · 3 parti"],
  ["Identità, Eredità, Autorità", "2017 · 23 parti"],
  ["Le Beatitudini", "2017–2018 · 10 parti"],
  ["Evangelizzare con successo", "2018 · 11 parti"],
  ["Il Regno di Dio", "2018 · 14 parti"],
  ["I segni che accompagnano coloro che credono", "2019–2020 · 7 parti"],
];

const albumExamples = [
  ["Apri i miei occhi", "1996"],
  ["Quanti miracoli", "1999"],
  ["I giovani avranno visioni", "2000"],
  ["Infuocati per Dio", "2003"],
  ["Infuocati per Dio", "2004"],
  ["Infuocati per Dio", "2019"],
];

const REAL = {
  corrado: "/media/images/real/WhatsApp.jpeg",
  gruppo: "/media/images/real/Gruppo che si abbraccia insieme.jpg",
  adorazione: "/media/images/real/Mani alzate interrogative.jpg",
  logo: "/media/images/real/Logo_verticale.png",
  logoPsd: "/media/images/real/Logo_PSD.png",
  copertina2019: "/media/images/real/Copertina CD IxD2019 Fronte.jpg",
  copertina2018: "/media/images/real/Copertina CD IxD2018_02.jpg",
  copertina: "/media/images/real/Copertina.jpg",
  quantiMiracoli: "/media/images/real/Quanti_miracoli.png",
  locandina2015: "/media/images/real/Locandina IxD2015 _ sito.jpg",
  ixD2003: "/media/images/real/IxD2003.jpg",
  ixD2004: "/media/images/real/IxD2004.jpg",
  ixD2005: "/media/images/real/IxD2005.jpg",
  ixD2006: "/media/images/real/IxD2006.jpg",
  ixD2008: "/media/images/real/IxD2008.jpg",
  ixD2013: "/media/images/real/IxD2013.jpg",
  shapeimage: "/media/images/real/shapeimage_5.png",
  humanResources: "/media/images/real/Human-Resources-square.jpg",
};

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else node.setAttribute(key, value);
  });
  children.forEach((child) => node.append(child));
  return node;
}

function template(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function formatNumber(value) {
  return new Intl.NumberFormat("it-IT").format(value);
}

function localMedia(item) {
  return item.localPath && item.localPath.startsWith("/media/");
}

function localAudio(item) {
  return item.category === "audio" && localMedia(item);
}

function mediaStats() {
  const counts = state.media.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  return {
    total: state.media.length,
    audio: counts.audio || 0,
    video: (counts.video || 0) + (counts["external-video"] || 0),
    downloads: counts.downloads || 0,
    local: state.media.filter(localMedia).length,
  };
}

function nav() {
  return template(`
    <header class="nav" aria-label="Navigazione principale">
      <div style="display:flex;align-items:center;gap:1rem;">
        <button id="navToggle" class="nav-toggle" aria-label="Apri menu">☰</button>
        <a class="brand" href="#top" aria-label="Pagina iniziale Senza Misura Reborn"><span class="brand-mark"></span><span>Senza Misura</span></a>
      </div>
      <div class="nav-search-wrapper">
        <input id="globalSearch" class="search nav-search" type="search" placeholder="Cerca nell'archivio: Grazia, Regno, Intercessione..." aria-label="Ricerca globale" />
      </div>
      <nav class="nav-links">${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join("")}</nav>
      <a class="nav-cta" href="#media">Esplora l’archivio</a>
    </header>
  `);
}

function hero() {
  return template(`
    <section id="top" class="hero">
      <div class="hero-media"><img src="${HERO}" alt="Movimento Senza Misura" /></div>
      <div class="hero-content reveal">
        <p class="eyebrow">Piattaforma di memoria viva</p>
        <h1>${HERO_TITLE.split('\n').join('<br/>')}</h1>
        <p class="hero-lede">${HERO_LEDE}</p>
        <div class="hero-actions">
          <a class="btn primary" href="#media">Entra nell’Archivio Media</a>
          <a class="btn" href="#story">Scopri la storia</a>
        </div>
      </div>
    </section>
  `);
}


function heroSequenceSection() {
  return template(`
    <section class="hero-sequence" aria-label="Sequenza visiva Senza Misura">
      ${HERO_SEQUENCE.map((src, index) => `
        <article class="sequence-panel reveal">
          <img src="${src}" alt="Immagine narrativa Senza Misura ${index + 1}" loading="${index === 0 ? "eager" : "lazy"}" />
          <div>
            <span class="card-index">${String(index + 1).padStart(2, "0")}</span>
            <h2>${["Il movimento", "La presenza", "L’adorazione", "La generazione", "La luce nella città"][index]}</h2>
          </div>
        </article>
      `).join("")}
    </section>
  `);
}

function statsSection() {
  const s = mediaStats();
  return template(`
    <section id="who" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Chi siamo</p>
        <h2 class="section-title">Non un sito. Una memoria viva.</h2>
        <p class="section-copy">Senza Misura Reborn nasce per preservare ciò che non può andare perduto: audio storici, insegnamenti, adorazione, documenti, missioni e una visione di Grazia sovrabbondante.</p>
      </div>
      <div class="stats">
        <div class="stat-card"><span class="stat-number">${formatNumber(s.total)}</span><span class="stat-label">elementi media indicizzati</span></div>
        <div class="stat-card"><span class="stat-number">${formatNumber(s.audio)}</span><span class="stat-label">audio e predicazioni</span></div>
        <div class="stat-card"><span class="stat-number">${formatNumber(s.video)}</span><span class="stat-label">video e riferimenti</span></div>
        <div class="stat-card"><span class="stat-number">${formatNumber(s.local)}</span><span class="stat-label">file locali migrati</span></div>
      </div>
    </section>
  `);
}

function visionMissionSection() {
  return template(`
    <section class="section reveal">
      <div class="split-feature">
        <article id="vision" class="editorial-panel">
          <p class="eyebrow">Visione</p>
          <h2>La benedizione Senza Misura resa accessibile.</h2>
          <p>Una piattaforma dove ogni persona può scoprire, ascoltare, studiare e incontrare una memoria viva: la Parola, la Presenza, l'adorazione e una comunità che continua a seminare.</p>
        </article>
        <article id="mission" class="editorial-panel warm">
          <p class="eyebrow">Missione</p>
          <h2>Preservare tutto. Elevare tutto. Perdere niente.</h2>
          <p>Ogni contenuto storico viene migrato, indicizzato e trasformato in esperienza: audio, video, PDF, missioni, corsi, testimonianze e archivi storici.</p>
        </article>
      </div>
    </section>
  `);
}

function storySection() {
  return template(`
    <section id="story" class="section reveal">
      <div class="story-grid">
        <article class="story-card">
          <img src="${REAL.humanResources}" alt="Comunità Senza Misura" />
          <div class="story-card-content">
            <p class="eyebrow">La nostra storia</p>
            <h2 class="story-title">Gratuitamente avete ricevuto.</h2>
            <p>Nel 2006 la visione prende forma: mettere a disposizione gratuitamente canti, prediche, insegnamenti e risorse. Una semina digitale che ha raggiunto migliaia di vite.</p>
          </div>
        </article>
        <article class="story-card">
          <img src="${REAL.gruppo}" alt="Gruppo Senza Misura" />
          <div class="story-card-content">
            <p class="eyebrow">Impatto</p>
            <h2 class="story-title">Una luce nella città.</h2>
            <p>Catania, Palermo, Italia, Africa: locale e globale si incontrano in un'unica chiamata.</p>
          </div>
        </article>
      </div>
    </section>
  `);
}

function ministriesSection() {
  return template(`
    <section id="ministries" class="section reveal" style="--section-bg-image: url('${REAL.corrado}')">
      <div class="section-header">
        <p class="eyebrow">Ministeri</p>
        <h2 class="section-title">Un ecosistema, non una brochure.</h2>
        <p class="section-copy">Comunità locale, network nazionale, missione internazionale, formazione online e archivio worship convergono in una piattaforma unica.</p>
      </div>
      <div class="ministry-grid">
        ${ministries.map(([n, title, copy]) => `<article class="glass-card"><span class="card-index">${n}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}
      </div>
    </section>
  `);
}

function leadershipSection() {
  return template(`
    <section id="leadership" class="section reveal" style="--section-bg-image: url('${REAL.corrado}')">
      <div class="section-header">
        <p class="eyebrow">Guida</p>
        <h2 class="section-title">Una voce riconoscibile. Una visione condivisa.</h2>
        <p class="section-copy">Corrado Salmé emerge dai siti storici come fondatore, voce pastorale, musicista, insegnante e custode di una scelta radicale: offrire gratuitamente ciò che è stato ricevuto.</p>
      </div>
      <div class="profile-card">
        <img src="${REAL.corrado}" alt="Corrado Salmé" />
        <div>
          <span class="card-index">Voce fondatrice</span>
          <h3>Corrado Salmé</h3>
          <p>Il ministero mantiene un tono personale, diretto e familiare. La nuova piattaforma preserva questa autenticità e la presenta con una cornice globale.</p>
        </div>
      </div>
    </section>
  `);
}

function gallerySection() {
  const panels = [
    [REAL.corrado, "Corrado Salmé", "Fondatore, voce, musicista, insegnante."],
    [REAL.gruppo, "La comunità", "Dove Gesù Cristo è il Signore e la Chiesa una famiglia."],
    [REAL.adorazione, "L'adorazione", "Mani alzate, presenza reale, decenni di worship."],
    [REAL.copertina2019, "Infuocati per Dio 2019", "Copertina album originale dal sito storico."],
    [REAL.copertina2018, "Infuocati per Dio 2018", "La musica che ha attraversato generazioni."],
    [REAL.ixD2003, "2003", "Un anno di semina, canti e presenza."],
    [REAL.ixD2006, "2006", "L'anno della svolta: tutto gratuitamente."],
    [REAL.locandina2015, "Locandina 2015", "Eventi, raduni, memoria visiva del ministero."],
  ];
  return template(`
    <section id="galleria" class="cinematic-gallery" aria-label="Galleria cinematografica">
      ${panels.map(([src, title, copy], i) => `
        <article class="cinematic-panel reveal">
          <img src="${src}" alt="${title}" loading="${i < 2 ? 'eager' : 'lazy'}" />
          <div class="cinematic-caption">
            <span class="card-index">${String(i + 1).padStart(2, '0')}</span>
            <h2>${title}</h2>
            <p>${copy}</p>
          </div>
        </article>
      `).join("")}
    </section>
  `);
}

function timelineSection() {
  return template(`
    <section class="section reveal">
      <div class="section-header">
        <p class="eyebrow">La storia</p>
        <h2 class="section-title">Una timeline di fedeltà.</h2>
      </div>
      <div class="timeline">
        ${timeline.map(([year, copy]) => `<div class="timeline-item"><div class="timeline-year">${year}</div><p>${copy}</p></div>`).join("")}
      </div>
    </section>
  `);
}

function filteredMedia() {
  const q = state.query.trim().toLowerCase();
  return state.media.filter((item) => {
    const text = `${item.title} ${item.category} ${item.year} ${(item.tags||[]).join(" ")}`.toLowerCase();
    const matchesQuery = !q || text.includes(q);
    const matchesYear = state.filters.year === "all" || String(item.year) === String(state.filters.year);
    const matchesCategory = state.filters.category === "all" || item.category === state.filters.category;
    return matchesQuery && collectionMatches(item) && matchesYear && matchesCategory;
  });
}

function populateFilters() {
  const years = Array.from(new Set(state.media.map((m) => m.year).filter(Boolean))).sort();
  const yearSelect = document.querySelector('#filterYear');
  if (!yearSelect) return;
  years.forEach((y) => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });
}

function collectionMatches(item) {
  if (state.collection === "local-audio") return localAudio(item);
  if (state.collection === "all-audio") return item.category === "audio";
  if (state.collection === "video") return item.category === "video" || item.category === "external-video";
  if (state.collection === "documents") return item.category === "downloads";
  if (state.collection === "pending") return item.status.includes("pending") || item.category.startsWith("external");
  return true;
}

function humanCategory(category) {
  return {
    audio: "Audio",
    video: "Video",
    images: "Immagine",
    downloads: "Documento",
    "external-video": "Video da migrare",
    "external-archive": "Archivio esterno",
  }[category] || "Risorsa";
}

function humanStatus(status) {
  if (status.includes("migrated")) return "migrato";
  if (status.includes("external")) return "indicizzato";
  if (status.includes("pending")) return "da migrare";
  return "preservato";
}

function mediaCard(item) {
  const href = localMedia(item) ? item.localPath : item.sourceUrl;
  const label = localMedia(item) ? "Apri risorsa" : "Sorgente originale";
  const idx = state.media.indexOf(item);
  return `
    <article class="media-card">
      <div>
        <span class="media-type">${humanCategory(item.category)}${item.year ? ` · ${item.year}` : ""}</span>
        <h3>${item.title}</h3>
        <p class="media-meta">${humanStatus(item.status)} · ${item.type}</p>
      </div>
      ${localAudio(item) ? `<button class="media-link media-play" data-src="${item.localPath}" data-title="${item.title}" data-idx="${idx}">Riproduci →</button>` : ""}
      <button class="media-link media-add-queue" data-idx="${idx}">Aggiungi alla coda</button>
      ${href && !localAudio(item) ? `<a class="media-link" href="${href}" target="_blank" rel="noreferrer">${label} →</a>` : ""}
      ${!href ? `<span class="media-link">Indicizzato · migrazione da completare</span>` : ""}
    </article>
  `;
}

function mediaCollectionSummary() {
  const s = mediaStats();
  const pending = state.media.filter((item) => item.status.includes("pending") || item.category.startsWith("external")).length;
  return `
    <div class="collection-grid">
      <button class="collection-card active" data-collection="local-audio"><span>${formatNumber(state.media.filter(localAudio).length)}</span><strong>Ascolta ora</strong><em>Audio già migrati e riproducibili.</em></button>
      <button class="collection-card" data-collection="all-audio"><span>${formatNumber(s.audio)}</span><strong>Tutto l’audio</strong><em>Predicazioni, adorazione, corsi.</em></button>
      <button class="collection-card" data-collection="video"><span>${formatNumber(s.video)}</span><strong>Video</strong><em>Video indicizzati e da migrare.</em></button>
      <button class="collection-card" data-collection="documents"><span>${formatNumber(s.downloads)}</span><strong>Documenti</strong><em>PDF e risorse scaricabili.</em></button>
      <button class="collection-card" data-collection="pending"><span>${formatNumber(pending)}</span><strong>Da completare</strong><em>Niente perso: tutto tracciato.</em></button>
    </div>
  `;
}

function mediaCenter() {
  const section = template(`
    <section id="media" class="media-center">
      <div class="section reveal">
        <div class="section-header">
          <p class="eyebrow">Archivio Media</p>
          <h2 class="section-title">Un archivio intelligente, non una lista infinita.</h2>
          <p class="section-copy">Scegli un percorso, cerca una parola, ascolta subito ciò che è già migrato. Le risorse non ancora locali restano tracciate senza appesantire l’esperienza.</p>
        </div>
        ${mediaCollectionSummary()}
        <div class="media-controls">
          <input class="search" id="mediaSearch" type="search" placeholder="Cerca: Grazia, Regno, Intercessione, 2014..." aria-label="Cerca nell’archivio media" />
          <select id="filterCategory" class="select" aria-label="Filtra per categoria">
            <option value="all">Tutte le categorie</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="downloads">Documenti</option>
            <option value="external-video">Video esterni</option>
          </select>
          <select id="filterYear" class="select" aria-label="Filtra per anno">
            <option value="all">Tutti gli anni</option>
          </select>
        </div>
        <p id="mediaCount" class="media-count"></p>
        <div id="mediaResults" class="media-rail" aria-live="polite"></div>
        <button id="mediaMore" class="btn media-more" type="button">Mostra altri risultati</button>
      </div>
    </section>
  `);
  return section;
}

function shelfItems(category, limit = 8, localOnly = false) {
  return state.media
    .filter((item) => item.category === category)
    .filter((item) => !localOnly || localMedia(item))
    .slice(0, limit);
}

function mediaShelf(id, eyebrow, title, copy, category, localOnly = false) {
  const items = shelfItems(category, 8, localOnly);
  return template(`
    <section id="${id}" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">${eyebrow}</p>
        <h2 class="section-title">${title}</h2>
        <p class="section-copy">${copy}</p>
      </div>
      <div class="media-rail compact">
        ${items.map(mediaCard).join("") || `<article class="glass-card"><h3>Archivio indicizzato</h3><p>Le risorse sono presenti in metadata e verranno mostrate appena migrate localmente.</p></article>`}
      </div>
    </section>
  `);
}

function sermonsSection() {
  return mediaShelf("sermons", "Predicazioni", "Predicazioni come collezioni.", "Le predicazioni storiche diventano serie consultabili: anno, tema, corso, speaker e stato di migrazione.", "audio", true);
}

function audioLibrarySection() {
  return mediaShelf("audio-library", "Archivio audio", "La memoria sonora del ministero.", "Album di adorazione, insegnamenti, intercessioni e registrazioni storiche diventano un catalogo ascoltabile.", "audio", true);
}

function videoLibrarySection() {
  return mediaShelf("video-library", "Archivio video", "Video indicizzati, pronti per migrazione.", "YouTube e archivi esterni sono tracciati nella mappa dei contenuti: nessun riferimento storico deve sparire.", "external-video", false);
}

function resourcesSection() {
  return template(`
    <section id="resources" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Risorse scaricabili</p>
        <h2 class="section-title">Documenti, metadati, accesso.</h2>
        <p class="section-copy">Le risorse scaricabili e i file di inventario sono disponibili come base per una futura area risorse completa.</p>
      </div>
      <div id="downloads" class="resource-grid">
        ${resourceCards.map(([title, copy, href]) => `<a class="glass-card resource-link" href="${href}" target="_blank"><span class="card-index">Scarica</span><h3>${title}</h3><p>${copy}</p></a>`).join("")}
      </div>
    </section>
  `);
}

function downloadsSection() {
  return template(`
    <section id="downloads" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Download storici</p>
        <h2 class="section-title">Risorse originali</h2>
        <p class="section-copy">Link diretti al materiale storico: predicazioni, musica, libri e pagine legacy da cui è iniziata la preservazione.</p>
      </div>
      <div class="resource-grid">
        <a class="glass-card resource-link" href="http://www.senzamisura.org/senza_misura/Download.html" target="_blank" rel="noreferrer"><span class="card-index">Legacy</span><h3>Pagina Download (sito storico)</h3><p>La pagina originale con link a predicazioni, musica e materiali scaricabili.</p></a>
        <a class="glass-card resource-link" href="https://adoratore.wixsite.com/senzamisura" target="_blank" rel="noreferrer"><span class="card-index">Legacy</span><h3>Sito Wix storico</h3><p>Homepage storica e pagine ministeriali: Giubileo, CuoreAfrica, iChurch e altro.</p></a>
      </div>
    </section>
  `);
}

function eventsSection() {
  return template(`
    <section id="events" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Eventi</p>
        <h2 class="section-title">La presenza ha un ritmo.</h2>
        <p class="section-copy">Domenica, intercessione, scuola biblica, missioni, incontri di rete: il calendario futuro trasformerà appuntamenti statici in un'esperienza viva e aggiornata.</p>
      </div>
      <div class="resource-grid">
        <article class="glass-card"><span class="card-index">Catania</span><h3>Domenica 18:00</h3><p>Comunità Giubileo · Via Urania. Pre-culto, comunione, adorazione e Parola.</p></article>
        <article class="glass-card"><span class="card-index">Palermo</span><h3>Domenica 10:00</h3><p>Via Giuseppe Cirincione 64. Una famiglia che celebra il Regno di Dio.</p></article>
        <article class="glass-card"><span class="card-index">Intercessione</span><h3>Settimana</h3><p>Preghiera per città, regione, nazione, autorità e missione.</p></article>
      </div>
    </section>
  `);
}

function testimoniesSection() {
  return template(`
    <section class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Testimonianze</p>
        <h2 class="section-title">Dai file scaricati alle vite trasformate.</h2>
      </div>
      <div class="testimony-grid">
        ${testimonials.map(([title, copy]) => `<article class="glass-card"><h3>${title}</h3><p>${copy}</p></article>`).join("")}
      </div>
    </section>
  `);
}

function donationsSection() {
  return template(`
    <section id="donations" class="section reveal">
      <div class="cta-panel">
        <p class="eyebrow">Partecipa</p>
        <h2>Preserva l’eredità. Alimenta il futuro.</h2>
        <p>Sostieni la migrazione, l'archivio media, le missioni e la diffusione gratuita delle risorse. Ogni donazione è un seme che moltiplica accesso, formazione e speranza.</p>
        <div class="cta-actions">
          <a class="btn primary" href="https://www.paypal.me/adoratore" target="_blank" rel="noreferrer">Dona con PayPal</a>
          <a class="btn" href="mailto:info@senzamisura.org">Contatta il ministero</a>
          <a class="btn" href="/content-map.md" target="_blank">Apri content-map</a>
        </div>
      </div>
    </section>
  `);
}

function blogSection() {
  return template(`
    <section id="blog" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Blog</p>
        <h2 class="section-title">Racconti, non semplici aggiornamenti.</h2>
        <p class="section-copy">La futura sezione blog dovrà raccontare la visione con ritmo editoriale: storia, dottrina, missione, testimonianze e cultura del Regno.</p>
      </div>
      <div class="resource-grid">
        ${blogPosts.map(([title, copy]) => `<article class="glass-card"><span class="card-index">Editoriale</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}
      </div>
    </section>
  `);
}

function contactSection() {
  return template(`
    <section id="contacts" class="section reveal">
      <div class="split-feature">
        <article class="editorial-panel">
          <p class="eyebrow">Contatti</p>
          <h2>Una casa. Due città. Una famiglia.</h2>
          <p><strong>Catania</strong> · Via Urania · Domenica 18:00<br/><strong>Palermo</strong> · Via Giuseppe Cirincione, 64 · Domenica 10:00</p>
        </article>
        <article class="editorial-panel warm">
          <p class="eyebrow">Diretto</p>
          <h2>Scrivi, chiama, partecipa.</h2>
          <p>Email: <a href="mailto:info@senzamisura.org">info@senzamisura.org</a><br/>WhatsApp: <a href="https://wa.me/393286035200" target="_blank" rel="noreferrer">328.6035200</a></p>
        </article>
      </div>
    </section>
  `);
}

function audioDock() {
  return template(`
    <aside class="audio-dock" id="audioDock" aria-live="polite" hidden>
      <div style="display:flex;gap:1rem;align-items:center;">
        <div style="flex:1;">
          <span class="card-index">In ascolto</span>
          <strong id="audioTitle">Audio</strong>
        </div>
        <div style="display:flex;gap:.5rem;align-items:center;">
          <button id="dockPrev" class="btn">⟨</button>
          <button id="dockNext" class="btn">⟩</button>
          <button class="dock-close" id="audioClose" aria-label="Chiudi player">×</button>
        </div>
      </div>
      <audio id="audioPlayer" controls preload="none"></audio>
      <div id="queueList" style="margin-top:.6rem;max-height:160px;overflow:auto;"></div>
    </aside>
  `);
}

function footer() {
  return template(`
    <footer class="footer">
      <div class="footer-inner">
        <div><strong>Senza Misura Reborn</strong><br/>Piattaforma di preservazione digitale · nessuna memoria perduta.</div>
        <div>info@senzamisura.org · 328.6035200</div>
      </div>
    </footer>
  `);
}

function renderMediaResults() {
  const target = document.querySelector("#mediaResults");
  const count = document.querySelector("#mediaCount");
  const more = document.querySelector("#mediaMore");
  if (!target) return;
  const all = filteredMedia();
  const items = all.slice(0, state.visibleCount);
  if (count) count.textContent = `${formatNumber(all.length)} risorse trovate · ${formatNumber(items.length)} visibili`;
  if (more) more.hidden = items.length >= all.length;
  target.innerHTML = items.map(mediaCard).join("") || `<article class="glass-card"><h3>Nessun risultato</h3><p>Prova una ricerca diversa o rimuovi i filtri.</p></article>`;
}

function playAudio(src, title) {
  const dock = document.querySelector("#audioDock");
  const player = document.querySelector("#audioPlayer");
  const label = document.querySelector("#audioTitle");
  if (!dock || !player || !label) return;
  dock.hidden = false;
  label.textContent = title;
  if (player.getAttribute("src") !== src) player.setAttribute("src", src);
  player.play().catch(() => {});
}

function renderQueue() {
  const q = document.querySelector('#queueList');
  if (!q) return;
  q.innerHTML = state.queue.map((i, idx) => {
    const item = state.media[i];
    return `<div class="collection-card" data-qidx="${idx}"><strong>${item.title}</strong><div style="color:var(--muted);font-size:.9rem;">${item.year || ''} · ${humanCategory(item.category)}</div></div>`;
  }).join('');
}

function addToQueue(index) {
  if (typeof index !== 'number' || index < 0 || index >= state.media.length) return;
  state.queue.push(index);
  renderQueue();
}

function playQueueIndex(qidx) {
  const idx = state.queue[qidx];
  if (typeof idx !== 'number') return;
  const item = state.media[idx];
  if (!item) return;
  state.currentIndex = qidx;
  playAudio(item.localPath || item.sourceUrl, item.title);
}

function playNext() {
  if (state.queue.length === 0) return;
  const next = state.currentIndex + 1;
  if (next >= state.queue.length) {
    state.currentIndex = 0;
  } else state.currentIndex = next;
  playQueueIndex(state.currentIndex);
}

function playPrev() {
  if (state.queue.length === 0) return;
  const prev = state.currentIndex - 1;
  if (prev < 0) state.currentIndex = state.queue.length - 1;
  else state.currentIndex = prev;
  playQueueIndex(state.currentIndex);
}

function wireMediaControls() {
  const search = document.querySelector("#mediaSearch");
  const more = document.querySelector("#mediaMore");
  search?.addEventListener("input", (event) => {
    state.query = event.target.value;
    state.visibleCount = 12;
    renderMediaResults();
  });
  more?.addEventListener("click", () => {
    state.visibleCount += 12;
    renderMediaResults();
  });
  document.addEventListener("click", (event) => {
    const collection = event.target.closest("[data-collection]");
    if (collection) {
      state.collection = collection.dataset.collection;
      state.visibleCount = 12;
      document.querySelectorAll("[data-collection]").forEach((node) => node.classList.toggle("active", node === collection));
      renderMediaResults();
    }
    const button = event.target.closest(".media-play");
    if (button) playAudio(button.dataset.src, button.dataset.title);
    const addQ = event.target.closest('.media-add-queue');
    if (addQ) {
      const idx = Number(addQ.dataset.idx);
      addToQueue(idx);
    }
    if (event.target.closest("#audioClose")) {
      const dock = document.querySelector("#audioDock");
      const player = document.querySelector("#audioPlayer");
      player?.pause();
      if (dock) dock.hidden = true;
    }
  });
  renderMediaResults();

  // Mobile nav toggle and global search wiring
  const navToggle = document.querySelector("#navToggle");
  const header = document.querySelector(".nav");
  const globalSearch = document.querySelector("#globalSearch");
  const mediaSearch = document.querySelector("#mediaSearch");
  if (navToggle && header) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      header.classList.toggle("open");
    });
    // close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav")) header.classList.remove("open");
    });
  }
  if (globalSearch) {
    globalSearch.addEventListener("input", (e) => {
      const v = e.target.value;
      state.query = v;
      if (mediaSearch) mediaSearch.value = v;
      state.visibleCount = 12;
      renderMediaResults();
    });
  }
  const filterCategory = document.querySelector('#filterCategory');
  const filterYear = document.querySelector('#filterYear');
  if (filterCategory) {
    filterCategory.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      state.visibleCount = 12;
      renderMediaResults();
    });
  }
  if (filterYear) {
    filterYear.addEventListener('change', (e) => {
      state.filters.year = e.target.value;
      state.visibleCount = 12;
      renderMediaResults();
    });
  }
  // dock controls
  const dockPrev = document.querySelector('#dockPrev');
  const dockNext = document.querySelector('#dockNext');
  const queueList = document.querySelector('#queueList');
  if (dockPrev) dockPrev.addEventListener('click', (e) => { e.stopPropagation(); playPrev(); });
  if (dockNext) dockNext.addEventListener('click', (e) => { e.stopPropagation(); playNext(); });
  if (queueList) queueList.addEventListener('click', (e) => {
    const card = e.target.closest('[data-qidx]');
    if (card) playQueueIndex(Number(card.dataset.qidx));
  });
}

function revealOnScroll() {
  const nodes = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  nodes.forEach((node) => observer.observe(node));
}

async function loadMedia() {
  try {
    const response = await fetch("/data/media-library.json");
    state.media = await response.json();
  } catch (error) {
    state.media = [];
  }
}

async function loadWixContent() {
  try {
    console.log('[loadWixContent] Caricamento contenuti Wix');
    const res = await fetch('/data/wix_content.json');
    if (!res.ok) {
      console.warn('[loadWixContent] Errore nel caricamento wix_content.json');
      return;
    }
    const wix = await res.json();
    const pages = wix.pages || {};

    // pick best home candidate: explicit Home slug or the page with most content
    const entries = Object.entries(pages || {});
    if (!entries.length) return;
    const slugKey = entries.find(([k]) => k.toLowerCase() === 'home' || k.toLowerCase().includes('home'))?.[0];
    let best = slugKey ? pages[slugKey] : null;
    if (!best) {
      // score by available content
      let bestScore = -1;
      for (const [, p] of entries) {
        const score = (p.headings?.length || 0) + (p.paragraphs?.length || 0) + (p.images?.length || 0);
        if (score > bestScore) { best = p; bestScore = score; }
      }
    }
    if (!best) return;

    // helper: sanitize and filter out boilerplate and short junk
    const sanitizeString = (s) => {
      if (!s) return '';
      let t = String(s).replace(/\s+/g, ' ').trim();
      t = t.replace(/Perch[eè]/g, 'Perché');
      t = t.replace(/Senzamisura|SenzaMisura/gi, 'Senza Misura');
      t = t.replace(/ministeri?o/gi, 'ministero');
      t = t.replace(/Questo sito è stato realizzato con Wix\.? Crea il tuo oggi\.?/gi, '');
      t = t.replace(/\bWix\b/gi, '');
      // collapse adjacent duplicate words (basic safeguard)
      t = t.replace(/\b(\w+)(?:\W+\1\b)+/gi, '$1');
      t = t.replace(/\s{2,}/g, ' ');
      return t.trim();
    };
    const isBoiler = (t) => !t || /wix|crea il tuo|inizia|this site|pagina iniziale|Questo sito è stato realizzato con Wix/i.test(t);
    const cleanParas = (best.paragraphs || []).map((p) => sanitizeString(p)).filter((p) => p.length > 24 && !isBoiler(p));
    const cleanHeadings = (best.headings || []).map((h) => ({...h, text: sanitizeString(h.text || '')})).filter((h) => h.text && !isBoiler(h.text));

    // choose hero title: prefer large headings then title
    let candidate = (cleanHeadings.find((h) => /h1|h2|h3/i.test(h.tag)) || cleanHeadings[0] || {}).text || best.title || '';
    candidate = (candidate || '').replace(/\s+/g, ' ').trim();
    if (!candidate && best.title) candidate = best.title.replace(/\s*\|\s*/g, ' - ').trim();
    // insert a gentle line break near center for nicer hero layout
    if (candidate.length > 28) {
      const mid = Math.floor(candidate.length / 2);
      let br = candidate.lastIndexOf(' ', mid);
      if (br === -1) br = candidate.indexOf(' ', mid);
      if (br > 0) candidate = candidate.slice(0, br) + '<br/>' + candidate.slice(br + 1);
    }
    if (candidate) HERO_TITLE = sanitizeString(candidate);

    // choose hero lede: meta_description preferred, else first clean paragraph
    const meta = sanitizeString(best.meta_description || '');
    if (meta && !isBoiler(meta)) HERO_LEDE = meta;
    else if (cleanParas.length) HERO_LEDE = cleanParas[0];

    // load image mapping and prepare images
    try {
      const mapRes = await fetch('/data/wix_image_mapping.json');
      if (mapRes.ok) {
        imageMapping = await mapRes.json();
        console.log('[loadWixContent] Mapping immagini caricato:', Object.keys(imageMapping).length, 'voci');
      } else {
        console.warn('[loadWixContent] Mapping non caricato:', mapRes.status);
      }
    } catch (e) {
      console.warn('[loadWixContent] Errore mapping:', e.message);
    }

    // collect unique images across pages and apply mapping to rewrite URLs
    const allImages = [];
    for (const [, p] of entries) {
      (p.images || []).forEach((img) => {
        if (img) {
          // Apply mapping: convert Wix remote URL to local path if available
          const localUrl = imageMapping[img] || img;
          if (!allImages.includes(localUrl)) allImages.push(localUrl);
        }
      });
    }

    // map first images into REAL keys (best-effort)
    const imgPick = (i) => allImages[i] || allImages[0] || REAL.corrado;
    REAL.corrado = imgPick(0);
    REAL.gruppo = imgPick(1);
    REAL.adorazione = imgPick(2);
    REAL.humanResources = imgPick(3) || REAL.humanResources;
    REAL.copertina2019 = imgPick(4) || REAL.copertina2019;
    REAL.copertina2018 = imgPick(5) || REAL.copertina2018;
    REAL.locandina2015 = imgPick(6) || REAL.locandina2015;

    // expose section background variables to CSS so styles can use Wix images with safe fallback
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        const setRootBg = (name, url) => {
          if (!url) return;
          document.documentElement.style.setProperty(`--${name}`, `url("${url}") center / cover no-repeat`);
        };
        setRootBg('section-bg-adorazione', REAL.adorazione);
        setRootBg('section-bg-gruppo', REAL.gruppo);
        setRootBg('section-bg-corrado', REAL.corrado);
      }
    } catch (e) {
      // ignore DOM errors in non-browser environments
    }

    // update legacyHighlights with cleaner snippets
    const highlights = [];
    (cleanHeadings.slice(0, 3)).forEach((h) => highlights.push([sanitizeString(h.text), '', 'Sito storico']));
    (cleanParas.slice(0, 3)).forEach((p) => highlights.push([sanitizeString(p.slice(0, 120)) + (p.length > 120 ? '…' : ''), '', 'Sito storico']));
    if (highlights.length) {
      legacyHighlights.splice(0, Math.min(legacyHighlights.length, highlights.length), ...highlights.slice(0, legacyHighlights.length));
    }

    // update ministries descriptions from matching pages when available
    const pagesBySlug = Object.fromEntries(entries);
    const mapping = { Giubileo: ['giubileo', 'Giubileo'], 'Network Italia': ['network', 'network italia', 'Network'], 'CuoreAfrica': ['cuoreafrica', 'cuore africa'], 'iChurch': ['ichurch', 'iChurch'], 'Musica': ['musica'] };
    ministries.forEach((m, idx) => {
      const name = m[1];
      const candidates = mapping[name] || [name.toLowerCase()];
      for (const k of Object.keys(pagesBySlug)) {
        const lower = k.toLowerCase();
        if (candidates.some((c) => lower.includes(c.toLowerCase()))) {
          const p = pagesBySlug[k];
          const desc = (p.paragraphs || []).find((t) => t && t.length > 30 && !isBoiler(t));
          if (desc) ministries[idx][2] = sanitizeString(desc);
          break;
        }
      }
    });

  } catch (e) {
    console.warn('loadWixContent failed', e);
  }
}

async function init() {
  console.log('init(): starting');
  await loadMedia();
  console.log('init(): loadMedia completed');
  await loadWixContent();
  console.log('init(): loadWixContent completed, imageMapping size:', Object.keys(window.imageMapping || {}).length);
  const app = document.querySelector("#app");
  app.className = "site-shell";
  app.append(
    nav(),
    el("main", { id: "main" }, [
      hero(),
      statsSection(),
      visionMissionSection(),
      storySection(),
      ministriesSection(),
      leadershipSection(),
      gallerySection(),
      timelineSection(),
      mediaCenter(),
        resourcesSection(),
        downloadsSection(),
      eventsSection(),
      testimoniesSection(),
      blogSection(),
      contactSection(),
      donationsSection(),
      audioDock(),
    ]),
    footer(),
  );
  wireMediaControls();
  populateFilters();
  revealOnScroll();
}

init();
