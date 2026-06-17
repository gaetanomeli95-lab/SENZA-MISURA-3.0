from pathlib import Path
root = Path(r"E:\SENZA_MISURA_REBORN")
app_path = root / "src" / "app.js"
"""inject_real_sections.py

This script is intentionally disabled to avoid adding a separate "real" section.
If you want to re-enable automated insertion, restore the original script logic.
"""

import sys

print("inject_real_sections disabled; no changes made to app.js or styles.css")
sys.exit(0)
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
