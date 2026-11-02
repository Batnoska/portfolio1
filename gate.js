/* ==========================================================================
   Boot gate: towers of light, then a black menu with a ring of blue lights,
   like the PS2's own. Runs before index.js, which waits for window.sbGate
   before starting its own preloader.
   ========================================================================== */

(() => {
  "use strict";

  const root = document.documentElement;
  const gate = document.querySelector(".gate");
  if (!root.classList.contains("has-gate") || !gate) {
    gate?.remove();
    window.sbGate = Promise.resolve();
    return;
  }

  let finish;
  window.sbGate = new Promise((resolve) => { finish = resolve; });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
  };

  /* ------------------------------------------------------------------------
     Texts (the page's own dictionary lives in index.js)
     ------------------------------------------------------------------------ */
  const TEXT = {
    es: {
      title: "Elegí a dónde entrar", patches: "Parches y mods",
      enter: "Entrar", lang: "English", reading: "Leyendo el disco",
    },
    en: {
      title: "Choose where to go", patches: "Patches & mods",
      enter: "Enter", lang: "Español", reading: "Reading disc",
    },
  };
  let lang = store.get("sb-lang") || ((navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en");
  function paint() {
    root.lang = lang;
    gate.querySelectorAll("[data-gate]").forEach((el) => { el.textContent = TEXT[lang][el.dataset.gate]; });
  }

  /* ------------------------------------------------------------------------
     Small synthesized sounds (browsers only allow them after a first gesture)
     ------------------------------------------------------------------------ */
  let audio = null;
  function unlock() {
    if (audio) { audio.resume?.(); return; }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audio = new Ctx();
  }
  function tone(freq, to, dur, vol, type = "sine") {
    if (!audio) return;
    const now = audio.currentTime, o = audio.createOscillator(), g = audio.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    o.frequency.exponentialRampToValueAtTime(to, now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(audio.destination);
    o.start(now);
    o.stop(now + dur + 0.02);
  }
  const blip = () => tone(880, 720, 0.09, 0.05);
  const confirmSound = () => { tone(180, 1320, 0.7, 0.07, "triangle"); tone(90, 360, 0.8, 0.05); };

  /* ------------------------------------------------------------------------
     The stage: towers of cubes during the boot, the ring of lights in the menu
     ------------------------------------------------------------------------ */
  let running = true, towerGoal = 1, ringGoal = 0;

  function stage() {
    const canvas = gate.querySelector(".gate__stage");
    const c = canvas.getContext("2d");
    const GAP = 2.3, ROWS = 17, SPAN = 7, LENGTH = ROWS * GAP;
    const columns = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = -SPAN; col <= SPAN; col++) {
        if (Math.random() > 0.58) continue;
        columns.push({ x: col * GAP, z: row * GAP, h: 1 + Math.floor(Math.pow(Math.random(), 2.4) * 13), seed: Math.random() * 6.28 });
      }
    }
    const order = [];
    let w = 0, h = 0, focal = 0, towerAlpha = 0, ringAlpha = 0;

    // One soft blue dot, stamped many times.
    const dot = document.createElement("canvas");
    dot.width = dot.height = 64;
    const d = dot.getContext("2d");
    const glow = d.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, "rgba(235,246,255,1)");
    glow.addColorStop(0.16, "rgba(130,190,255,0.95)");
    glow.addColorStop(0.42, "rgba(40,110,255,0.32)");
    glow.addColorStop(1, "rgba(20,60,255,0)");
    d.fillStyle = glow;
    d.fillRect(0, 0, 64, 64);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      focal = Math.max(w, h) * 0.62;
    }
    resize();
    window.addEventListener("resize", resize);

    const CAM_Y = 3.1, HORIZON = 0.56;
    const px = (x, z) => w / 2 + (x * focal) / z;
    const py = (y, z) => h * HORIZON - ((y - CAM_Y) * focal) / z;
    function quad(points, fill, stroke) {
      c.beginPath();
      c.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
      c.closePath();
      c.fillStyle = fill; c.fill();
      if (stroke) { c.strokeStyle = stroke; c.stroke(); }
    }

    function towers(t) {
      c.lineWidth = 1;
      order.length = 0;
      for (const col of columns) order.push([1.6 + (((col.z - t * 0.85) % LENGTH) + LENGTH) % LENGTH, col]);
      order.sort((a, b) => b[0] - a[0]);
      for (const [z, col] of order) {
        const fog = towerAlpha * Math.min(1, (LENGTH - z) / (LENGTH * 0.72)) * Math.min(1, (z - 1.6) / 2.4);
        if (fog <= 0.01) continue;
        const side = 0.5, back = z + 1;
        for (let i = 0; i < col.h; i++) {
          const y0 = i, y1 = i + 0.84;
          const wave = Math.pow(Math.max(0, Math.sin(t * 1.3 + i * 0.55 + col.seed)), 10);
          const a = fog * (0.2 + 0.5 * wave + 0.03 * i);
          const light = 34 + 36 * wave + i * 1.4;
          const xl = col.x - side, xr = col.x + side;
          quad([px(xl, z), py(y1, z), px(xr, z), py(y1, z), px(xr, z), py(y0, z), px(xl, z), py(y0, z)], `hsla(216, 100%, ${light}%, ${a})`, `hsla(205, 100%, 78%, ${fog * (0.16 + 0.5 * wave)})`);
          const edge = col.x > 0 ? xl : xr;
          quad([px(edge, z), py(y1, z), px(edge, back), py(y1, back), px(edge, back), py(y0, back), px(edge, z), py(y0, z)], `hsla(226, 100%, ${light - 12}%, ${a * 0.7})`);
          if (i === col.h - 1) quad([px(xl, z), py(y1, z), px(xr, z), py(y1, z), px(xr, back), py(y1, back), px(xl, back), py(y1, back)], `hsla(205, 100%, ${light + 20}%, ${a * 1.3})`);
        }
      }
    }

    function ring(t) {
      const wide = w >= 720;
      const cx = wide ? w * 0.3 : w / 2, cy = wide ? h * 0.46 : h * 0.25;
      const R = Math.min(w, h) * (wide ? 0.17 : 0.13);
      const N = 12, head = t * 1.5;
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 + t * 0.18;
        // Each light flares as the "comet" passes it, then fades out.
        const behind = ((head - i) % N + N) % N;
        const flare = Math.pow(1 - behind / N, 3);
        const size = R * (0.26 + 0.62 * flare);
        c.globalAlpha = ringAlpha * (0.22 + 0.78 * flare);
        c.drawImage(dot, cx + Math.cos(angle) * R - size / 2, cy + Math.sin(angle) * R - size / 2, size, size);
      }
      c.globalAlpha = 1;
    }

    function draw(ms) {
      if (!running) return;
      const t = ms / 1000;
      towerAlpha += (towerGoal - towerAlpha) * 0.035;
      ringAlpha += (ringGoal - ringAlpha) * 0.03;
      c.clearRect(0, 0, w, h);
      c.globalCompositeOperation = "lighter";
      if (towerAlpha > 0.01) towers(t);
      if (ringAlpha > 0.01) ring(t);
      c.globalCompositeOperation = "source-over";
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    if (reduceMotion) { towerAlpha = 0; ringAlpha = 1; towerGoal = 0; ringGoal = 1; }
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------------------
     Menu
     ------------------------------------------------------------------------ */
  const options = Array.from(gate.querySelectorAll(".gate__option"));
  let selected = 0, inMenu = false, leaving = false;

  function select(i, sound) {
    const next = (i + options.length) % options.length;
    if (sound && next !== selected) blip();
    selected = next;
    options.forEach((o, k) => o.classList.toggle("is-selected", k === selected));
    if (inMenu) options[selected].focus({ preventScroll: true });
  }

  function showMenu() {
    if (inMenu) return;
    inMenu = true;
    towerGoal = 0; ringGoal = 1;
    gate.classList.remove("gate--boot");
    gate.classList.add("gate--menu");
    select(selected, false);
  }

  // While the gate is up, the page behind it can't take focus.
  const behind = Array.from(document.body.children).filter((el) => el !== gate && el.tagName !== "SCRIPT");
  behind.forEach((el) => { el.inert = true; });

  function choose(option) {
    if (leaving) return;
    leaving = true;
    try { sessionStorage.setItem("sb-gate", "1"); } catch { /* ignore */ }
    if (new URLSearchParams(location.search).has("gate")) history.replaceState(null, "", location.pathname);
    confirmSound();
    const toPatches = option.dataset.go === "patches";
    gate.dataset.disc = option.dataset.go;
    gate.classList.add("gate--reading");
    setTimeout(() => {
      running = false;
      if (toPatches) { location.href = "parches.html"; return; }
      behind.forEach((el) => { el.inert = false; });
      gate.classList.add("gate--gone");
      setTimeout(() => {
        root.classList.remove("has-gate");
        gate.remove();
        finish();
      }, reduceMotion ? 0 : 340);
    }, reduceMotion ? 0 : toPatches ? 1200 : 760);
  }

  options.forEach((option, i) => {
    option.addEventListener("pointerenter", () => { if (inMenu) select(i, true); });
    option.addEventListener("focus", () => { if (inMenu && selected !== i) select(i, false); });
    option.addEventListener("click", () => { select(i, false); choose(option); });
  });

  gate.querySelector(".gate__lang").addEventListener("click", () => {
    lang = lang === "es" ? "en" : "es";
    store.set("sb-lang", lang);
    paint();
    blip();
    options[selected].focus({ preventScroll: true });
  });

  window.addEventListener("pointerdown", () => { unlock(); showMenu(); });
  window.addEventListener("keydown", (e) => {
    unlock();
    if (leaving) return;
    if (!inMenu) { showMenu(); e.preventDefault(); return; }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { select(selected - 1, true); e.preventDefault(); }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { select(selected + 1, true); e.preventDefault(); }
  });

  // Coming back after picking a side: the browser may restore this page as it was.
  window.addEventListener("pageshow", (e) => { if (e.persisted && leaving) location.reload(); });

  /* ------------------------------------------------------------------------
     Start
     ------------------------------------------------------------------------ */
  paint();
  stage();
  if (reduceMotion) {
    showMenu();
  } else {
    gate.classList.add("gate--boot");
    setTimeout(showMenu, 3700);
  }
})();
