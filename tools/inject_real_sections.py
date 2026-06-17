from pathlib import Path
root = Path(r"E:\SENZA_MISURA_REBORN")
app_path = root / "src" / "app.js"
css_path = root / "src" / "styles.css"
app = app_path.read_text(encoding="utf-8")
css = css_path.read_text(encoding="utf-8")
functions = r'''
function legacyTruthSection() {
  return template(`
    <section id="radici" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Dai siti originali</p>
        <h2 class="section-title">Qui non cè finzione. Cè memoria reale.</h2>
        <p class="section-copy">I due siti storici contengono parole, scelte, date, missioni, corsi, canti e testimonianze. Questa piattaforma non li sostituisce: li custodisce e li rende finalmente leggibili.</p>
      </div>
      <div class="quote-grid">
        ${legacyHighlights.map(([title, quote, source]) => `
          <article class="quote-card">
            <span class="card-index">${source}</span>
            <h3>${title}</h3>
            <p>${quote}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `);
}
function realArchiveSection() {
  return template(`
    <section id="eredita" class="section reveal">
      <div class="section-header">
        <p class="eyebrow">Eredità concreta</p>
        <h2 class="section-title">Fatti, non slogan.</h2>
        <p class="section-copy">Queste informazioni arrivano dalle pagine originali: Musica, Network Italia, Giubileo, CuoreAfrica e iChurch.</p>
      </div>
      <div class="real-grid">
        ${realPillars.map(([title, copy]) => `<article class="glass-card"><span class="card-index">Originale</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}
      </div>
    </section>
  `);
}
function livingCollectionsSection() {
  return template(`
    <section class="section reveal">
      <div class="living-collections">
        <article>
          <p class="eyebrow">CuoreAfrica</p>
          <h2>Missioni documentate dal 2008 al 2026.</h2>
          <div class="mission-strip">${missionYears.map((year) => `<span>${year}</span>`).join("")}</div>
        </article>
        <article>
          <p class="eyebrow">iChurch</p>
          <h2>Corsi reali, serie complete, anni tracciati.</h2>
          <div class="course-list">${courseCollections.map(([title, meta]) => `<div><strong>${title}</strong><span>${meta}</span></div>`).join("")}</div>
        </article>
        <article>
          <p class="eyebrow">Musica</p>
          <h2>Album e canti preservati.</h2>
          <div class="course-list">${albumExamples.map(([title, year]) => `<div><strong>${title}</strong><span>${year}</span></div>`).join("")}</div>
        </article>
      </div>
    </section>
  `);
}
function finalImageSection() {
  return template(`
    <section class="final-image reveal" aria-label="Senza Misura continua">
      <img src="${HEROES.worship}" alt="Adorazione Senza Misura" loading="lazy" />
      <div>
        <p class="eyebrow">Continua</p>
        <h2>La pagina non finisce nel nero. Rimane una presenza.</h2>
      </div>
    </section>
  `);
}
'''
if "function legacyTruthSection()" not in app:
    app = app.replace("\nfunction statsSection() {", "\n" + functions + "\nfunction statsSection() {")
if "legacyTruthSection()," not in app:
    app = app.replace("      heroSequenceSection(),\n      statsSection(),", "      heroSequenceSection(),\n      legacyTruthSection(),\n      statsSection(),")
if "realArchiveSection()," not in app:
    app = app.replace("      visionMissionSection(),\n      storySection(),", "      visionMissionSection(),\n      realArchiveSection(),\n      livingCollectionsSection(),\n      storySection(),")
if "finalImageSection()," not in app:
    app = app.replace("      contactSection(),\n      donationsSection(),", "      contactSection(),\n      finalImageSection(),\n      donationsSection(),")
css_block = r'''
.quote-grid,
.real-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}
.quote-card {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border: 1px solid rgba(244,213,141,.24);
  border-radius: calc(var(--radius) + 10px);
  padding: clamp(1.3rem, 4vw, 2.4rem);
  background:
    radial-gradient(circle at 20% 0%, rgba(216,177,95,.20), transparent 18rem),
    linear-gradient(180deg, rgba(255,255,255,.085), rgba(255,255,255,.035));
  box-shadow: var(--shadow);
}
.quote-card h3 {
  margin: .75rem 0 1rem;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: .95;
  letter-spacing: -.045em;
  font-weight: 500;
}
.quote-card p {
  color: rgba(248,244,234,.82);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
}
.living-collections {
  display: grid;
  gap: 1rem;
}
.living-collections article {
  border: 1px solid var(--line);
  border-radius: calc(var(--radius) + 10px);
  padding: clamp(1.3rem, 4vw, 2.6rem);
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.035));
  box-shadow: var(--shadow);
}
.living-collections h2 {
  margin: 0 0 1rem;
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 4.8rem);
  line-height: .95;
  letter-spacing: -.05em;
  font-weight: 500;
}
.mission-strip,
.course-list {
  display: grid;
  gap: .65rem;
}
.mission-strip {
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
}
.mission-strip span,
.course-list div {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: .75rem .85rem;
  background: rgba(255,255,255,.06);
  color: var(--muted);
}
.course-list div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.course-list strong { color: var(--ink); }
.course-list span { color: var(--gold-2); white-space: nowrap; }
.final-image {
  position: relative;
  min-height: 72svh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  isolation: isolate;
  margin-top: clamp(2rem, 6vw, 5rem);
}
.final-image img {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(.72) saturate(.9);
}
.final-image::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(0deg, rgba(5,5,5,.58), rgba(5,5,5,.12) 48%, rgba(5,5,5,.28)),
    radial-gradient(circle at 25% 70%, rgba(216,177,95,.24), transparent 28rem);
}
.final-image > div {
  width: min(var(--max), calc(100% - 2rem));
  margin: 0 auto;
  padding: clamp(2.5rem, 7vw, 6rem) 0;
}
.final-image h2 {
  max-width: 900px;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 7rem);
  line-height: .92;
  letter-spacing: -.055em;
  font-weight: 500;
}
.footer {
  background: linear-gradient(180deg, rgba(5,5,5,.22), #050505 82%);
}
@media (min-width: 760px) {
  .quote-grid { grid-template-columns: repeat(2, 1fr); }
  .real-grid { grid-template-columns: repeat(3, 1fr); }
  .living-collections { grid-template-columns: 1.15fr 1fr 1fr; }
}
'''
if ".quote-grid," not in css:
    css = css.replace("\n.reveal { opacity: 0;", "\n" + css_block + "\n.reveal { opacity: 0;")
app_path.write_text(app, encoding="utf-8")
css_path.write_text(css, encoding="utf-8")
print("inserted-real-sections")
