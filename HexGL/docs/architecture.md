# HexGL — Architecture (état actuel)

Document descriptif, établi par lecture du code. Aucune solution n'est proposée.
Racine du dépôt git : `cc-tp-hexgl/` ; le projet est dans le sous-dossier `HexGL/`.

## 1. Stack et points d'entrée

| Élément | Constat |
|---|---|
| Type | Site statique, jeu de course 3D WebGL, aucun backend, aucun `package.json`, aucun build à l'exécution |
| Langages | JavaScript (ES5, scripts globaux), CoffeeScript (sources partielles) |
| 3D | Three.js r53 (`libs/Three.dev.js` chargé ; `libs/Three.r53.js` présent mais chargé seulement par `bkcore.coffee/tests.html`) |
| Post-traitement | `libs/ShaderExtras.js`, `libs/postprocessing/*` (EffectComposer, RenderPass, BloomPass, ShaderPass, MaskPass…) |
| Divers libs | `Detector.js`, `Stats.js`, `DAT.GUI.min.js`, `leap-0.4.1.min.js` (Leap Motion), `libs/Editor.html` + `libs/Editor_files/` (éditeur tiers embarqué, non référencé par le jeu) |
| Audio | Web Audio API (`bkcore/Audio.js`), fichiers `.ogg` |
| Tests | QUnit 2.26.0 local (`formation/tests/`), lancement navigateur ou Chrome/Edge headless |
| Packaging alternatif | `manifest.webapp`, `package.webapp`, `package.zip`, `cache.appcache` (Firefox OS / appcache), `.htaccess` |

Points d'entrée :
- `index.html` : page unique, contient le menu, les 5 « étapes » (`#step-1` à `#step-5`), les crédits, et charge tous les scripts par balises `<script>` dans un ordre fixe.
- `branding.js` : configuration du branding de l'accueil (objet global `bkcore.Branding`), chargé en `<head>` donc avant tout le reste.
- `launch.js` : script de démarrage (généré par CoffeeScript 1.7.1 depuis `launch.coffee`), chargé en dernier.
- `formation/tests/index.html` : point d'entrée des tests QUnit.

## 2. Flux principal de lancement

