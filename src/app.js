const HERO = "/media/images/real/hero_corrado.png";
const HERO_MOBILE = "/media/images/heroes/hero_mobile.png";
const HEROES = {
  presence: "/media/images/heroes/hero_presence.png",
  worship: "/media/images/heroes/hero_worship_night.png",
  generation: "/media/images/heroes/hero_generation.png",
  city: "/media/images/heroes/hero_light_in_the_city.png",
};
const HERO_SEQUENCE = [
  [HEROES.presence, "La Presenza", "Dove Gesù Cristo è il Signore e la Chiesa una famiglia."],
  [HEROES.worship, "L'Adorazione", "Decenni di worship notturno: mani alzate, cuori aperti, presenza reale."],
  [HEROES.generation, "La Generazione", "Fire Generation: una fiamma passata di mano in mano, dai giovani di ieri a quelli di oggi."],
  [HEROES.city, "La Luce nella Città", "Catania, Palermo, l'Italia e oltre: una presenza che illumina il buio."],
];
const LOGO_SM = "";

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
  ["leadership", "Guida"],
  ["media", "Archivio"],
  ["events", "Eventi"],
  ["donations", "Dona"],
];

const ministries = [
  ["01", "Giubileo", "Comunità a Catania e Palermo: adorazione, famiglia, scuola biblica e intercessione.", {
    img: "/media/images/heroes/hero_presence.png",
    icon: "🕊️",
    link: "https://adoratore.wixsite.com/senzamisura/giubileo",
    details: ["Adorazione notturna", "Scuola biblica", "Intercessione per la città", "Famiglia e comunità"],
  }],
  ["02", "Network Italia", "Una rete di comunità che condivide risorse, connessione e moltiplicazione.", {
    img: "/media/images/real/gruppo_full.jpg",
    icon: "🤝",
    link: "https://adoratore.wixsite.com/senzamisura/network",
    details: ["Connessione tra comunità", "Risorse condivise", "Interscambi e moltiplicazione", "Presenza nazionale"],
  }],
  ["03", "CuoreAfrica", "Missioni documentate dal 2008 al 2026: presenza, servizio e continuità.", {
    img: "/media/images/real/human_full.jpg",
    icon: "🌍",
    link: "https://adoratore.wixsite.com/senzamisura/cuoreafrica",
    details: ["15 missioni documentate", "Ottobre 2008 → Aprile 2026", "Gallerie fotografiche su Facebook", "Presenza, servizio, continuità"],
  }],
  ["04", "iChurch", "Formazione biblica sistematica: Spirito Santo, Regno, Beatitudini, Intercessione.", {
    img: "/media/images/real/copertina_full.jpg",
    icon: "📚",
    link: "https://adoratore.wixsite.com/senzamisura/ichurch",
    details: ["Conoscere lo Spirito Santo (10 parti)", "Corso Intercessori (3 parti)", "Identità-Eredità-Autorità (23 parti)", "Beatitudini, Evangelizzazione, Regno di Dio"],
  }],
  ["05", "Adorazione", "Decenni di musica, adorazione spontanea, album e canti diffusi gratuitamente.", {
    img: "/media/images/real/mani_full.jpg",
    icon: "🎵",
    link: "https://adoratore.wixsite.com/senzamisura/musica",
    details: ["Infuocati per Dio 2003-2019", "Quanti miracoli, Apri i miei occhi", "Gratuitamente avete ricevuto", "Streaming e download gratis"],
  }],
  ["06", "Memoria multimediale", "Archivio storico di predicazioni, audio, video, PDF e testimonianze digitali.", {
    img: "/media/images/real/quanti_full.png",
    icon: "🎬",
    link: "http://www.senzamisura.org/senza_misura/Download.html",
    details: ["Predicazioni 2014-2019", "Audio, video, PDF", "Oltre 80.000 download", "Archivio preservato e indicizzato"],
  }],
];

