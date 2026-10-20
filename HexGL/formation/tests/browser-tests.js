/* Tests du code existant HexGL, sans Node.js. QUnit est chargé localement. */
(function () {
  "use strict";
  if (typeof QUnit === "undefined") {
    document.documentElement.dataset.testStatus = "fail";
    document.documentElement.dataset.testCount = "0";
    document.documentElement.dataset.testFailures = "1";
    document.body.insertAdjacentHTML("afterbegin", "<p style='color:red'>QUnit introuvable : vérifiez le fichier vendor/qunit-2.26.0.js</p>");
    return;
  }

  // Compatible avec le script Chrome headless existant : état mesurable dans le DOM.
  QUnit.done(function (result) {
    const count = result.total;
    const failed = result.failed;
    const root = document.documentElement;
    root.setAttribute("data-test-count", String(count));
    root.setAttribute("data-test-failures", String(failed));
    root.setAttribute("data-test-status", failed === 0 && count >= 4 ? "pass" : "fail");
    let summary = document.getElementById("summary");
    if (!summary) {
      summary = document.createElement("p");
      summary.id = "summary";
      document.body.appendChild(summary);
    }
    summary.textContent = count + " test(s) : " + (count - failed) + " réussi(s), " + failed + " échec(s).";
  });

  const U = window.bkcore && window.bkcore.Utils;
  QUnit.module("HexGL — bkcore.Utils", function () {
    QUnit.test("updateClass ajoute une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-add";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", true);
      assert.true(e.classList.contains("active"));
    });
    QUnit.test("updateClass supprime une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-remove";
      e.className = "active";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", false);
      assert.false(e.classList.contains("active"));
    });
    QUnit.test("getOffsetTop additionne les décalages parent/enfant", function (assert) {
      const parent = {
        offsetTop: 37,
        offsetParent: null
      };
      const enfant = {
        offsetTop: 13,
        offsetParent: parent
      };
      assert.strictEqual(U.getOffsetTop(enfant), 50);
    });
    QUnit.test("getURLParameter lit les paramètres d'URL", function (assert) {
      assert.ok(U, "Utils.js chargé");
      U.URLParameters = null;
      const url = new URL(window.location.href);
      url.searchParams.set("hexgl_poc", "ok");
      // Le lanceur fournit hexgl_poc=ok ; en ouverture directe, on teste l'absence ou la présence.
      const expected = window.location.search.includes("hexgl_poc=ok") ? "ok" : null;
      assert.strictEqual(U.getURLParameter("hexgl_poc"), expected);
    });
    QUnit.test("getURLParameter : paramètre absent → undefined, cache réutilisé", function (assert) {
      U.URLParameters = { a: "1", b: "x" };
      assert.strictEqual(U.getURLParameter("a"), "1");
      assert.strictEqual(U.getURLParameter("b"), "x");
      assert.strictEqual(U.getURLParameter("absent"), undefined);
      U.URLParameters = null;
    });
    QUnit.test("updateClass ignore un id inexistant sans erreur", function (assert) {
      U.updateClass("id-qui-n-existe-pas", "x", true);
      assert.ok(true);
    });
  });

  const T = window.bkcore && window.bkcore.Timer;
  QUnit.module("HexGL — bkcore.Timer", function () {
    QUnit.test("msToTime découpe h/m/s/ms", function (assert) {
      assert.deepEqual(T.msToTime(0), { h: 0, m: 0, s: 0, ms: 0 });
      assert.deepEqual(T.msToTime(3723004), { h: 1, m: 2, s: 3, ms: 4 });
      assert.deepEqual(T.msToTime(92300), { h: 0, m: 1, s: 32, ms: 300 });
    });
    QUnit.test("msToTimeString complète avec des zéros (format du score)", function (assert) {
      assert.deepEqual(T.msToTimeString(92300), { h: "00", m: "01", s: "32", ms: "0300" });
    });
    QUnit.test("zfill complète sans tronquer", function (assert) {
      assert.strictEqual(T.zfill(7, 3), "007");
      assert.strictEqual(T.zfill(1234, 2), "1234");
    });
    QUnit.test("start/pause pilotent l'état actif ; update inactif ne change rien", function (assert) {
      const t = new T();
      assert.false(t.active, "inactif par défaut");
      t.update();
      assert.strictEqual(t.time.elapsed, 0);
      t.start();
      assert.true(t.active);
      t.pause(true);
      assert.false(t.active);
      t.pause(false);
      assert.true(t.active);
    });
    QUnit.test("getElapsedTime formate time.elapsed", function (assert) {
      const t = new T();
      t.time.elapsed = 61000;
      assert.deepEqual(t.getElapsedTime(), { h: 0, m: 1, s: 1, ms: 0 });
    });
  });

  QUnit.module("HexGL — bkcore.ImageData (cartes de collision/hauteur)", function () {
    // Image 2x2 simulée : pas de chargement ni de canvas.
    function fake() {
      const o = Object.create(window.bkcore.ImageData.prototype);
      o.pixels = { width: 2, height: 2, data: new Uint8ClampedArray([
        10, 20, 30, 255,   40, 50, 60, 255,
        70, 80, 90, 255,   100, 110, 120, 255
      ]) };
      return o;
    }
    QUnit.test("getPixel renvoie RGBA à l'index (x,y)", function (assert) {
      assert.deepEqual(fake().getPixel(1, 0), { r: 40, g: 50, b: 60, a: 255 });
      assert.deepEqual(fake().getPixel(0, 1), { r: 70, g: 80, b: 90, a: 255 });
    });
    QUnit.test("getPixel hors bornes ou image non chargée renvoie 0,0,0,0", function (assert) {
      const zero = { r: 0, g: 0, b: 0, a: 0 };
      const o = fake();
      assert.deepEqual(o.getPixel(-1, 0), zero);
      assert.deepEqual(o.getPixel(2, 0), zero);
      assert.deepEqual(o.getPixel(0, 2), zero);
      o.pixels = null;
      assert.deepEqual(o.getPixel(0, 0), zero);
    });
    QUnit.test("getPixelF encode R + G*255 + B*255*255", function (assert) {
      assert.strictEqual(fake().getPixelF(0, 0), 10 + 20 * 255 + 30 * 255 * 255);
    });
    QUnit.test("getPixelBilinear au centre d'un pixel renvoie ce pixel", function (assert) {
      assert.deepEqual(fake().getPixelBilinear(0.5, 0.5), { r: 10, g: 20, b: 30, a: 255 });
    });
  });

  QUnit.module("HexGL — Gameplay (checkpoints, valeurs par défaut)", function () {
    function gp(color) {
      const g = new window.bkcore.hexgl.Gameplay({});
      g.pixelRatio = 1;
      g.analyser = { pixels: { width: 100, height: 100 }, getPixel: function () { return color; } };
      g.shipControls = { dummy: { position: { x: 0, z: 0 } } };
      return g;
    }
    QUnit.test("pixel jaune (255,255,b<250) → numéro de checkpoint = b", function (assert) {
      assert.strictEqual(gp({ r: 255, g: 255, b: 0 }).checkPoint(), 0);
      assert.strictEqual(gp({ r: 255, g: 255, b: 2 }).checkPoint(), 2);
    });
    QUnit.test("autres couleurs → -1", function (assert) {
      assert.strictEqual(gp({ r: 255, g: 255, b: 250 }).checkPoint(), -1);
      assert.strictEqual(gp({ r: 0, g: 255, b: 0 }).checkPoint(), -1);
    });
    QUnit.test("convertit la position du vaisseau en pixel de la carte", function (assert) {
      let seen;
      const g = gp({ r: 0, g: 0, b: 0 });
      g.pixelRatio = 2;
      g.shipControls.dummy.position = { x: 10, z: -5 };
      g.analyser.getPixel = function (x, y) { seen = [x, y]; return { r: 0, g: 0, b: 0 }; };
      g.checkPoint();
      assert.deepEqual(seen, [70, 40]);
    });
    QUnit.test("3 tours et mode timeattack par défaut (mode inconnu → timeattack)", function (assert) {
      const G = window.bkcore.hexgl.Gameplay;
      assert.strictEqual(new G({}).maxLaps, 3);
      assert.strictEqual(new G({}).mode, "timeattack");
      assert.strictEqual(new G({ mode: "inconnu" }).mode, "timeattack");
    });
  });

  QUnit.module("HexGL — bkcore.Branding (accueil ACME)", function () {
    const B = window.bkcore && window.bkcore.Branding;
    QUnit.test("message et bouton de la charte", function (assert) {
      assert.strictEqual(B.welcome, "Bienvenue au ACME Racing Challenge");
      assert.strictEqual(B.startLabel, "Démarrer la course");
    });
    QUnit.test("palette : six couleurs hexadécimales", function (assert) {
      assert.deepEqual(Object.keys(B.colors).sort(), ["bg", "blue", "cyan", "surface", "text", "violet"]);
      Object.keys(B.colors).forEach(function (k) {
        assert.true(/^#[0-9A-F]{6}$/i.test(B.colors[k]), k);
      });
    });
    QUnit.test("menu : mêmes tailles de listes que launch.js (4/4/2/2), libellés non vides", function (assert) {
      const n = { controlType: 4, quality: 4, hud: 2, godmode: 2 };
      Object.keys(n).forEach(function (k) {
        assert.strictEqual(B.menu[k].values.length, n[k], k);
        assert.ok(B.menu[k].label, k + " : label");
        B.menu[k].values.forEach(function (v) { assert.ok(v, k + " : valeur vide"); });
      });
    });
    QUnit.test("apply remplit les éléments présents et ignore les absents", function (assert) {
      const els = { welcome: { textContent: "" }, start: { textContent: "" } };
      const props = {};
      B.apply({
        documentElement: { style: { setProperty: function (k, v) { props[k] = v; } } },
        getElementById: function (id) { return els[id] || null; }
      });
      assert.strictEqual(els.welcome.textContent, B.welcome);
      assert.strictEqual(els.start.textContent, B.startLabel);
      assert.strictEqual(props["--brand-violet"], "#7628FF");
    });
  });
})();
