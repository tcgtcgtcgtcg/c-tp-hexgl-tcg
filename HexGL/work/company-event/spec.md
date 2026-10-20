# Spec — Personnalisation événementielle ACME de l'écran d'accueil HexGL

Sources : `formation/tickets/company-event.md` (besoin, source de vérité), `formation/identite/charte_graphique_acme.pdf` v1.0 (contraintes graphiques), `formation/identite/logo.png`, `docs/architecture.md`.

## 1. Contexte et objectif

ACME utilise HexGL lors d'un événement d'entreprise. L'écran d'accueil (menu, `#step-1`) affiche aujourd'hui le branding d'origine (logo/titre HexGL, fond et couleurs d'origine, libellés en anglais).

Objectif : que l'écran d'accueil reflète l'identité visuelle ACME (logo, couleurs, nom de l'entreprise, message d'accueil) **sans toucher au gameplay**. L'intégration doit rester sobre et maintenable (charte §3).

## 2. Exigences fonctionnelles

- **E1 — Logo.** Le logo ACME (`logo.png`) est visible sur l'écran d'accueil, sans déformation (ratio d'origine conservé), avec une zone de respiration autour.
- **E2 — Nom et message d'accueil.** Le message exact « Bienvenue au ACME Racing Challenge » est affiché sur l'accueil (c'est le texte de référence de la charte, y compris la formulation « au »).
- **E3 — Bouton principal.** Le bouton de lancement s'intitule « Démarrer la course ».
- **E4 — Menu en français.** Toutes les entrées du menu de l'accueil sont en français : libellés (Contrôles, Qualité, HUD, Crédits) et valeurs affichées (ex. Clavier, Tactile, Manette ; Basse, Moyenne, Haute, Très haute ; Activé/Désactivé).
- **E5 — Couleurs.** Fond de l'accueil sombre (noir profond `#08090D`) ; accents uniquement dans la palette : violet `#7628FF`, bleu électrique `#315BFF`, cyan `#00C4E8` ; texte blanc `#FFFFFF` ; surfaces secondaires gris clair `#E6E8EE`. Dégradé événementiel autorisé : `#7628FF → #315BFF`. Les couleurs d'origine (bleu `#4190bb`, orange `#f66439`/`#f8854b` du menu) ne subsistent plus sur l'accueil.
- **E6 — Logo sur fond sombre.** Le logo fourni a un fond blanc opaque et aucune version claire n'existe : il est présenté inchangé dans un cartouche clair (blanc ou gris clair de la palette) posé sur le fond sombre, avec marge. Pas de recoloration, d'ombre ni de contour ajouté au logo.

## 3. Comportements attendus

- À l'ouverture de `index.html`, l'accueil montre : logo ACME, message d'accueil, menu en français avec le bouton « Démarrer la course » clairement identifiable comme action principale.
- Le menu reste interactif comme aujourd'hui : chaque entrée d'option fait défiler ses valeurs de façon circulaire, « Crédits » ouvre l'écran des crédits et un clic le referme, le survol donne un retour visuel (couleur d'accent de la palette).
- Les paramètres d'URL existants (`controlType`, `quality`, `hud`, `godmode`) conservent leur effet sur les valeurs initiales ; seule leur présentation est traduite.
- Le déroulement après clic sur « Démarrer la course » est inchangé : aide des contrôles → chargement → compte à rebours → course → écran de fin.
- Lisibilité : texte et logo restent lisibles et nets sur tailles d'écran courantes (de 1280×720 à un écran plus petit/mobile et plus grand/borne).

## 4. Contraintes

- **Gameplay, contrôles et HUD en course strictement inchangés** (charte §3, ticket). Le HUD en course n'est pas rebrandé.
- Logo : fichier fourni utilisé sans étirement, compression, recoloration, ombre ni contour ; jamais sur fond illisible.
- Fond principal sombre, jamais gris moyen dominant ; pas d'effets complexes supplémentaires.
- Typographie : sans-serif lisible, titres en graisse forte. **Aucune nouvelle dépendance webfont** ; la police existante peut être conservée si elle reste lisible et cohérente.
- Pas de dépendance, de build ou d'outillage nouveau : le projet reste un site statique sans Node/npm à l'exécution.
- Le jeu doit fonctionner comme aujourd'hui sans connexion réseau pour ce qui concerne le branding ajouté.

## 5. Décisions de conception déjà imposées

| Sujet | Décision | Origine |
|---|---|---|
| Message d'accueil | « Bienvenue au ACME Racing Challenge » (texte exact) | Charte §3 |
| Bouton principal | « Démarrer la course » | Charte §3 + réponse utilisateur |
| Périmètre des libellés | Tout le menu de l'accueil en français | Réponse utilisateur |
| Logo | Fichier inchangé dans un cartouche clair sur fond sombre | Réponse utilisateur |
| Palette | Valeurs hexadécimales du §2 de la charte, dégradé `#7628FF → #315BFF` | Charte §2 |
| Police | Pas de nouvelle webfont ; existante conservée si lisible | Charte §2 |
| Gameplay / contrôles / HUD | Aucune modification | Ticket + charte §3 |
| Source de vérité du besoin | Le ticket prime ; la charte et le logo sont des contraintes | Demande |

## 6. Cas limites et gestion des erreurs

- **Logo introuvable** (chargement en échec) : l'accueil reste utilisable ; un texte « ACME » doit rester visible à la place, et le menu fonctionne.
- **Sans WebGL** : le comportement actuel est conservé (le bouton principal signale que WebGL n'est pas supporté et mène à la page d'aide), avec un libellé en français cohérent avec le reste du menu.
- **Petits écrans / mobile / orientation portrait** : logo non déformé, message et menu sans chevauchement ni débordement ; pas de défilement horizontal.
- **Très grands écrans (borne)** : le logo ne devient pas flou ni disproportionné ; fond sombre sur toute la surface.
- **Paramètres d'URL invalides** ou valeur hors plage : comportement existant inchangé (pas de régression ni de nouveau plantage) ; les libellés français s'affichent sans texte « undefined ».
- **Message long / retour à la ligne** : le message d'accueil reste lisible sur plusieurs lignes sans casser la mise en page.
- **Retour à l'accueil** (Crédits → accueil, rechargement après la course) : le branding ACME est réaffiché à l'identique.
- Les attributions des crédits d'origine (auteurs, technologies) restent présentes et lisibles dans l'écran Crédits.

## 7. Hors périmètre

- Toute modification du gameplay, de la physique, des contrôles, du HUD, du circuit, de l'audio.
- Rebranding des écrans de jeu autres que l'accueil : aide des contrôles (`#step-2`), chargement (`#step-3`), fin de course (`#step-5`), écran des crédits (hors libellé de l'entrée de menu).
- Titre de l'onglet, métadonnées de partage (og:*, favicon), analytics, partage social.
- Traduction des messages du HUD en course et des erreurs console.
- Correction des bugs et dettes listés dans `docs/architecture.md` §6.
- Création d'une version claire/détourée du logo, nouvelles polices, nouveaux assets graphiques non fournis.
- Internationalisation générale (sélecteur de langue).

## 8. Critères d'acceptation

1. L'accueil affiche le logo ACME sans déformation (ratio mesuré identique à `logo.png`), avec marge visible et sans recoloration.
2. Le texte « Bienvenue au ACME Racing Challenge » est présent à l'identique ; le bouton affiche « Démarrer la course ».
3. Toutes les entrées et valeurs du menu de l'accueil sont en français, y compris après chaque clic de cycle ; aucune chaîne anglaise résiduelle (Start, Controls, Quality, Credits) sur l'accueil.
4. Le fond est sombre (`#08090D`) ; les couleurs d'accent visibles appartiennent à la palette ; aucune trace du bleu/orange d'origine sur l'accueil ; le logo d'origine HexGL n'apparaît plus.
5. Aucune nouvelle ressource webfont ni dépendance réseau ajoutée pour le branding.
6. Parcours complet validé manuellement : accueil → Démarrer → aide → chargement → course (compte à rebours 3-2-1-GO) → fin ; comportement identique à avant.
7. Capture de la course (`formation/tests/captures/02-jeu-en-cours.png`) comparée à une nouvelle capture : course et HUD visuellement identiques ; seule l'accueil (`01-accueil.png`) diffère.
8. Les paramètres d'URL `controlType`, `quality`, `hud`, `godmode` produisent les mêmes valeurs initiales qu'avant.
9. Les tests QUnit existants passent (`ci-chrome.bat` code 0) ; toute logique ajoutée non triviale (ex. libellés/cycle des valeurs) est couverte par au moins un test.
10. Rendu vérifié sans défilement horizontal ni chevauchement à 1280×720, en petit écran (≈ 375 px de large) et en grand écran (≥ 1920×1080).
11. Cas du logo manquant et de l'absence de WebGL vérifiés : accueil utilisable, libellés cohérents.
12. Attributions de l'écran Crédits toujours présentes.
