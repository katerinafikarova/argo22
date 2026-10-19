# Argo22 Brand 2.0 · prezentace konceptu „Dvakrát měř. Jednou řeš.“

Statická HTML prezentace (13 slidů, 1920 × 1080, škáluje se do okna) pro výběrové řízení na refresh značky Argo22.
Autoři konceptu: Kateřina Fikarová, Matěj Plaňanský. Pracovní soubor: Figma „Argo22“.

## Struktura

- `index.html` – všechny slidy, každý je `<section class="slide …" aria-label="…">`
- `styles.css` – tokeny, typografie, animace (zvýrazňovač, hladina, takt, proud)
- `app.js` – navigace (šipky, mezerník, swipe, stupnice dole), škálování, generování stupnic a pásek
- `assets/` – mockupy a fotky merche

Žádný build, žádné závislosti. Otevři `index.html` v prohlížeči nebo spusť `python3 -m http.server`.
Písmo Geist a Geist Mono se načítá z Google Fonts.

## Nasazení

GitHub Pages z repozitáře `katerinafikarova/argo22`, větev `main`, kořen `/`.
Změny: commit + push do `main`, stránka se aktualizuje zhruba do minuty na https://katerinafikarova.github.io/argo22/
Repozitář je veřejný.

## Koncept v kostce

- Claim: „Dvakrát měř. Jednou řeš.“ (přísloví, ž → š: od řemesla k řešení celého produktu). 22 = dvakrát dva.
- Archetyp ze zadání: Tvůrce 70 % (řeš), Mudrc 30 % (měř). Jádro: doložitelná odpovědnost.
- Nosný prvek: takt z lomítek a dvojek končící „22“; jako stupnice + žlutá hladina, která stoupá a vlní se.
- Ponorové značky 16–22: nenápadný odkaz na loď Argó bez kreslení lodi.
- Zvýrazňovač (`.mk` plocha, `.ul` podtržení): jednou na formát, jen fakt nebo klient.
- Poznámka ²²: každé tvrzení má pod čarou důkaz v Geist Mono.

## Barvy a typo

`--ink #0E0E0D`, `--white #FFFFFF`, `--paper #F3F2EC`, `--yel #F5F500` (žlutá je dána zadáním, neměnit).
Geist 600 pro display, Geist 400 pro text, Geist Mono pro poznámky a popisky.

## Pravidla ze zadání (nedělat)

- Doslovná antika: loď, plachta, kotva, vlny jako ikona, rouno, sloupy, meandry. Hrdinský patos.
- Dům, střecha, půdorys jako obraz „jedné střechy“.
- Tech klišé: modré gradienty, svítící sítě, stock fotky u notebooků.
- Změna loga, názvu nebo žluté. Druhé logo / sub-brand (pozor na zkratku A22).
- Křik: zvýraznění max. jednou na formát.

## Konvence v kódu

- Každý slide má v hlavičce číslo `NN / 13` – při přidání/odebrání slidu přečísluj všechny.
- Patička `.src` odkazuje na část zadání („Ze zadání 06 …“), drž to u nových slidů.
- Animace jsou CSS transitions spouštěné třídou `.is-active`; `prefers-reduced-motion` je vypíná.
- Pásky: `<div class="takt" data-n data-every data-h data-amp>`, generuje je `app.js`.
- Hladina: `.gauge > .water[style="--lvl:…%"]` + SVG `.surf`.

## Nástroj Měřítko copy

- Cesta: `copy/index.html`, URL https://katerinafikarova.github.io/argo22/copy/
- Skládá copy podle systému „Dvě věty, jedno číslo, jeden důkaz“: věta měř (číslo), věta řeš (význam), poznámka ²² (zdroj).
- Je čistě pravidlový, bez AI a bez API klíčů, aby běžel na GitHub Pages.
- Šablony: Číslo. Význam. / Od – po / Mnoho : jeden / Dvakrát měř – Jednou řeš / Série.
- Kontroly: chybí číslo, chybí zdroj ²², „až“, „přes“, superlativy, lodě a patos.
- Věty „řeš“ jsou ve funkci `resSentence()`, nové obory se přidávají tam.

## Otevřené body

- Ověřit čísla převzatá z Figmy: E.ON 4,5 / 4,7, „stovky tisíc zákazníků“, „od 2019“; Ochutnej Ořech „od 2022“.
- Slide 10 (Argo Deck 1.0): doplnit skutečné fotky týmu a workshopu místo zástupných.
- Patterny (slide 6) a titulka (slide 10) jsou překreslené z přehledu Figmy, detaily dorovnat podle originálu.
- Logo je zatím vysázený název „Argo22“, nahradit SVG od klienta.
