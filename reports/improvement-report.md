# CHIESA EVANGELICA SENZA MISURA — Improvement Report

> Analisi UX, Design, Navigazione, Branding, Velocità, Accessibilità e Storytelling
> Data: 16 giugno 2026

---

## 1. DESIGN

### Stato attuale
- Template **Wix datato**, visibilmente generico.
- **Banner Wix** presente in ogni pagina ("Questo sito è stato realizzato con Wix") — distrae e declassa il brand.
- Nessuna **palette colore** definita nel codice; colori di default Wix.
- Tipografia standard, nessun font personalizzato.
- Nessun sistema di **griglia** o spaziatura coerente.
- Assenza di **microinterazioni**, animazioni o transizioni.
- Layout apparentemente non ottimizzato per mobile (struttura Wix classica).

### Problemi critici
1. **Mancanza di identità visiva** — Non emerge un logo, un simbolo o un colore rappresentativo del ministero.
2. **Inconsistenza tra pagine** — Ogni pagina sembra avere una struttura leggermente diversa.
3. **Banner pubblicitario Wix** — Rompe l'immersione e comunica "amatoriale".
4. **Assenza di immagini di qualità** — Il contenuto è prevalentemente testuale; le poche immagini sono link esterni (Facebook).

### Raccomandazioni
- Sviluppare un **logo** e un **sistema visivo** coerente (colore primario, secondario, font heading/body).
- Creare un **design system** con componenti riutilizzabili (card, bottoni, form, hero).
- Implementare **white space** e gerarchia tipografica chiara.
- Rimuovere ogni branding di piattaforma terza.

---

## 2. ESPERIENZA UTENTE (UX)

### Stato attuale
- **Homepage** povera di contenuto: un breve messaggio di benvenuto e due CTA generici.
- **Menu sovraccarico**: 11 voci principali + sottomenu annidati.
- **Testo concatenato** nel menu: "PredicazioniiChurchPredicazioni 2019..." — errore di rendering grave.
- Nessun **percorso utente** definito: un nuovo visitatore non sa dove cliccare per "iniziare".
- Manca una sezione "**Chi siamo**" chiara e immediata.
- I **contenuti più pregiati** (iChurch, musica) sono sepolti in sottomenu.

### Problemi critici
1. **Cognitive overload** — Troppo testo, troppi link, nessuna prioritizzazione.
2. **Manca onboarding** — Nessuna spiegazione di chi è Corrado Salmé o cosa è Senza Misura per chi arriva per la prima volta.
3. **CTA deboli** — "Vai alla pagina" è generico; mancano CTA come "Inizia il tuo percorso", "Ascolta la musica", "Sostieni il ministero".
4. **Assenza di search** — Impossibile trovare una predicazione o un canto specifico.

### Raccomandazioni
- Homepage con **Hero video** + claim + 3 call-to-action principali.
- Sezione "**Per chi è questo sito?**" con 3 target: nuovo visitatore, membro, sostenitore.
- **Ridurre il menu** a: Chi Siamo, Network, CuoreAfrica, Formazione, Musica, Predicazioni, Contatti, Dona.
- Aggiungere **barra di ricerca** globale per predicazioni, corsi e musica.
- Implementare **breadcrumb** nelle sezioni profonde (iChurch, Predicazioni).

---

## 3. NAVIGAZIONE

### Stato attuale
- Menu principale ripetuto **due volte** in alcune pagine (header + corpo).
- Link alle **predicazioni annuali** (2014-2019) non funzionanti o poco mantenute.
- Sottomenu "Predicazioni" confuso con link a iChurch.
- Pagina "Appuntamenti" esiste ma è **vuota**.
- Nessuna **footer navigation** strutturata.

### Problemi critici
1. **Menu duplicato** — Crea confusione e spreco di spazio.
2. **Link rot** — I link alle predicazioni annuali potrebbero non funzionare.
3. **Flat architecture mal gestita** — Tutto è allo stesso livello, senza gerarchia logica.
4. **Manca footer** — Nessuna navigazione secondaria, nessun link a privacy policy, nessuna iscrizione newsletter.

### Raccomandazioni
- **Unificare la navigazione** in un header unico, responsive (hamburger su mobile).
- **Raggruppare** contenuti correlati:
  - Formazione: iChurch + Predicazioni
  - Ministeri: Giubileo + Network + CuoreAfrica
- Aggiungere **footer** con: link utili, social, newsletter, privacy, credits.
- Implementare **redirect 301** per i link rotti.

---

## 4. BRANDING

### Stato attuale
- Il nome **"SenzaMisura"** è potente, biblico (Giovanni 3:34), memorabile.
- Il brand è **fortemente legato** alla figura di Corrado Salmé (fondatore, predicatore, musicista, intercessore).
- **Manca un claim/tagline** oltre al testo della homepage.
- Non emerge un **logo** dal contenuto testuale estratto.
- Il dominio senzamisura.org reindirizza a Wix — perdita di autorità SEO e controllo.

### Problemi critici
1. **Personal branding vs Corporate branding** — Il ministero rischia di essere identificato solo con Corrado. Se necessario, prevedere una strategia di successione.
2. **Mancanza di brand guidelines** — Nessuna coerenza cromatica o tipografica.
3. **Nome ministero non spiegato** — Un visitatore non cristiano non capisce il riferimento biblico.
4. **Dominio declassato** — Wix subdomain (adoratore.wixsite.com) anziché dominio proprio.