1. `index.html` charge d'abord `branding.js` (en `<head>` : pose les couleurs en variables CSS `--brand-*`), puis les libs, les modules `bkcore.*`, `HexGL.js`, et enfin `launch.js`.
2. `launch.js` rappelle `bkcore.Branding.apply(document)` (DOM prêt : logo, message d'accueil, libellés du bouton et des crédits) et construit le menu à partir du tableau `s` (controlType, quality, hud, godmode), dont libellés et valeurs viennent de `bkcore.Branding.menu`. Chaque valeur initiale vient du paramètre d'URL du même nom (`bkcore.Utils.getURLParameter`) sinon d'une valeur par défaut (contrôle tactile si `isTouchDevice()`, qualité 3, HUD 1, godmode 0). Un clic sur une entrée fait avancer la valeur de façon circulaire.
3. Détection WebGL (`hasWebGL`). Sans WebGL, le bouton Start devient un lien vers `get.webgl.org`.
4. Clic sur **Start** → `#step-1` masqué, `#step-2` (image d'aide `css/help-<controlType>.png`) affiché.
5. Clic sur `#step-2` → `#step-3` (barre de progression) + `init(...)` : crée `bkcore.hexgl.HexGL` (`track: 'Cityscape'`, `difficulty: 0`), l'expose en `window.hexGL`, appelle `hexGL.load(...)`.
6. `HexGL.load` → `track.load` → `bkcore.threejs.Loader.load` : charge textures, cubemaps, géométries (JSON Three), « analysers » (PNG de collision et de hauteur lus en pixels), images HUD, sons. Deux listes de ressources selon la qualité (`quality < 2` : matériaux basiques ; sinon : normal maps, spéculaires, cubemap).
7. `onLoad` → `hexGL.init()` (HUD, `track.buildMaterials`, `track.buildScenes`, composer de rendu) puis `hexGL.start()` : boucle `requestAnimationFrame` (`update` → `gameplay.update` + `manager.renderCurrent`) et `initGameplay()` (création de `Gameplay`, `start`, audio `bg` et `wind`).
8. `Gameplay` : compte à rebours 3-2-1-Go (délais pilotés par `Timer`), puis mode `timeattack` : 3 tours, détection des checkpoints en lisant la couleur du pixel de la carte de collision sous le vaisseau (`checkPoint`), fin sur FINISH ou DESTROYED.
9. `onFinish` → `shipControls.terminate()` + `HexGL.displayScore` : affiche `#step-5` avec le temps final ; un clic recharge la page (`window.location.reload()`).
10. Touche Échap : `HexGL.reset()` (redémarre la partie et relance l'audio).

## 3. Modules, fichiers et assets

### Code applicatif (espace de noms global `bkcore`)

| Fichier | Rôle |
|---|---|
| `branding.js` | Seul point de configuration du branding de l'accueil : `name`, `welcome`, `startLabel`, `logo`, `colors` (palette ACME), `menu` (libellés et valeurs en français, message sans WebGL), et `apply(document)` (idempotent, tolère les éléments absents ; si le logo échoue, il est remplacé par le texte « ACME ») |
| `launch.coffee` / `launch.js` | Menu (libellés lus dans `bkcore.Branding.menu`), options, enchaînement des étapes |
| `bkcore/hexgl/HexGL.js` (446 l.) | Orchestrateur : renderer, HUD, composer, difficulté, fin de course, scores |
| `bkcore/hexgl/Gameplay.js` (230 l.) | Machine à états de la course, tours, checkpoints, modes `timeattack` / `survival` / `replay` |
| `bkcore/hexgl/ShipControls.js` (806 l.) | Physique, entrées clavier / tactile / Leap / gamepad / orientation, collisions, hauteur, boost, bouclier |
| `bkcore/hexgl/ShipEffects.js`, `CameraChase.js`, `HUD.js` | Effets visuels du vaisseau, caméra, HUD canvas |
| `bkcore/hexgl/RaceData.js` | Enregistrement / relecture de trajectoire |
| `bkcore/hexgl/Ladder.js` | Classement distant (voir §4) |
| `bkcore/hexgl/tracks/Cityscape.js` (521 l.) | Unique circuit : ressources, matériaux, scènes, spawn, checkpoints |
| `bkcore/threejs/Loader.js`, `Preloader.js`, `RenderManager.js`, `Particles.js`, `Shaders.js` (949 l.) | Chargement, rendu multi-scènes, particules, shaders GLSL |
| `bkcore/Audio.js` | Wrapper Web Audio (repli `<audio>` sans `AudioContext`) |
| `bkcore.coffee/Utils`, `Timer`, `ImageData`, `controllers/{Touch,Orientation,Gamepad}Controller`, `threejs/Particles` | Modules écrits en CoffeeScript, `.js` compilés commités à côté |

Volume : ~4 500 lignes JS applicatives hors `libs/`.

### Assets
- `textures/` (4,2 Mo) et `textures.full/` (5,3 Mo, variante pleine taille ; le README indique d'échanger les deux dossiers à la main).
- `geometries/` (1,3 Mo, JSON Three : vaisseau feisar, circuit, gratte-ciel, bonus, booster).
- `audio/` (2,1 Mo : bg, boost, crash, destroyed, wind en `.ogg`, + fichier `LICENSE`).
- `replays/cityscape-casual/bkcore.replay.json` (604 Ko).
- `css/` : `multi.css`, `fonts.css` (Bebas Neue en eot/svg/ttf/woff), `touchcontroller.css`, images d'aide et de menu. `acme-logo.png` (copie inchangée de `formation/identite/logo.png`, fond blanc opaque) est utilisé par l'accueil ; `bg.jpg` et `title.png` n'y sont plus référencés par le CSS mais restent dans le dépôt.
- `formation/identite/` (charte PDF + logo ACME) et `formation/tickets/company-event.md` : matériel de formation, non utilisés par le jeu.

## 4. Dépendances et zones legacy à risque

- **Versions figées anciennes** : Three.js r53 (API `texture` d'uniform, `Matrix4.n44`, `lerpSelf`, `slerpSelf`, `ShaderUtils`, `computeTangents`, propriétés `physicallyBasedShading` / `shadowMapSoft` du renderer), `getContext("experimental-webgl")`, `ActiveXObject`, `keyCode`, `navigator.MaxTouchPoints`, Leap Motion 0.4.1.
- **Dépendances externes en dur** : Google Analytics `ga.js` (compte `UA-26274524-4`), URLs `hexgl.bkcore.com` (favicon, og:image, partage), `get.webgl.org`, partage Twitter/Facebook dans `displayScore`.
- **Double source CoffeeScript / JS** : les `.js` de `bkcore.coffee/` ont été générés par des versions différentes (1.4.0 pour Timer et ImageData, 1.7.1 pour Utils et launch). Les sources `.coffee` et les `.js` sont commités ensemble ; `bkcore.coffee/threejs/Particles.js` n'est pas chargé (le jeu charge `bkcore/threejs/Particles.js`, de contenu différent). Le reste de `bkcore/` n'a pas de source CoffeeScript. Aucun compilateur CoffeeScript n'est dans le dépôt : `launch.coffee` et `launch.js` sont modifiés à la main et doivent rester synchronisés.
- **Chargement par scripts globaux** : l'ordre des balises `<script>` est la seule gestion de dépendances ; tout passe par l'espace global `bkcore`, `THREE`, `window.hexGL`.
- **Couplage DOM** : `HexGL.js`, `Gameplay`/`HUD`, `launch.js` lisent ou écrivent des ids précis (`step-*`, `main`, `overlay`, `finish*`, `progressbar`) ; `branding.js` lit `brand-logo`, `welcome`, `start`, `s-credits`.
- **Branding de l'accueil (décisions durables)** : une seule configuration globale chargée en `<head>` (pas de JSON/XHR, qui échouerait en `file://`) ; couleurs exposées au CSS par `--brand-*`, `multi.css` n'a plus de couleur de marque en dur pour l'accueil. Chaque liste `values` doit garder 4/4/2/2 entrées (contrôles, qualité, HUD, godmode), sinon le menu affiche « undefined ». Le logo n'est ni recoloré ni étiré (largeur seule fixée) et reste dans un cartouche clair sur fond sombre. Restent au branding d'origine : `<title>`, métadonnées de partage, aide (`#step-2`), chargement, fin de course, contenu des crédits, HUD (en anglais) ; `cache.appcache` ne liste ni le logo ni `branding.js`.
- **Licences** : le README annonce MIT, les en-têtes des fichiers `bkcore/hexgl/*` annoncent CC BY-NC 3.0.
- **Fichiers non utilisés par le jeu** : `Ladder.js` et `Preloader.js` (absents de `index.html`), `libs/Editor*`, `libs/Three.r53.js` (hors tests CoffeeScript), `bkcore.coffee/tests.html` (références `../libs/Three.r53.js`), `textures.full/`, `package.zip`.
- **Mobile / Firefox OS** : `manifest.webapp`, `package.webapp`, `cache.appcache` (contenu de cache non vérifié contre les fichiers réels).
- **Fichier généré à ignorer** : `.gitignore` contient `/HexGL/formation/tests/rapport_erreur.html` (chemin relatif à la racine du dépôt git, un niveau au-dessus de `HexGL/`).

## 5. Fonctions et modules testables automatiquement

### Existant : `formation/tests/`
- `index.html` redirige vers lui-même avec `?hexgl_poc=ok` s'il n'est pas déjà présent, puis charge `vendor/qunit-2.26.0.js`, `../../bkcore.coffee/{Utils,Timer,ImageData}.js`, `../../bkcore/hexgl/Gameplay.js`, `../../branding.js` et `browser-tests.js`.
- `browser-tests.js` pose `data-test-status` / `-count` / `-failures` sur `<html>` à la fin de QUnit ; le statut vaut `pass` seulement si 0 échec **et** au moins 4 tests.
- 23 tests en 5 modules : `bkcore.Utils` (6 : `updateClass`, `getOffsetTop` avec objets simulés, `getURLParameter` avec cache, id inexistant), `bkcore.Timer` (5), `bkcore.ImageData` (4, image 2×2 simulée), `Gameplay` (4 : `checkPoint`, valeurs par défaut) et `bkcore.Branding` (4 : message et bouton, palette hexadécimale, tailles de listes 4/4/2/2, `apply` sur un faux document). Le test `getURLParameter` compare à `"ok"` ou `null` selon la présence de `hexgl_poc=ok` dans l'URL (paramètre injecté par la page elle-même).
- `ci-chrome.sh` (Linux) et `ci-chrome.bat` (Windows) : Chrome/Chromium/Edge headless `--dump-dom`, codes de sortie 0 (réussi) / 1 (échecs) / 2 (impossible), rapport `rapport_erreur.html` supprimé au démarrage et conservé en cas d'erreur.

### Candidats testables sans WebGL ni rendu (`Timer`, `ImageData`, `Gameplay` : déjà en partie couverts, voir ci-dessus ; le reste n'est pas couvert)
| Module | Fonctions | Particularités |
|---|---|---|
| `bkcore.Timer` (`Timer.js`) | `msToTime`, `msToTimeString`, `zfill` (statiques purs) ; `start`/`pause`/`update`/`getElapsedTime` (dépendent de `Date`) | Statiques et `start`/`pause`/`getElapsedTime` testés ; `update` actif (dépend de `Date`) non testé |
| `bkcore.ImageData` | `getPixel`, `getPixelBilinear`, `getPixelF`, `getPixelFBilinear` | Calculs purs sur `this.pixels` ; `getPixel`, `getPixelF`, `getPixelBilinear` testés sur une image 2×2 simulée ; `getPixelFBilinear` non testé |
| `bkcore.Utils` | `getURLParameter` (hors paramètre injecté), `isTouchDevice`, `request` | `getURLParameter` met l'analyse en cache dans `URLParameters` ; `request` utilise `XMLHttpRequest` |
| `bkcore.hexgl.RaceData` | `tick`, `export`, `import`, `reset`, `applyInterpolated` | Dépend de `THREE.Vector3/Quaternion` et d'un `shipControls` factice |
| `bkcore.hexgl.Gameplay` | `checkPoint` (avec `analyser.getPixel` simulé), machine à états `update`/`end` | `checkPoint` et valeurs par défaut testés ; la machine à états `update`/`end` n'est pas testée (`start` exige `shipControls`/`track` simulés) |
| `bkcore.hexgl.Ladder.displayLadder` | Génération HTML du classement | Fichier non chargé par la page |
| `launch.js` | Logique du menu (tableau `s`, cycle des valeurs) | Non exportée : tout est dans une IIFE liée au DOM d'`index.html` |
| `bkcore.hexgl.HexGL.tweakShipControls`, `ShipControls.get*Ratio` | Réglages et ratios purs | Constructeurs liés à Three.js / DOM |

Non testables sans navigateur WebGL : `HexGL.initRenderer`, `initGameComposer`, `Cityscape.buildScenes`/`buildMaterials`, `Shaders`, `RenderManager`, `Audio` (sans `AudioContext`), contrôleurs d'entrée matériels.

## 6. Bugs, dettes et anomalies remarquables

Constats par lecture du code ; les comportements ci-dessous n'ont pas tous été exécutés.

**Menu et paramètres d'URL (`launch.js`)**
1. `getURLParameter` renvoie une chaîne. Avec `?quality=2`, `a[3]` vaut `"2"` ; au clic suivant `a[3] + 1` produit `"21"` (concaténation) puis `% 4`.
2. `hud === 1` (`init`) est faux si `hud` vient de l'URL (`"1"`), donc HUD désactivé.
3. `onError` ne reçoit que `s` et ne fait que `console.error` : une ressource en erreur laisse la barre de progression en place sans message.
4. Le menu Godmode est masqué (`display: none`) mais le paramètre d'URL `godmode` reste lu.

**`HexGL.js`**
5. `JSON.Stringify` (majuscule) dans `displayScore` : `TypeError` si cette branche s'exécute. Elle n'est atteinte que si `gameover` est `null`.
6. Clés `localStorage` `'score-'+t+'-'+d` et `'race-'+t+'-replay'` : `t` est l'objet `track`, d'où `[object Object]` dans la clé. `Gameplay.start` en mode replay lit une clé différente (`'race-'+track.name+'-replay'`).
7. `bkcore.hexgl.Ladder.global[t][d]` est lu dans `displayScore` alors que `Ladder.js` n'est pas chargé ni initialisé.
8. `this.a = window.location.href` ne sert qu'à une condition commentée (`if(this.a[15] == "o")`).
9. `tweakShipControls` existe mais aucun appel n'a été trouvé dans les fichiers lus (la difficulté est fixée à 0 dans `launch.js`).
10. Les messages de fin (`#step-5`) ne montrent que le temps, pas les tours ; `reset` ne réaffiche pas `#step-3`/`#step-4`.

**`Gameplay.js` / `RaceData.js`**
11. `self.result.REPLAY` : `result` est un nombre, la propriété est `undefined` (devrait relever de `results`) ; la fin du replay n'est donc pas gérée.
12. Le mode `survival` est déclaré dans `modes` mais vaut `null` : `this.modes[this.mode].call` planterait s'il était choisi.
13. `RaceData.tick` incrémente `this.rate` au lieu de `this.rateState` : l'échantillonnage « 1 sur rate » ne fonctionne pas, `rate` croît à chaque appel, et l'enregistrement se fait à chaque image.
14. `RaceData.applyInterpolated` lit `this.data[this.seek]` avant de tester `this.seek < 0`, et, quand `seek == last`, continue vers `this.data[this.seek+1]` (`undefined`) après la téléportation sans interpolation.
15. `RaceData.import` fait un `console.log` des données complètes.
16. Dans `checkPoint`, la condition `color.b < 250` et `r == g == 255` encode les identifiants de checkpoint dans la couleur d'un PNG (valeurs magiques).

**`Ladder.js`**
17. Référence `bkcore.Ladder.global` alors que l'objet défini est `bkcore.hexgl.Ladder`.
18. Appelle `bkcore.Utils.request("nothing", false, ...)` : URL fictive.
19. `displayLadder` : test `!x == undefined` toujours faux ; `m` calculé mais inutilisé ; boucle sur `l.length-1`.

**`Utils.js`**
20. `request` : la méthode est `POST` dès que `postData != null`, donc aussi pour `false` (jamais de GET) ; l'URL reçoit `?qdata` à l'intérieur de la boucle (répété) ; la boucle de factory va jusqu'à `i <= length`, indice hors tableau (absorbé par un `try/catch`) ; le corps `qdata` est aussi envoyé avec `send`.
21. `getURLParameter` met en cache au premier appel : une URL modifiée ensuite n'est pas relue (les tests remettent `URLParameters = null` à la main).
22. `projectOnScreen` et `createNormalMaterial` s'appuient sur l'API Three r53.

**`Timer.js` / `ImageData.js`**
23. `msToTime` : clé `ms` dupliquée dans l'objet retourné ; `msToTimeString` remplit `ms` sur 4 chiffres alors que `ms` vaut 0–999.
24. `getPixelF` : `c.r + c.g*255 + c.b*255*255` (base 255, non 256).
25. `ImageData` : `this.image.crossOrigin = "anonymous"` et lecture canvas : échoue en `file://` ou hors CORS ; `getPixel` hors bornes renvoie `{0,0,0,0}` (pas d'erreur).

**`Loader.js` / `Audio.js`**
26. `Loader.loadSound(src, name, loop)` n'a que trois paramètres alors que `load` lui passe `usePanner` en 4e ; `addSound` reçoit donc `usePanner === undefined` et le panoramique 3D n'est jamais activé.
27. Dans `Audio.addSound`, `var audio` est déclaré deux fois ; en cas d'échec du `XMLHttpRequest` audio, `callback` n'est jamais appelé et le chargement global ne se termine pas.
28. Sur `Loader.updateState` : `loadCallback` se déclenche dès que `loaded == total`, sans garde contre un double appel.
29. Les chemins de sons de `Cityscape.js` répètent deux blocs de ressources (LOW / HIGH) quasi identiques.

**Contrôle de la qualité / divers**
30. `Cityscape.load` : un `console.log('HIGH')` reste dans le code ; commentaires « mobile/desktop » devenus sans objet (plus de distinction de plateforme dans le code lu).
31. `HexGL.js` : bloc FXAA commenté ; `quality === 0` divise `width`/`height` par 2 sans mise à jour des listeners de redimensionnement (aucun listener `resize` vu).
32. `index.html` : `<html lang="fr">` (accueil en français, HUD en anglais), titre et crédits en dur, `pointer-events:none` sur `canvas`.

**Tests**
33. Couverture : 5 modules, 23 tests (`Utils`, `Timer`, `ImageData`, `Gameplay` partiel, `Branding`) ; aucun sur `RaceData`, `Ladder`, `launch.js`, `HexGL`, `ShipControls`.
34. Le test `getURLParameter` est déterminé par le paramètre ajouté par la redirection de `index.html` (`hexgl_poc=ok`), donc ne vérifie pas d'autres cas (absent, plusieurs paramètres, valeur vide).
35. Le critère `count >= 4` dans `browser-tests.js` est codé en dur.
36. `rapport_erreur.html` est produit même pour un code 1 par `--dump-dom` (le HTML complet de la page, QUnit inclus).

**Environnement observé lors du lancement**
37. `python -m SimpleHTTPServer` du README est du Python 2 ; sur la machine d'exploration, `python` n'est que le stub du Microsoft Store. Le site a été servi avec `npx http-server` (HTTP 200 sur `index.html`). Un service HTTP est indispensable (`file://` bloque la lecture canvas des cartes de collision, cf. 25) : `python -m http.server 8080` (Python 3) ou `php -S localhost:8080` quand ils existent ; aucun des deux n'est installé sur cette machine, où le port 8080 est parfois déjà pris par un serveur `node`. La vérification de l'accueil et du démarrage de course se fait avec Chrome headless piloté par `--remote-debugging-port` (aucun script conservé dans le dépôt). Piège connu : `?controlType=3` laisse la première valeur inchangée au premier clic (cf. 1).
