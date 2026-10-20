# HexGL — notes pour Claude

Description du projet : `docs/architecture.md`.

## Tests (QUnit, sans Node ni npm)
- Windows (PowerShell) : `& .\formation\tests\ci-chrome.bat` — Linux : `bash HexGL/formation/tests/ci-chrome.sh` (depuis la racine du dépôt).
- Codes de sortie : 0 réussi, 1 échec(s), 2 impossible (voir `formation/tests/rapport_erreur.html`, ignoré par git).
- Manuel : ouvrir `formation/tests/index.html` dans Chrome/Edge.
- Tests dans `formation/tests/browser-tests.js` ; scripts testés chargés dans `formation/tests/index.html` (Utils, Timer, ImageData, Gameplay).

## Captures de référence
- `formation/tests/captures/01-accueil.png` (menu) et `02-jeu-en-cours.png` (course après le « GO »), 1280x720, Chrome headless (SwiftShader).
- `02-jeu-en-cours.png` faite le 2026-10-20 avant refactoring ; recapturée après le branding : course et HUD identiques (écart moyen ≈ 6/765 par pixel hors chrono), donc conservée telle quelle. `01-accueil.png` = accueil ACME ; `01-accueil-avant.png` = accueil d'origine (branding HexGL).
- Pour les refaire : servir `HexGL/` en statique (ex. `npx http-server -p 8080`), piloter Chrome headless avec `--remote-debugging-port` (clic sur `#start`, puis `#step-2`, attendre `#step-4` visible + ~9 s). Le script utilisé n'est pas conservé dans le dépôt.

## Branding (accueil)
- Tout le branding de l'accueil (textes, logo, palette, libellés du menu) est dans `branding.js` (`bkcore.Branding`) ; logo : `css/acme-logo.png`. `launch.coffee` et `launch.js` sont à garder identiques à la main.
- Servir `HexGL/` sans Node : `python -m http.server 8080` (Python 3) ou `php -S localhost:8080`.
