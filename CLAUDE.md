# Argo22 Brand 2.0 · prezentace „Digitální produkty, které plní, co slibují“

Statická HTML prezentace (22 slidů, jeviště 1920 × 1080, škáluje se do okna) pro výběrové řízení na refresh značky Argo22.
Autoři: Kateřina Fikarová, Matěj Plaňanský. Žádný build, žádné závislosti.

## Struktura

- `index.html` – všechny slidy, každý je `<section class="slide …" aria-label="…">`; páska a logo jsou vložené jako `<template>`
- `styles.css` – tokeny (`--yel #F5F500`, `--ink #0E0E0D`), typografie, animace (páska, pruhy, zvýrazňovač, LinkedIn posty)
- `deck.js` – ovládání, škálování, automatické akce ve slidech (`data-auto`: type, scroll, count, tool, video)
- `assets/` – mockupy, video, písmo Outfit, `web-prototyp.html` (slide 11) a `reels-animace.html` (slide 12)
- `copy/` – samostatný nástroj Měřítko copy, s prezentací nesouvisí

## Ovládání

První klik zapne celou obrazovku, každý další klik = další slide, pravé tlačítko = zpět.
Záložně: šipky, PageUp/PageDown (klikr), mezerník, Home/End, F. Žádné tlačítka ani lišta průběhu na obrazovce.
Šipka myši se v klidu po 1,8 s schová. Vložené iframy mají `pointer-events:none`, aby klik patřil prezentaci.
`index.html#7` otevře 7. slide.

## Pravidla

- Oddělovač v popiscích a hlavičkách je ` / ` a po něm velké písmeno (`Instagram / Stories a Reels`).
- Nadpisy `.h1`/`.h2` mají proklad 1,08, aby se čárky a háčky nedotýkaly řádku nad sebou.
- Páska se vždy bere z `<template id="tape-svg">` (zdroj `assets/paska.svg`), v CSS se nekreslí.
- Slide 12 a 14 jsou bez ochranných zón.
- Slide 14 se skládá z vrstev: `li-phone.webp` (telefon s prvním postem) a `li-post1–3.jpg` (posty 4:5), exportované z `LINKEDIN_iphone-18-pro-max-mockup.png` a `LINKEDIN ARGO22 ONLINE2–4.jpg` ve 2× rozlišení.
- Reels animace (slide 12) je `argo22-animace.html` s páskou, zpomalená: nalití 3,5 s, start po 2 s, pauza na konci 5 s.

## Nasazení

GitHub Pages z repozitáře `katerinafikarova/argo22`, větev `main`, kořen `/` → https://katerinafikarova.github.io/argo22/
Commit + push do `main`, stránka se aktualizuje zhruba do minuty. Repozitář je veřejný.