### Raccomandazioni
- Sviluppare un **logo** con il concetto di "misura traboccante / grazia senza limiti".
- Creare un **claim** esplicativo: *"Senza Misura — La Grazia che trabocca"* o simile.
- **Spiegare il nome**: aggiungere una sezione "Perché Senza Misura?" con Giovanni 3:34.
- Ritornare al dominio **senzamisura.org** o acquistare un dominio più moderno se necessario.
- Definire **Brand Book**: colori, font, tono di voce, immagini, iconografia.

---

## 5. VELOCITÀ

### Stato attuale
- Wix è notoriamente **pesante**: codice JavaScript abbondante, caricamento lento.
- I file **MP3** sono hostati su `senzamisura.org` (server separato), potenzialmente lento o non ottimizzato per CDN.
- **Link esterni** (YouTube, Facebook) possono bloccare il rendering se embeddati male.
- Nessuna **lazy loading** evidente per immagini o video.

### Problemi critici
1. **Time to First Byte (TTFB)** — Wix server condiviso, lento per utenti italiani se server è all'estero.
2. **Page weight** — Wix carica molti script non necessari.
3. **Audio non compresso** — MP3 a bitrate elevato possono pesare molto.

### Raccomandazioni
- Migrare da Wix a una piattaforma moderna (es. Next.js, Astro, o almeno WordPress ottimizzato).
- Utilizzare una **CDN** per file statici (Cloudflare, Bunny CDN).
- Comprimere MP3 a bitrate ottimizzato per lo streaming (128kbps).
- Implementare **lazy loading** per immagini e iframe (YouTube).
- Usare **preload** solo per risorse critiche (CSS, font).

---

## 6. ACCESSIBILITÀ

### Stato attuale
- Nessuna indicazione di **ARIA labels** o ruoli.
- Nessuna **alternativa testuale** per immagini (dal contenuto estratto).
- Nessun **contrasto colore** verificabile (palette assente).
- Font size non dichiarato, possibile problema su mobile.
- Nessun **skip-to-content** o navigazione da tastiera evidente.
- Nessuna dichiarazione di **conformità WCAG**.

### Problemi critici
1. **Screen reader** — Il menu concatenato ("PredicazioniiChurch...") è illeggibile.
2. **Focus indicator** — Wix classico ha spesso problemi di visibilità del focus.
3. **Colori** — Se i colori sono pastello o basso contrasto, utenti con disabilità visive non leggono.

### Raccomandazioni
- Audit completo con **Lighthouse** e **axe DevTools**.
- Contrasto minimo **4.5:1** per testo normale, **3:1** per grandi testi.
- Aggiungere `alt` descrittivi a tutte le immagini.
- Implementare **focus visibile** su tutti gli elementi interattivi.
- Testare con **NVDA / VoiceOver**.
- Aggiungere dichiarazione di accessibilità.

---

## 7. STORYTELLING

### Stato attuale
- La **storia del ministero** è sepolta nella pagina Musica (testimonianza dei 80.000 download).
- La **homepage** ha un buon testo di benvenuto, ma è statico e senza evoluzione.
- Le **missioni Africa** sono solo link a Facebook — nessuna narrazione.
- Manca una sezione **"Testimonianze"** strutturata.
- Il **"perché"** del ministero (il passo di fede del 2006) non è raccontato visivamente.

### Problemi critici
1. **Nessuna timeline** — 20 anni di storia non sono raccontati.
2. **Nessuna galleria** — Foto delle comunità, delle missioni, degli eventi assenti dal sito.
3. **Nessun video di presentazione** — Manca un "chi siamo in 2 minuti".
4. **Testimonianze disperse** — Menzionate nel testo della pagina musica, ma non raccolte in una sezione.

### Raccomandazioni
- **Timeline interattiva** della storia del ministero (2006-2026).
- **Video storytelling**: intervista a Corrado, video dalle missioni, testimonianze.
- **Sezione Testimonianze**: raccolta strutturata con filtri (salvezza, guarigione, famiglia, ministero).
- **Blog / News**: aggiornamenti regolari per dare freschezza al sito.
- **Hero con video** in homepage per trasmettere emozione immediata.

---

## RIEPILOGO DEI PUNTI DEBOLI

| Area | Gravità | Problema principale |
|------|---------|---------------------|
| Design | **Alta** | Template generico, nessuna identità visiva |
| UX | **Alta** | Menu confuso, nessun percorso utente |
| Navigazione | **Alta** | Link duplicati, link rot, no search |
| Branding | **Media** | Nome forte ma sottoutilizzato, nessun logo |
| Velocità | **Media** | Wix lento, audio pesante |
| Accessibilità | **Alta** | No WCAG, menu illeggibile per screen reader |
| Storytelling | **Alta** | Storia nascosta, nessuna testimonianza strutturata |

---

## AZIONI PRIORITARIE

1. **Rimuovere branding Wix** e migrare a piattaforma controllata.
2. **Ridisegnare la navigazione** (max 7 voci + search).
3. **Raccontare la storia in homepage** con video e timeline.
4. **Aggiungere player musicale** integrato.
5. **Creare archivio predicazioni ricercabile**.
6. **Implementare form contatti e donazioni** funzionanti.
7. **Aggiungere sezione testimonianze**.
8. **Ottenere logo e brand book** professionali.
9. **Effettuare audit accessibilità** e fixare problemi critici.
10. **Ottimizzare performance** (CDN, compressione, lazy loading).

---

*Report generato da analisi completa dei siti esistenti.*
