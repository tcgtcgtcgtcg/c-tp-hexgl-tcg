# Plan d'implémentation — Accueil ACME (company-event)

Réf. : `work/company-event/spec.md` (E1–E6, critères 1–12). Aucun code touché par ce document.

## Constats utiles (code lu)

- Accueil = `#step-1` dans `index.html` : `#global` (fond `css/bg.jpg`), `#title` (fond `css/title.png`, animé), `#menu` (6 entrées).
- Tous les styles de l'accueil sont dans `css/multi.css` ; les couleurs d'origine y sont en dur (`#4190bb`, `#f66439`, `#f8854b`, voile blanc + `text-shadow` blanc sur `#menu div`).
- Libellés du menu : initialisés dans `index.html` **et** réécrits par `launch.js` à partir du tableau `s` (préfixe + valeurs), puis à chaque clic. Les valeurs sont dans `s`, pas dans le HTML.
- `launch.js` est le compilé de `launch.coffee` (CoffeeScript 1.7.1). Pas de compilateur dans le dépôt : les deux fichiers doivent être modifiés à la main, de façon identique.
- Le libellé WebGL (`'WebGL is not supported!'`) et `Start` sont aussi dans `launch.*` / `index.html`.
- Gameplay, HUD, `bkcore/**` : aucune raison d'y toucher.

## Décisions de mise en œuvre

| Sujet | Choix | Pourquoi |
|---|---|---|
| Asset logo | copier `formation/identite/logo.png` vers `css/acme-logo.png` (fichier inchangé) | le jeu ne doit pas dépendre du dossier `formation/` |
| Logo | `<img>` avec `alt="ACME"`, largeur seule fixée (`height:auto`), dans un cartouche `#E6E8EE`/blanc avec padding | ratio préservé (E1/E6) ; l'`alt` sert de repli si l'image manque (cas limite) |
| Fond | `#global` : fond uni `#08090D` + dégradé `#7628FF → #315BFF` discret ; suppression de `bg.jpg` du CSS | E5 ; sobriété charte §3 |
| Animations | désactiver les flottements `anim`/`animbg` sur l'accueil | « pas d'effets complexes » ; évite aussi un logo qui bouge |
| Police | conserver Bebas Neue (existante, sans-serif) ; **vérifier les accents** (É, è, û…) | charte §2 ; si absents du webfont, ajouter `arial, sans-serif` en repli pour ces glyphes, sans nouvelle webfont |
| Bouton principal | `#start` : fond dégradé violet→bleu, texte blanc, survol cyan | E3/E5, action principale identifiable |
| Entrées de menu | texte blanc, survol cyan, suppression du voile blanc et du `text-shadow` blanc | lisibilité sur fond sombre |
| Libellés | table française dans `launch.*` (`Contrôles : Clavier/Tactile/Leap Motion/Manette`, `Qualité : Basse/Moyenne/Haute/Très haute`, `HUD : Désactivé/Activé`, `Godmode`), `Crédits`, `Démarrer la course`, message WebGL en français | E3/E4 |
| `<html lang>` | `fr` | menu désormais en français |

## Étapes

1. **Baseline.** Lancer `ci-chrome.bat` (doit rester à 0) et conserver les captures existantes `01-accueil.png` / `02-jeu-en-cours.png` comme référence.
2. **Asset.** Ajouter `css/acme-logo.png` (copie binaire de `logo.png`).
3. **`index.html` (accueil seulement).**
   - `<html lang="fr">`.
   - Remplacer le contenu de `#title` par : cartouche + `<img src="css/acme-logo.png" alt="ACME">`, puis un bloc `#welcome` « Bienvenue au ACME Racing Challenge ».
   - Libellés initiaux du menu en français (identiques à ce que `launch.js` écrira, pour éviter un flash en anglais).
   - Ne pas toucher `#step-2…5`, `#credits` (contenu), ni `<title>`/meta (hors périmètre).