const timeline = [
  { year: "1996", title: "Prime produzioni", icon: "♪", accent: "#f2d48a", tag: "Musica", desc: "Apri i miei occhi — le prime registrazioni musicali preservate. Un seme che non sarà più perso." },
  { year: "2006", title: "Il passo di fede", icon: "✦", accent: "#c9b8ff", tag: "Genesi", desc: "Tutto il materiale viene messo a disposizione gratuitamente. La gratuità diventa identità." },
  { year: "2008", title: "CuoreAfrica", icon: "🌍", accent: "#7ee0c0", tag: "Missioni", desc: "Nasce la memoria missionaria CuoreAfrica. Archivi fotografici continuativi da ogni viaggio." },
  { year: "2014", title: "iChurch", icon: "▣", accent: "#9bd4ff", tag: "Formazione", desc: "L'ecosistema iChurch: corsi, predicazioni e formazione audio/video strutturati per la comunità." },
  { year: "2018", title: "Worship streaming", icon: "▶", accent: "#ff9b6b", tag: "Adorazione", desc: "La produzione worship entra nella fase video/streaming con playlist complete e accessibili." },
  { year: "2026", title: "Reborn", icon: "✚", accent: "#f2d48a", tag: "Eredità", desc: "Senza Misura Reborn preserva l'eredità e la porta in una piattaforma globale. Una memoria viva." },
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
  corrado: "/media/images/real/4f23b2_a443011e9b2b4b89bb3f931c804e1e05~mv2.jpg",
  corradoHero: "/media/images/real/4f23b2_a443011e9b2b4b89bb3f931c804e1e05~mv2.jpg",
  corradoPortrait: "/media/images/real/corrado_guida.png",
  gruppo: "/media/images/real/gruppo_full.jpg",
  adorazione: "/media/images/real/mani_full.jpg",
  logo: "/media/images/real/Logo_verticale.png",
  logoPsd: "/media/images/real/Logo_PSD.png",
  logoSquare: "/media/images/real/Logo_verticale.png",
  copertina2019: "/media/images/real/Copertina CD IxD2019 Fronte.jpg",
  copertina2018: "/media/images/real/Copertina CD IxD2018_02.jpg",
  copertina: "/media/images/real/copertina_full.jpg",
  quantiMiracoli: "/media/images/real/quanti_full.png",
  locandina2015: "/media/images/real/Locandina IxD2015 _ sito.jpg",
  ixD2003: "/media/images/real/IxD2003.jpg",
  ixD2004: "/media/images/real/IxD2004.jpg",
  ixD2005: "/media/images/real/IxD2005.jpg",
  ixD2006: "/media/images/real/IxD2006.jpg",
  ixD2008: "/media/images/real/IxD2008.jpg",
  ixD2013: "/media/images/real/IxD2013.jpg",
  shapeimage: "/media/images/real/shapeimage_5.png",
  humanResources: "/media/images/real/human_full.jpg",
  wixHero: "/media/images/real/4f23b2_a443011e9b2b4b89bb3f931c804e1e05~mv2.jpg",
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

// Closing cinematic background — 4 narrative images cross-fading behind
// the final sections. Pure background layer, no layout impact.
function closingBackground() {
  return template(`
    <div class="closing-bg" aria-hidden="true">
      <div class="closing-bg-layer" data-bg="adorazione"></div>
      <div class="closing-bg-layer" data-bg="bibbia"></div>
      <div class="closing-bg-layer" data-bg="croce"></div>
      <div class="closing-bg-layer" data-bg="alba"></div>
      <div class="closing-bg-overlay"></div>
    </div>
  `);
}

// Zero-height anchor marker placed in the final section flow.
// Triggers a cross-fade to its corresponding background image.
function bgAnchor(key) {
  return template(`
    <div class="bg-anchor" data-bg-anchor="${key}" aria-hidden="true"></div>
  `);
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
      <div class="nav-contacts">
        <a href="https://wa.me/393286035200" target="_blank" rel="noreferrer" class="nav-contact-btn nav-wa" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a href="mailto:info@senzamisura.org" class="nav-contact-btn nav-mail" aria-label="Email">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </a>
      </div>
      <a class="nav-cta" href="#media">▶ Ascolta</a>
    </header>
  `);
}

function hero() {
  return template(`
    <section id="top" class="hero">
      <div class="hero-media"><img id="hero-img" src="${HERO}" alt="Corrado Salmé che canta e adora" /></div>
      <div class="hero-brand" aria-label="Senza Misura">SENZA<br/>MISURA</div>
      <div class="hero-content reveal">
        <div class="hero-copy">
          <p class="eyebrow">Dal 2006 · Grazia sovrabbondante</p>
          <h1>La Grazia<br/><em>che trabocca.</em></h1>
          <p class="hero-lede">Un movimento nato per condividere gratuitamente musica, predicazioni, formazione, missioni e testimonianze. Una memoria viva trasformata in esperienza digitale moderna.</p>
          <div class="hero-actions">
            <a class="btn primary" href="#media"><span class="btn-icon">▶</span> Ascolta ora</a>
            <a class="btn" href="#ministries">Scopri i ministeri</a>
            <a class="btn ghost" href="#donations">Sostieni la visione</a>
          </div>
        </div>
        <aside class="hero-oracle" aria-label="Citazione originale Senza Misura">
          <div class="oracle-quote-mark">&ldquo;</div>
          <p>Il nostro desiderio è che visitando questo sito tu possa sperimentare la sovrabbondante Grazia di Dio.</p>
          <div class="oracle-author">
            <span class="oracle-avatar">CS</span>
            <div>
              <strong>Corrado Salmé</strong>
              <small>Fondatore · Senza Misura</small>
            </div>
          </div>
        </aside>
        <div class="hero-kpis" aria-label="Impatto Senza Misura">
          <div class="kpi-card">
            <span class="kpi-icon">♪</span>
            <strong>80k+</strong>
            <span>download nel primo mese</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-icon">✦</span>
            <strong>200+</strong>
            <span>risorse multimediali</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-icon">⏳</span>
            <strong>20+</strong>
            <span>anni di memoria</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-icon">✚</span>
            <strong>5</strong>
            <span>ministeri integrati</span>
          </div>
        </div>
      </div>
    </section>
  `);
}

function experiencePathsSection() {
  const paths = [
    ["Ascolta", "Musica, predicazioni e corsi già migrati in un player vivo.", "#media", "▶", "#f2d48a"],
    ["Studia", "iChurch: Spirito Santo, Identità, Beatitudini, Regno e Intercessione.", "#media", "✦", "#9bd4ff"],
    ["Vivi", "Giubileo, Catania e Palermo: una famiglia dove Gesù Cristo è il Signore.", "#events", "⌂", "#c9b8ff"],
    ["Sostieni", "Missioni, archivio e diffusione gratuita delle risorse per una nuova generazione.", "#donations", "✚", "#7ee0c0"],
  ];
  return template(`
    <section class="experience-paths reveal" aria-label="Percorsi principali">
      ${paths.map(([title, copy, href, icon, accent], i) => `
        <a class="path-card" href="${href}" style="--path-accent:${accent}">
          <span class="path-index">${String(i + 1).padStart(2, "0")}</span>
          <span class="path-icon">${icon}</span>
          <strong>${title}</strong>
          <p>${copy}</p>
          <span class="path-arrow">→</span>
        </a>
      `).join("")}
    </section>
  `);
}


function heroSequenceSection() {
  const accents = ["#f2d48a", "#9bd4ff", "#c9b8ff", "#7ee0c0"];
  const icons = ["✦", "♪", "🔥", "☀"];
  return template(`
    <section class="hero-sequence reveal" aria-label="Sequenza visiva Senza Misura">
      <div class="sequence-intro">
        <p class="eyebrow">I quattro pilastri</p>
        <h2>Una storia viva, <em>quattro dimensioni.</em></h2>
      </div>
      <div class="sequence-grid">
        ${HERO_SEQUENCE.map(([src, title, copy], index) => `
          <article class="sequence-card reveal" style="--seq-accent:${accents[index] || '#f2d48a'}">
            <div class="sequence-card-img">
              <img src="${src}" alt="${title}" loading="${index === 0 ? "eager" : "lazy"}" />
              <div class="sequence-card-overlay"></div>
            </div>
            <div class="sequence-card-body">
              <span class="seq-icon">${icons[index] || "✦"}</span>
              <span class="seq-number">${String(index + 1).padStart(2, "0")}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
              <span class="seq-arrow">→</span>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `);
}

function statsSection() {
  const s = mediaStats();
  return template(`
    <section id="who" class="section reveal chi-siamo-section">
      <img src="/media/images/backgrounds/chi_siamo.png" alt="" class="chi-siamo-bg" loading="lazy" />
      <div class="chi-siamo-overlay"></div>
      <div class="chi-siamo-content">
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
      </div>
    </section>
  `);
}

function manifestoSection() {
  return template(`
    <section class="manifesto-section reveal" aria-label="Manifesto Senza Misura">
      <img src="/media/images/backgrounds/manifesto.png" alt="" class="manifesto-bg" loading="lazy" />
      <div class="manifesto-overlay"></div>
      <div class="manifesto-mark">SM</div>
      <div class="manifesto-copy">
        <p class="eyebrow">Manifesto</p>
        <h2>Niente potrà mai sostituire la potenza di una sola Parola.</h2>
        <p>Dal sito originale emerge una visione chiara: non costruire una vetrina, ma una casa digitale dove la Grazia, la Presenza, la Parola, l’adorazione, la formazione e la missione siano accessibili gratuitamente a chiunque.</p>
      </div>
      <div class="manifesto-values">
        <div class="value-card" style="--va:#f2d48a">
          <span class="value-icon">✦</span>
          <strong>Grazia sovrabbondante</strong>
          <em>La misura di Dio supera ogni calcolo umano.</em>
        </div>
        <div class="value-card" style="--va:#9bd4ff">
          <span class="value-icon">⌂</span>
          <strong>Famiglia di fede</strong>
          <em>Dove Gesù Cristo è il Signore e la Chiesa una famiglia.</em>
        </div>
        <div class="value-card" style="--va:#c9b8ff">
          <span class="value-icon">✎</span>
          <strong>Formazione gratuita</strong>
          <em>Corsi, predicazioni e insegnamenti disponibili a tutti.</em>
        </div>
        <div class="value-card" style="--va:#7ee0c0">
          <span class="value-icon">✚</span>
          <strong>Missione viva</strong>
          <em>Dal locale al globale: una presenza che illumina il buio.</em>
        </div>
      </div>
    </section>
  `);
}

function visionMissionSection() {
  return template(`
    <section class="section reveal">
      <div class="split-feature">
        <article id="vision" class="editorial-panel vision-panel">
          <img src="${REAL.adorazione}" alt="Mani alzate in adorazione: la benedizione Senza Misura" class="panel-bg" loading="lazy" />
          <div class="panel-overlay"></div>
          <div class="panel-glow"></div>
          <div class="panel-content">
            <span class="panel-eyebrow"><span class="panel-eyebrow-icon">✦</span> Visione</span>
            <h2>La benedizione<br/>Senza Misura<br/><em>resa accessibile.</em></h2>
            <p>Una piattaforma dove ogni persona può scoprire, ascoltare, studiare e incontrare una memoria viva.</p>
            <div class="panel-tags">
              <span>La Parola</span>
              <span>La Presenza</span>
              <span>L'adorazione</span>
              <span>La comunità</span>
            </div>
            <div class="panel-foot">
              <span class="panel-pulse"></span>
              <small>Una famiglia che continua a seminare</small>
            </div>
          </div>
        </article>
        <article id="mission" class="editorial-panel mission-panel">
          <img src="${REAL.gruppo}" alt="La comunita Senza Misura: fede condivisa e servizio" class="panel-bg" loading="lazy" />
          <div class="panel-overlay"></div>
          <div class="panel-glow"></div>
          <div class="panel-content">
            <span class="panel-eyebrow"><span class="panel-eyebrow-icon">✚</span> Missione</span>
            <h2>Preservare tutto.<br/>Elevare tutto.<br/><em>Perdere niente.</em></h2>
            <p>Ogni contenuto storico viene migrato, indicizzato e trasformato in esperienza.</p>
            <div class="panel-stats">
              <div><strong>Audio</strong><span>Predicazioni & musica</span></div>
              <div><strong>Video</strong><span>Corsi & worship</span></div>
              <div><strong>Documenti</strong><span>PDF & risorse</span></div>
              <div><strong>Missioni</strong><span>Archivi & foto</span></div>
            </div>
            <div class="panel-foot">
              <span class="panel-pulse mission-pulse"></span>
              <small>Niente perso. Tutto tracciato.</small>
            </div>
          </div>
        </article>
      </div>
    </section>
  `);
}

function storySection() {
  return template(`
    <section id="story" class="section reveal">
      <div class="story-grid">
        <article class="story-card story-card-history">
          <img src="${HEROES.generation}" alt="Una generazione raggiunta dalla visione Senza Misura" />
          <div class="story-card-content">
            <p class="eyebrow">La nostra storia</p>
            <h2 class="story-title">Gratuitamente avete ricevuto.</h2>
            <p>Nel 2006 la visione prende forma: mettere a disposizione gratuitamente canti, prediche, insegnamenti e risorse. Una semina digitale che ha raggiunto migliaia di vite.</p>
          </div>
        </article>
        <article class="story-card story-card-impact">
          <img src="${HEROES.city}" alt="Una presenza di luce nella citta" />
          <div class="story-card-content">
            <p class="eyebrow">Impatto</p>
            <h2 class="story-title">Una luce nella città.</h2>
            <p>Catania, Palermo, Italia, Africa: locale e globale si incontrano in un'unica chiamata. Oltre 80.000 download nel primo mese, migliaia di testimonianze.</p>
          </div>
        </article>
      </div>
    </section>
  `);
}

function ministriesSection() {
  return template(`
    <section id="ministries" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Ministeri</p>
        <h2 class="section-title">Un ecosistema, non una brochure.</h2>
        <p class="section-copy">Un ecosistema spirituale integrato: comunità locale, rete nazionale, missione internazionale, formazione biblica, adorazione e archivio multimediale. Ogni ministero è una porta d’ingresso all’esperienza Senza Misura.</p>
      </div>
      <div class="ministry-grid">
        ${ministries.map(([n, title, copy, info]) => `
          <article class="ministry-card" data-ministry="${title}" tabindex="0">
            <div class="ministry-card-img">
              <img src="${info.img}" alt="${title}" loading="lazy" />
              <span class="ministry-icon">${info.icon}</span>
            </div>
            <div class="ministry-card-body">
              <span class="card-index">${n}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
              <ul class="ministry-details">
                ${info.details.map(d => `<li>${d}</li>`).join("")}
              </ul>
              <a class="ministry-link" href="${info.link}" target="_blank" rel="noopener">Apri archivio originale →</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `);
}

function leadershipSection() {
  const milestones = [
    { year: "2006", title: "La Scelta", icon: "✦", accent: "#f2d48a", desc: "Corrado Salmé riceve la direzione di mettere gratuitamente a disposizione canti, prediche e insegnamenti. Nasce Senza Misura.", tag: "Genesi" },
    { year: "2008", title: "CuoreAfrica", icon: "🌍", accent: "#7ee0c0", desc: "Primo viaggio missionario documentato in Africa. CuoreAfrica diventa l'archivio missionario reale del movimento.", tag: "Missioni" },
    { year: "2019", title: "Infuocati", icon: "🔥", accent: "#ff9b6b", desc: "Album pubblicato. Nel primo mese oltre 80.000 download da tutto il mondo. La Grazia trabocca.", tag: "Musica" },
    { year: "2026", title: "Reborn", icon: "✚", accent: "#9bd4ff", desc: "Piattaforma digitale viva: archivio interattivo, formazione iChurch, adorazione, missioni. Una memoria che diventa esperienza.", tag: "Oggi" },
  ];
  return template(`
    <section id="leadership" class="reveal leadership-section">
      <div class="leadership-glow"></div>
      <div class="leadership-wrap">
        <div class="leadership-photo-col">
          <div class="leadership-photo-frame">
            <div class="leadership-photo">
              <img src="${REAL.corradoPortrait}" alt="Corrado Salmé" loading="lazy" />
              <div class="leadership-photo-overlay"></div>
            </div>
            <div class="leadership-photo-accent"></div>
          </div>
          <div class="leadership-photo-badge">
            <span class="badge-pulse"></span>
            <small>In ministero dal 2006</small>
          </div>
        </div>
        <div class="leadership-info">
          <p class="eyebrow">La Guida</p>
          <h2 class="section-title">Corrado <em>Salmé</em></h2>
          <span class="leadership-subtitle">Voce fondatrice · Musicista · Insegnante</span>
          <p class="leadership-bio">Fondatore del movimento Senza Misura. Voce pastorale, musicista e insegnante. Custode di una scelta radicale: offrire gratuitamente ciò che è stato ricevuto. Il suo ministero ha attraversato decenni di adorazione, predicazioni, formazioni bibliche e missioni, raggiungendo decine di migliaia di persone in tutto il mondo.</p>
          <blockquote class="leadership-quote">
            <span class="quote-mark">&ldquo;</span>
            Tutto ciò che abbiamo ricevuto gratuitamente, gratuitamente vogliamo donare.
            <span class="quote-author">— Corrado Salmé</span>
          </blockquote>
          <div class="leadership-stats">
            <div class="lead-stat">
              <span class="lead-stat-icon">♪</span>
              <strong>20+</strong>
              <span>anni di ministero</span>
            </div>
            <div class="lead-stat">
              <span class="lead-stat-icon">✦</span>
              <strong>80k+</strong>
              <span>download globali</span>
            </div>
            <div class="lead-stat">
              <span class="lead-stat-icon">✚</span>
              <strong>5</strong>
              <span>ministeri attivi</span>
            </div>
          </div>
          <div class="leadership-roles">
            <span class="role-tag">Fondatore</span>
            <span class="role-tag">Musicista</span>
            <span class="role-tag">Insegnante biblico</span>
            <span class="role-tag">Intercessore</span>
            <span class="role-tag">Missionario</span>
          </div>
          <div class="leadership-cta">
            <a class="btn primary" href="#media"><span class="btn-icon">▶</span> Ascolta i canti</a>
            <a class="btn ghost" href="#events">Prossimi eventi</a>
          </div>
        </div>
      </div>
      <div class="journey">
        <div class="journey-header">
          <p class="eyebrow">Il cammino</p>
          <h3>Venti anni di <em>Grazia sovrabbondante.</em></h3>
        </div>
        <div class="journey-track">
          <div class="journey-line"></div>
          ${milestones.map((m, i) => `
            <div class="journey-card" style="--journey-accent:${m.accent}">
              <div class="journey-node">
                <span class="journey-node-icon">${m.icon}</span>
                <span class="journey-node-dot"></span>
              </div>
              <div class="journey-card-body">
                <span class="journey-tag">${m.tag}</span>
                <span class="journey-year">${m.year}</span>
                <strong class="journey-title">${m.title}</strong>
                <p class="journey-desc">${m.desc}</p>
              </div>
            </div>
          `).join("")}
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
    <section class="section reveal timeline-section">
      <div class="section-header timeline-header">
        <p class="eyebrow">La storia</p>
        <h2 class="section-title">Una timeline di <em>fedeltà.</em></h2>
        <p class="timeline-subtitle">Trent'anni di semina, adorazione e gratuità — ogni tappa un atto di fede.</p>
      </div>
      <div class="timeline-rail">
        <div class="timeline-spine"></div>
        ${timeline.map((m, i) => `
          <div class="timeline-row ${i % 2 === 0 ? "left" : "right"}" style="--tl-accent:${m.accent}">
            <div class="timeline-node">
              <span class="timeline-node-icon">${m.icon}</span>
              <span class="timeline-node-ring"></span>
            </div>
            <div class="timeline-panel">
              <span class="timeline-tag">${m.tag}</span>
              <span class="timeline-year">${m.year}</span>
              <strong class="timeline-panel-title">${m.title}</strong>
              <p class="timeline-panel-desc">${m.desc}</p>
            </div>
          </div>
        `).join("")}
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
    "external-video": "Video",
    "external-archive": "Archivio esterno",
  }[category] || "Risorsa";
}

function youTubeThumb(url) {
  const m = String(url || "").match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

function youTubeId(url) {
  const m = String(url || "").match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function courseTag(item) {
  if (!item.tags) return "";
  const course = item.tags.find((t) => t.startsWith("ichurch") || t.includes("beatitudini") || t.includes("identità") || t.includes("regno") || t.includes("evangelizzare") || t.includes("segni") || t.includes("intercessione") || t.includes("spirito-santo"));
  if (course) return `<span class="media-course-tag">${course.replace(/-/g," ")}</span>`;
  return "";
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
  const ytId = youTubeId(item.sourceUrl);
  const thumb = ytId ? youTubeThumb(item.sourceUrl) : null;
  const isVideo = item.category === "external-video" || item.category === "video";
  return `
    <article class="media-card${isVideo ? " media-card-video" : ""}">
      ${thumb ? `<div class="media-thumb" style="background-image:url('${thumb}')"><span class="media-thumb-play">▶</span></div>` : ""}
      <div class="media-card-body">
        <span class="media-type">${humanCategory(item.category)}${item.year ? ` · ${item.year}` : ""}</span>
        ${courseTag(item)}
        <h3>${item.title}</h3>
        <p class="media-meta">${humanStatus(item.status)} · ${item.type}</p>
      </div>
      <div class="media-card-actions">
        ${localAudio(item) ? `<button class="media-link media-play" data-src="${item.localPath}" data-title="${item.title}" data-idx="${idx}">▶ Riproduci</button>` : ""}
        ${isVideo && ytId ? `<a class="media-link media-yt" href="https://www.youtube.com/watch?v=${ytId}" target="_blank" rel="noreferrer">▶ Guarda su YouTube</a>` : ""}
        <button class="media-link media-add-queue" data-idx="${idx}">+ Coda</button>
        ${href && !localAudio(item) && !isVideo ? `<a class="media-link" href="${href}" target="_blank" rel="noreferrer">${label} →</a>` : ""}
        ${!href && !isVideo ? `<span class="media-link">Indicizzato</span>` : ""}
      </div>
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
      <button class="collection-card" data-collection="video"><span>${formatNumber(s.video)}</span><strong>Video</strong><em>Predicazioni e corsi su YouTube.</em></button>
      <button class="collection-card" data-collection="documents"><span>${formatNumber(s.downloads)}</span><strong>Documenti</strong><em>PDF e risorse scaricabili.</em></button>
      <button class="collection-card" data-collection="pending"><span>${formatNumber(pending)}</span><strong>Da completare</strong><em>Niente perso: tutto tracciato.</em></button>
    </div>
  `;
}

function mediaFeaturedItem() {
  return state.media.find((item) => localAudio(item) && /grazia|spirito|regno|fuoco|occhi|miracoli/i.test(item.title)) || state.media.find(localAudio) || null;
}

function mediaPlaylistItems(term, limit = 5) {
  const q = term.toLowerCase();
  return state.media
    .filter(localAudio)
    .filter((item) => `${item.title} ${(item.tags || []).join(" ")} ${item.year || ""}`.toLowerCase().includes(q))
    .slice(0, limit);
}

function playlistCard(title, copy, term, accent) {
  const items = mediaPlaylistItems(term);
  return `
    <article class="playlist-card" style="--playlist-accent:${accent}">
      <span class="card-index">Playlist</span>
      <h3>${title}</h3>
      <p>${copy}</p>
      <div class="playlist-stack">
        ${items.map((item) => {
          const idx = state.media.indexOf(item);
          return `<button class="playlist-track media-play" data-src="${item.localPath}" data-title="${item.title}" data-idx="${idx}"><strong>${item.title}</strong><span>${item.year || "Archivio"}</span></button>`;
        }).join("") || `<span class="playlist-empty">Contenuti in indicizzazione</span>`}
      </div>
    </article>
  `;
}

function mediaCenter() {
  const featured = mediaFeaturedItem();
  const section = template(`
    <section id="media" class="media-center">
      <div class="section reveal media-platform">
        <div class="media-hero-card">
          <div>
            <p class="eyebrow">Archivio Media</p>
            <h2 class="section-title">Ascolta. Studia. Ricorda. Riparti.</h2>
            <p class="section-copy">Non una lista infinita: una piattaforma viva per attraversare musica, predicazioni, corsi iChurch, documenti e memoria storica senza perdere il filo spirituale.</p>
            <div class="hero-actions">
              ${featured ? `<button class="btn primary media-play" data-src="${featured.localPath}" data-title="${featured.title}" data-idx="${state.media.indexOf(featured)}">▶ Riproduci: ${featured.title}</button>` : ""}
              <a class="btn" href="#downloads">Apri risorse storiche</a>
            </div>
          </div>
          <div class="media-now-card">
            <span class="card-index">In evidenza</span>
            <strong>${featured ? featured.title : "Archivio in caricamento"}</strong>
            <p>${featured ? `${featured.year || ""} · ${humanCategory(featured.category)} · ${humanStatus(featured.status)}` : "Le risorse saranno mostrate appena disponibili."}</p>
          </div>
        </div>

        <div class="playlist-grid">
          ${playlistCard("Grazia", "Canti e predicazioni che raccontano la sovrabbondanza di Dio.", "grazia", "#f2d48a")}
          ${playlistCard("Fuoco & Adorazione", "La memoria musicale di Infuocati per Dio e delle notti di adorazione.", "infuo", "#ff7a3a")}
          ${playlistCard("Regno e Identità", "Percorsi formativi per crescere in autorità, eredità e visione.", "regno", "#9bd4ff")}
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
  const venues = [
    ["Catania", "Comunità Giubileo", "Via Urania", "Domenica 18:00", "Pre-culto, comunione, adorazione e Parola. Una famiglia che celebra il Regno di Dio.", "⛪"],
    ["Palermo", "Comunità Senza Misura", "Via Giuseppe Cirincione 64", "Domenica 10:00", "Una famiglia che celebra il Regno di Dio con gioia, fede e presenza.", "⛪"],
    ["Intercessione", "Preghiera settimanale", "Online e in presenza", "Settimanale", "Preghiera per città, regione, nazione, autorità e missione. Il battito spirituale del ministero.", "🙏"],
    ["Missioni", "CuoreAfrica & Network", "Italia · Africa · Mondo", "Continuativo", "Presenza, servizio e continuità missionaria dal 2008. Ogni missione è un seme di vita.", "🌍"],
  ];
  return template(`
    <section id="events" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Eventi & Sedi</p>
        <h2 class="section-title">La presenza ha un ritmo.</h2>
        <p class="section-copy">Domenica, intercessione, scuola biblica, missioni: non orari statici, ma porte d'ingresso per una famiglia che si riunisce nella Presenza di Dio.</p>
      </div>
      <div class="venue-grid">
        ${venues.map(([city, name, addr, when, desc, icon]) => `
          <article class="venue-card">
            <div class="venue-icon">${icon}</div>
            <div class="venue-body">
              <span class="card-index">${city}</span>
              <h3>${name}</h3>
              <p class="venue-when">${when}</p>
              <p class="venue-addr">${addr}</p>
              <p class="venue-desc">${desc}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `);
}

function testimoniesSection() {
  return template(`
    <section class="section reveal testimony-section">
      <div class="section-header">
        <p class="eyebrow">Testimonianze</p>
        <h2 class="section-title">Dai file scaricati alle vite trasformate.</h2>
        <p class="section-copy">Ogni risorsa gratuita è un seme. Ogni download è una vita raggiunta. Queste sono le voci che raccontano cosa significa ricevere senza misura.</p>
      </div>
      <div class="testimony-grid">
        ${testimonials.map(([title, copy]) => `<article class="testimony-card"><span class="testimony-mark">“</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}
      </div>
      <div class="testimony-quote">
        <p>“Gratuitamente avete ricevuto, gratuitamente date.”</p>
        <span>Matteo 10:8 · il cuore di Senza Misura</span>
      </div>
    </section>
  `);
}

function donationsSection() {
  return template(`
    <section id="donations" class="section reveal">
      <div class="donation-panel">
        <div class="donation-copy">
          <p class="eyebrow">Partecipa</p>
          <h2>Preserva l’eredità. Alimenta il futuro.</h2>
          <p>Sostieni la migrazione, l'archivio media, le missioni e la diffusione gratuita delle risorse. Ogni donazione è un seme che moltiplica accesso, formazione e speranza.</p>
        </div>
        <div class="donation-options">
          <a class="donation-card primary" href="https://www.paypal.me/adoratore" target="_blank" rel="noreferrer">
            <span class="donation-icon">💳</span>
            <strong>PayPal</strong>
            <p>Dona subito con PayPal. Veloce, sicuro, qualsiasi importo.</p>
          </a>
          <a class="donation-card" href="https://wa.me/393286035200" target="_blank" rel="noreferrer">
            <span class="donation-icon">📱</span>
            <strong>WhatsApp</strong>
            <p>Scrivi per info su bonifico, 5x1000 e donazioni missionarie.</p>
          </a>
          <a class="donation-card" href="mailto:info@senzamisura.org">
            <span class="donation-icon">✉</span>
            <strong>Email</strong>
            <p>Contatta il ministero per partnership e progetti specifici.</p>
          </a>
        </div>
        <div class="donation-trust">
          <span>"Gratuitamente avete ricevuto, gratuitamente date."</span>
          <em>Matteo 10:8</em>
        </div>
      </div>
    </section>
  `);
}

function blogSection() {
  return template(`
    <section id="blog" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Blog & Riflessioni</p>
        <h2 class="section-title">Racconti, non semplici aggiornamenti.</h2>
        <p class="section-copy">La visione raccontata con ritmo editoriale: storia, dottrina, missione, testimonianze e cultura del Regno. Presto articoli completi, per ora i temi che guideranno la narrazione.</p>
      </div>
      <div class="blog-grid">
        ${blogPosts.map(([title, copy], i) => `<article class="blog-card"><span class="card-index">${String(i+1).padStart(2,"0")} · Editoriale</span><h3>${title}</h3><p>${copy}</p><span class="blog-read">In arrivo →</span></article>`).join("")}
      </div>
    </section>
  `);
}

function contactSection() {
  return template(`
    <section id="contacts" class="section reveal">
      <div class="contact-panel">
        <div class="contact-locations">
          <p class="eyebrow">Sedi</p>
          <h2>Una casa. Due città. Una famiglia.</h2>
          <div class="contact-cities">
            <div class="contact-city">
              <strong>Catania</strong>
              <span>Via Urania</span>
              <em>Domenica 18:00</em>
            </div>
            <div class="contact-city">
              <strong>Palermo</strong>
              <span>Via Giuseppe Cirincione 64</span>
              <em>Domenica 10:00</em>
            </div>
          </div>
        </div>
        <div class="contact-direct">
          <p class="eyebrow">Contatti diretti</p>
          <h2>Scrivi, chiama, partecipa.</h2>
          <div class="contact-channels">
            <a href="mailto:info@senzamisura.org"><span>✉</span><div><strong>Email</strong><em>info@senzamisura.org</em></div></a>
            <a href="https://wa.me/393286035200" target="_blank" rel="noreferrer"><span>📱</span><div><strong>WhatsApp</strong><em>+39 328 6035200</em></div></a>
          </div>
        </div>
      </div>
    </section>
  `);
}

function audioDock() {
  return template(`
    <aside class="audio-dock" id="audioDock" aria-live="polite" hidden>
      <div class="dock-header">
        <div class="dock-info">
          <span class="card-index">In ascolto</span>
          <strong id="audioTitle">Audio</strong>
        </div>
        <div class="dock-controls">
          <button id="dockSeekBack" class="dock-btn" aria-label="Indietro 15 secondi" title="Indietro 15s">⟲15</button>
          <button id="dockPrev" class="dock-btn" aria-label="Traccia precedente" title="Precedente">⏮</button>
          <button id="dockPlayPause" class="dock-btn dock-play" aria-label="Play/Pausa" title="Play/Pausa">▶</button>
          <button id="dockNext" class="dock-btn" aria-label="Traccia successiva" title="Successiva">⏭</button>
          <button id="dockSeekFwd" class="dock-btn" aria-label="Avanti 15 secondi" title="Avanti 15s">15⟳</button>
          <button class="dock-close" id="audioClose" aria-label="Chiudi player">×</button>
        </div>
      </div>
      <div class="dock-progress">
        <span id="dockCurrent">0:00</span>
        <input type="range" id="dockSeek" class="dock-seek" min="0" max="100" value="0" step="0.1" aria-label="Posizione traccia" />
        <span id="dockDuration">0:00</span>
      </div>
      <audio id="audioPlayer" preload="metadata"></audio>
      <div id="queueList" class="dock-queue"></div>
    </aside>
  `);
}

function footer() {
  return template(`
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-mark">SM</div>
          <div>
            <strong>Senza Misura</strong>
            <p>Piattaforma di memoria viva · nessuna memoria perduta.</p>
          </div>
        </div>
        <nav class="footer-nav" aria-label="Navigazione footer">
          <a href="#media">Archivio</a>
          <a href="#ministries">Ministeri</a>
          <a href="#events">Sedi</a>
          <a href="#donations">Donazioni</a>
          <a href="#contacts">Contatti</a>
        </nav>
        <div class="footer-contact">
          <a href="mailto:info@senzamisura.org">info@senzamisura.org</a>
          <a href="https://wa.me/393286035200" target="_blank" rel="noreferrer">+39 328 6035200</a>
        </div>
      </div>
      <div class="bg-anchor" data-bg-anchor="alba" aria-hidden="true"></div>
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
  const btn = document.querySelector("#dockPlayPause");
  if (!dock || !player || !label) return;
  dock.hidden = false;
  label.textContent = title;
  if (player.getAttribute("src") !== src) player.setAttribute("src", src);
  player.play().catch(() => {});
  if (btn) btn.textContent = "⏸";
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

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
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
    globalSearch.addEventListener("focus", () => {
      const mediaSection = document.querySelector("#media");
      if (mediaSection && !globalSearch.dataset.scrolled) {
        globalSearch.dataset.scrolled = "1";
      }
    });
    globalSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const mediaSection = document.querySelector("#media");
        if (mediaSection) mediaSection.scrollIntoView({ behavior: "smooth", block: "start" });
        const mediaSearchInput = document.querySelector("#mediaSearch");
        if (mediaSearchInput) mediaSearchInput.focus();
      }
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
  const dockPlayPause = document.querySelector('#dockPlayPause');
  const dockSeekBack = document.querySelector('#dockSeekBack');
  const dockSeekFwd = document.querySelector('#dockSeekFwd');
  const dockSeek = document.querySelector('#dockSeek');
  const dockCurrent = document.querySelector('#dockCurrent');
  const dockDuration = document.querySelector('#dockDuration');
  const queueList = document.querySelector('#queueList');
  const player = document.querySelector('#audioPlayer');
  if (dockPrev) dockPrev.addEventListener('click', (e) => { e.stopPropagation(); playPrev(); });
  if (dockNext) dockNext.addEventListener('click', (e) => { e.stopPropagation(); playNext(); });
  if (dockSeekBack) dockSeekBack.addEventListener('click', (e) => { e.stopPropagation(); if (player) player.currentTime = Math.max(0, player.currentTime - 15); });
  if (dockSeekFwd) dockSeekFwd.addEventListener('click', (e) => { e.stopPropagation(); if (player) player.currentTime = Math.min(player.duration || 0, player.currentTime + 15); });
  if (dockPlayPause) dockPlayPause.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!player) return;
    if (player.paused) { player.play().catch(() => {}); dockPlayPause.textContent = "⏸"; }
    else { player.pause(); dockPlayPause.textContent = "▶"; }
  });
  if (dockSeek && player) {
    dockSeek.addEventListener('input', (e) => {
      if (player.duration) player.currentTime = (e.target.value / 100) * player.duration;
    });
    player.addEventListener('timeupdate', () => {
      if (player.duration) {
        dockSeek.value = (player.currentTime / player.duration) * 100;
        if (dockCurrent) dockCurrent.textContent = formatTime(player.currentTime);
      }
    });
    player.addEventListener('loadedmetadata', () => {
      if (dockDuration) dockDuration.textContent = formatTime(player.duration);
    });
    player.addEventListener('ended', () => {
      if (dockPlayPause) dockPlayPause.textContent = "▶";
      playNext();
    });
  }
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

// Closing background: scroll-based detection of which anchor has passed
// the viewport center. The last anchor past center determines the active
// background image. Cross-fades are triggered only on key change (no
// flickering). The layer deactivates when scrolling back above the zone.
function wireClosingBackground() {
  const bg = document.querySelector(".closing-bg");
  if (!bg) return;
  const layers = {
    adorazione: bg.querySelector('[data-bg="adorazione"]'),
    bibbia:     bg.querySelector('[data-bg="bibbia"]'),
    croce:      bg.querySelector('[data-bg="croce"]'),
    alba:       bg.querySelector('[data-bg="alba"]'),
  };
  const anchorNodes = Array.from(document.querySelectorAll("[data-bg-anchor]"));
  if (!anchorNodes.length) return;

  let currentKey = null;
  let rafId = null;

  function update() {
    rafId = null;
    const center = window.innerHeight / 2;
    const lastAnchor = anchorNodes[anchorNodes.length - 1];
    const lastAnchorRect = lastAnchor.getBoundingClientRect();
    const nearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 50);

    let activeKey = null;
    for (const anchor of anchorNodes) {
      if (anchor.getBoundingClientRect().top <= center) {
        activeKey = anchor.getAttribute("data-bg-anchor");
      }
    }

    if (nearBottom && !activeKey && lastAnchorRect.top < window.innerHeight) {
      activeKey = lastAnchor.getAttribute("data-bg-anchor");
    }

    bg.classList.toggle("active", activeKey !== null);

    if (activeKey !== currentKey) {
      currentKey = activeKey;
      Object.entries(layers).forEach(([k, layer]) => {
        if (layer) layer.classList.toggle("visible", k === activeKey);
      });
    }
  }

  function onScroll() {
    if (rafId === null) rafId = requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
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

    // map first images into REAL keys (best-effort) — preserve local paths
    const imgPick = (i) => allImages[i] || allImages[0] || REAL.corrado;
    REAL.corrado = imgPick(0);
    if (!REAL.gruppo || !REAL.gruppo.startsWith("/media/")) REAL.gruppo = imgPick(1);
    if (!REAL.adorazione || !REAL.adorazione.startsWith("/media/")) REAL.adorazione = imgPick(2);
    if (!REAL.humanResources || !REAL.humanResources.startsWith("/media/")) REAL.humanResources = imgPick(3) || REAL.humanResources;
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
    closingBackground(),
    nav(),
    el("main", { id: "main" }, [
      hero(),
      experiencePathsSection(),
      statsSection(),
      manifestoSection(),
      visionMissionSection(),
      heroSequenceSection(),
      leadershipSection(),
      bgAnchor("adorazione"),
      timelineSection(),
      mediaCenter(),
      resourcesSection(),
      downloadsSection(),
      bgAnchor("bibbia"),
      eventsSection(),
      testimoniesSection(),
      blogSection(),
      bgAnchor("croce"),
      contactSection(),
      donationsSection(),
      audioDock(),
    ]),
    footer(),
  );
  const fab = document.createElement("a");
  fab.href = "https://wa.me/393286035200";
  fab.target = "_blank";
  fab.rel = "noreferrer";
  fab.className = "fab-whatsapp";
  fab.setAttribute("aria-label", "Contattaci su WhatsApp");
  fab.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span class="fab-pulse"></span>`;
  document.body.appendChild(fab);
  const fabMail = document.createElement("a");
  fabMail.href = "mailto:info@senzamisura.org";
  fabMail.className = "fab-email";
  fabMail.setAttribute("aria-label", "Scrivici una email");
  fabMail.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><span class="fab-email-pulse"></span>`;
  document.body.appendChild(fabMail);
  wireMediaControls();
  populateFilters();
  revealOnScroll();
  wireClosingBackground();

  if (window.matchMedia("(max-width: 759px)").matches) {
    const heroImg = document.getElementById("hero-img");
    if (heroImg) heroImg.src = HERO_MOBILE;
  }
}

init();
