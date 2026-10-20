// Branding de l'écran d'accueil : unique point de configuration (textes, logo, palette, libellés du menu).
// Les couleurs sont exposées au CSS via les variables --brand-* ; launch.js lit bkcore.Branding.menu.
var bkcore = bkcore || {};

bkcore.Branding = {
  name: 'ACME',
  welcome: 'Bienvenue au ACME Racing Challenge',
  startLabel: 'Démarrer la course',
  logo: { src: 'css/acme-logo.png', alt: 'ACME' },
  // Dégradé événementiel : violet -> blue.
  colors: {
    bg: '#08090D',
    violet: '#7628FF',
    blue: '#315BFF',
    cyan: '#00C4E8',
    text: '#FFFFFF',
    surface: '#E6E8EE'
  },
  // Le nombre de values doit rester 4/4/2/2 : launch.js fait défiler ces listes en boucle.
  menu: {
    controlType: { label: 'Contrôles : ', values: ['Clavier', 'Tactile', 'Leap Motion', 'Manette'] },
    quality: { label: 'Qualité : ', values: ['Basse', 'Moyenne', 'Haute', 'Très haute'] },
    hud: { label: 'HUD : ', values: ['Désactivé', 'Activé'] },
    godmode: { label: 'Godmode : ', values: ['Désactivé', 'Activé'] },
    credits: 'Crédits',
    noWebGL: "WebGL n'est pas supporté !"
  },

  // Idempotent ; tolère les éléments absents (appelé avant et après le chargement du DOM).
  apply: function (doc) {
    var b = bkcore.Branding, k, el;
    for (k in b.colors) doc.documentElement.style.setProperty('--brand-' + k, b.colors[k]);
    if ((el = doc.getElementById('brand-logo'))) {
      el.alt = b.logo.alt;
      // Logo introuvable : le nom reste visible à la place.
      var fallback = function () { if (el.parentNode) el.parentNode.textContent = b.name; };
      el.onerror = fallback;
      if (el.getAttribute('src') !== b.logo.src) el.src = b.logo.src;
      // L'erreur de chargement a pu survenir avant l'affectation du handler.
      else if (el.complete && el.naturalWidth === 0) fallback();
    }
    if ((el = doc.getElementById('welcome'))) el.textContent = b.welcome;
    if ((el = doc.getElementById('start'))) el.textContent = b.startLabel;
    if ((el = doc.getElementById('s-credits'))) el.textContent = b.menu.credits;
  }
};

// Chargé en <head> : seules les couleurs s'appliquent ici ; launch.js rappelle apply une fois le DOM prêt.
bkcore.Branding.apply(document);