4. **`css/multi.css` (blocs accueil uniquement).**
   - `#global` : fond sombre + dégradé, `animation:none`.
   - `#title` : retirer `title.png` et l'animation ; mise en page logo + message centrée, marges de respiration.
   - `#menu` / `#menu div` / `:hover` / `#start` : palette ACME, retrait du voile blanc.
   - Responsive : largeur max du logo en `%`/`vw` plafonnée ; vérifier ~375 px et ≥1920 px ; message sur plusieurs lignes autorisé ; pas de scroll horizontal (déjà `overflow:hidden`, donc vérifier que rien n'est coupé).
   - Ne pas modifier `#step-2`…`#step-5`, `#credits`, `#leapinfo`.
5. **`launch.coffee` puis `launch.js` (même changement).** Remplacer les chaînes du tableau `s`, le texte WebGL ; garder la logique (cycle, URL, handlers) intacte. Libellé `Crédits` / `Démarrer la course` posés côté HTML (déjà dans le markup) — ne pas ajouter de logique nouvelle.
6. **Vérification polices.** Charger l'accueil et contrôler l'affichage de « Contrôles », « Qualité », « Crédits », « Démarrer », « Très haute », « Désactivé » ; appliquer le repli de police si glyphes manquants.
7. **Tests automatiques.** Relancer `ci-chrome.bat` → 0. Pas de test QUnit ajouté : le changement est de la donnée et du CSS, et la logique du menu est dans une IIFE non exportée (`architecture.md` §5) ; l'extraire pour la tester serait un refactoring hors besoin. Le critère 9 est donc couvert par la non-régression + la vérification navigateur ci-dessous.
8. **Vérification navigateur (Chrome headless ou manuelle, serveur statique sur `HexGL/`).**
   - Accueil à 1280×720, ~375×667, 1920×1080 : critères 1–4, 10.
   - Cycle des 3 options + `?quality=2&hud=0&controlType=3` : critère 8 (affichage ; le bug connu « quality=2 → "21" » préexiste et n'est pas corrigé).
   - Parcours complet jusqu'au « GO » + fin de course : critère 6.
   - Cas limites : renommer temporairement `acme-logo.png` (texte « ACME » visible) ; forcer l'absence de WebGL (`--disable-gpu --disable-software-rasterizer` ou stub `getContext`) ; Crédits aller-retour et attributions présentes : critères 11, 12.
9. **Captures.** Régénérer `01-accueil.png` (nouvel accueil) ; recapturer la course et la comparer à `02-jeu-en-cours.png` : critère 7. Mettre à jour la ligne « Captures de référence » de `CLAUDE.md` si l'accueil de référence change de sens (l'ancienne capture devient « avant refactoring »). Ne pas écraser l'ancienne `01-accueil.png` sans la renommer (`01-accueil-avant.png`).
10. **Relecture du diff.** Seuls `index.html` (zone `#step-1` + `lang`), `css/multi.css` (blocs accueil), `launch.coffee`/`launch.js`, `css/acme-logo.png`, captures. Aucun fichier `bkcore/**`.

## Risques

- **Accents Bebas Neue** : webfont ancien (Font Squirrel 2012), glyphes accentués possibles absents → étape 6.
- **`launch.js` / `.coffee` désynchronisés** : pas de compilateur ; relire les deux à la main.
- **`cache.appcache` / `manifest.webapp`** : l'asset ajouté n'y figure pas ; sans conséquence pour un usage navigateur, à signaler si l'appcache est utilisé le jour de l'événement.
- **Logo à fond blanc** : le cartouche clair est un choix imposé ; l'impact visuel (bloc clair sur fond sombre) se juge à la capture.
- **Captures Chrome headless (SwiftShader)** : la comparaison de la course est visuelle, pas au pixel (le rendu varie).
- Le script de capture n'est pas conservé dans le dépôt : à réécrire (CLAUDE.md décrit la méthode).

## Hors plan (rappel spec §7)

Titre d'onglet, og:*, favicon, analytics, écrans 2/3/5, crédits (contenu), HUD, bugs de `architecture.md` §6.
