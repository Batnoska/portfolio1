/* ==========================================================================
   Santiago Batnoska — Portfolio
   Vanilla JS: i18n, boot sequence, ember particles, cursor, reveals, tilt,
   magnetic buttons, filters, before/after slider, counters, clock.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  // ?static: no intro, everything already revealed (for screenshots and previews).
  const staticMode = new URLSearchParams(location.search).has("static");
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
  };

  /* ------------------------------------------------------------------------
     Translations
     ------------------------------------------------------------------------ */
  const I18N = {
    es: {
      skip: "Saltar al contenido",
      boot1: "Inicializando motor…", boot2: "Compilando shaders…", boot3: "Cargando niveles…", boot4: "Encendiendo las brasas…",
      navWork: "Proyectos", navTools: "Herramientas", navAbout: "Sobre mí", navContact: "Contacto",
      heroKicker: "Game Developer · Buenos Aires, AR",
      heroLead: "Programo sistemas de gameplay, herramientas y experiencias interactivas en Unity y Unreal Engine.",
      heroNow: "Enfoque",
      ctaWork: "Ver proyectos", ctaContact: "Hablemos", scroll: "Scroll",
      workTitle: "Proyectos seleccionados",
      workSub: "Juegos en los que programé, lideré y di forma a sus sistemas. Elegí un nivel.",
      filterAll: "Todos",
      genre1: "Aventura narrativa", genre2: "Horror en primera persona", genre3: "Tower defense FPS", genre4: "Hero shooter top-down",
      desc1: "Aventura narrativa side-scroller ambientada en una ciudad steampunk distópica, donde cada decisión pesa.",
      desc2: "Horror en primera persona centrado en la tensión atmosférica y la inmersión del jugador.",
      desc3: "Tower defense en primera persona con una estética retro de juguetes: defendé tu cuarto oleada tras oleada.",
      desc4: "Hero shooter top-down en una Buenos Aires infestada de zombies.",
      t1a: "Sistema de diálogos", t1b: "Múltiples finales", t1c: "Inventario", t1d: "Progresión de stats", t1e: "Ambientación inmersiva",
      t2a: "Cinemáticas", t2b: "Diálogos dinámicos",
      t3a: "Sistema de oleadas", t3b: "Torretas con mejoras", t3c: "Varios tipos de enemigos",
      t4a: "3 personajes jugables", t4b: "Misiones",
      play: "Jugar", code: "Código", gameplay: "Ver gameplay",
      toolsTitle: "Herramientas & extras",
      toolsSub: "Además de juegos, construyo herramientas que les ahorran horas a otros desarrolladores.",
      soon: "Próximamente en Asset Store",
      toolLead: "Un convertidor que transforma interfaces UGUI en UI Toolkit (UXML + USS) con un click, y mantiene funcionando los scripts que ya existen gracias a un puente en runtime.",
      f1: "Conversión fiel de layouts, grids, imágenes, texto TMP y controles",
      f2: "UGUI Bridge: tus scripts, eventos y prefabs siguen andando sin tocar código",
      f3: "Bridge Debugger, reconversión de proyectos enteros y suite de tests automatizados",
      f4: "Probada en un juego completo: 9 escenas convertidas, 0 diferencias",
      s1: "precisión de layout", s2: "tests automatizados", s3: "líneas de código a cambiar",
      compareHint: "Arrastrá para comparar — el mismo menú en los dos sistemas de UI",
      x1Title: "Este portfolio", x1Desc: "Diseñado y programado a mano, sin frameworks: partículas en canvas, i18n y animaciones propias.",
      x2Title: "Próximo experimento", x2Desc: "Siempre hay algo compilando. Pronto, más herramientas y prototipos.",
      aboutTitle: "Sobre mí",
      photoCaption: "Player 1 · Listo",
      aboutIntro: "Hago juegos que se sienten bien al jugarlos y código que se siente bien al mantenerlo.",
      aboutText: "Soy desarrollador de videojuegos y estudio la Licenciatura en Desarrollo de Videojuegos en UADE. Me especializo en Unity (C#) y Unreal Engine 5 (C++ y Blueprints): mecánicas de gameplay, sistemas de combate, arquitectura con patrones de diseño y herramientas de editor. Lideré y programé proyectos académicos y personales, y siempre busco el próximo desafío técnico.",
      a1: "juegos desarrollados", a2: "motores", a3: "herramienta para Asset Store",
      sk1: "Motores", sk2: "Lenguajes", sk3: "Sistemas", sk4: "Forma de trabajo",
      sk3a: "Gameplay & combate", sk3b: "Diálogos & inventario", sk3c: "Herramientas de editor",
      sk4a: "Patrones de diseño", sk4b: "Liderazgo de proyecto",
      eduWhen: "En curso", eduTitle: "Licenciatura en Desarrollo de Videojuegos",
      resume: "Ver CV",
      contactSub: "¿Tenés un proyecto, un puesto o una idea? Me encantaría escucharla.",
      contactTitle: "Hablemos.",
      copy: "Click para copiar", cv: "Currículum",
      handmade: "Diseñado y programado a mano", backTop: "Volver arriba",
      copied: "Email copiado ✓",
      roles: ["Gameplay Programming", "Herramientas de editor", "Unity · C#", "Unreal Engine 5 · C++", "Sistemas de UI"],
      cursor: { play: "Jugar", watch: "Ver", drag: "Arrastrar", copy: "Copiar" },
    },
    en: {
      skip: "Skip to content",
      boot1: "Initializing engine…", boot2: "Compiling shaders…", boot3: "Loading levels…", boot4: "Lighting the embers…",
      navWork: "Work", navTools: "Tools", navAbout: "About", navContact: "Contact",
      heroKicker: "Game Developer · Buenos Aires, AR",
      heroLead: "I build gameplay systems, tools and interactive experiences in Unity and Unreal Engine.",
      heroNow: "Focus",
      ctaWork: "See my work", ctaContact: "Let's talk", scroll: "Scroll",
      workTitle: "Selected work",
      workSub: "Games where I programmed, led and shaped the systems. Pick a level.",
      filterAll: "All",
      genre1: "Narrative adventure", genre2: "First-person horror", genre3: "FPS tower defense", genre4: "Top-down hero shooter",
      desc1: "A side-scrolling narrative adventure set in a dystopian steampunk city, where every choice matters.",
      desc2: "A first-person horror game focused on atmospheric tension and player immersion.",
      desc3: "A first-person tower defense with a retro toy aesthetic: defend your room wave after wave.",
      desc4: "A top-down hero shooter set in a zombie-infested Buenos Aires.",
      t1a: "Dialogue system", t1b: "Multiple endings", t1c: "Inventory", t1d: "Stats progression", t1e: "Immersive ambience",
      t2a: "Cutscenes", t2b: "Dynamic dialogues",
      t3a: "Wave system", t3b: "Upgradable turrets", t3c: "Multiple enemy types",
      t4a: "3 playable characters", t4b: "Missions",
      play: "Play", code: "Source", gameplay: "Watch gameplay",
      toolsTitle: "Tools & extras",
      toolsSub: "Besides games, I build tools that save other developers hours of work.",
      soon: "Coming soon to the Asset Store",
      toolLead: "A converter that turns UGUI interfaces into UI Toolkit (UXML + USS) in one click, and keeps your existing scripts working through a runtime bridge.",
      f1: "Faithful conversion of layouts, grids, images, TMP text and controls",
      f2: "UGUI Bridge: your scripts, events and prefabs keep working with no code changes",
      f3: "Bridge Debugger, whole-project reconversion and an automated test suite",
      f4: "Proven on a full game: 9 scenes converted, 0 differences",
      s1: "layout precision", s2: "automated tests", s3: "lines of code to change",
      compareHint: "Drag to compare — the same menu in both UI systems",
      x1Title: "This portfolio", x1Desc: "Designed and coded by hand, no frameworks: canvas particles, i18n and custom animations.",
      x2Title: "Next experiment", x2Desc: "Something is always compiling. More tools and prototypes soon.",
      aboutTitle: "About me",
      photoCaption: "Player 1 · Ready",
      aboutIntro: "I make games that feel good to play and code that feels good to maintain.",
      aboutText: "I'm a game developer studying for a Bachelor's Degree in Video Game Development at UADE. I specialize in Unity (C#) and Unreal Engine 5 (C++ and Blueprints): gameplay mechanics, combat systems, architecture built on design patterns, and editor tools. I've led and programmed academic and personal projects, and I'm always after the next technical challenge.",
      a1: "games developed", a2: "engines", a3: "Asset Store tool",
      sk1: "Engines", sk2: "Languages", sk3: "Systems", sk4: "How I work",
      sk3a: "Gameplay & combat", sk3b: "Dialogue & inventory", sk3c: "Editor tools",
      sk4a: "Design patterns", sk4b: "Project leadership",
      eduWhen: "In progress", eduTitle: "Bachelor's in Video Game Development",
      resume: "View résumé",
      contactSub: "Got a project, a role or an idea? I'd love to hear it.",
      contactTitle: "Let's talk.",
      copy: "Click to copy", cv: "Résumé",
      handmade: "Designed & coded by hand", backTop: "Back to top",
      copied: "Email copied ✓",
      roles: ["Gameplay Programming", "Editor Tools", "Unity · C#", "Unreal Engine 5 · C++", "UI Systems"],
      cursor: { play: "Play", watch: "Watch", drag: "Drag", copy: "Copy" },
    },
  };

  let lang = store.get("sb-lang") || ((navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en");
  const t = (key) => I18N[lang][key] ?? I18N.es[key] ?? "";

  /* ------------------------------------------------------------------------
     Split text: words → chars, each char with its index for staggered reveals
     ------------------------------------------------------------------------ */
  function split(el) {
    const text = el.textContent;
    el.textContent = "";
    let i = 0;
    text.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
      if (!part) return;
      const word = document.createElement("span");
      word.className = "word";
      for (const ch of part) {
        const c = document.createElement("span");
        c.className = "char";
        c.textContent = ch;
        c.style.setProperty("--i", i++);
        word.appendChild(c);
      }
      el.appendChild(word);
    });
  }

  function applyLang(next, animate) {
    lang = next;
    document.documentElement.lang = lang;
    store.set("sb-lang", lang);
    $$("[data-i18n]").forEach((el) => {
      const value = t(el.dataset.i18n);
      if (el.hasAttribute("data-split")) {
        el.textContent = value;
        split(el);
        if (animate && el.classList.contains("is-in")) {
          el.classList.remove("is-in");
          void el.offsetWidth;
          el.classList.add("is-in");
        }
      } else {
        el.textContent = value;
      }
    });
    $$(".lang__opt").forEach((o) => o.classList.toggle("is-active", o.dataset.lang === lang));
    fit();
    typer.restart();
  }

  /* ------------------------------------------------------------------------
     Display type that must stay on one line per word: shrink it when the
     widest word is wider than its box (narrow phones, wider fallback fonts)
     ------------------------------------------------------------------------ */
  function fit() {
    $$("[data-fit]").forEach((el) => {
      el.style.fontSize = "";
      const words = $$(".word", el);
      if (!words.length) return;
      const widest = Math.max(...words.map((w) => w.getBoundingClientRect().width));
      // The box, but never wider than the screen minus its side margins (overflow can widen a phone's layout).
      const left = el.getBoundingClientRect().left;
      const room = Math.min(el.clientWidth, document.documentElement.clientWidth - 2 * Math.max(0, left));
      if (widest > room) el.style.fontSize = `${(parseFloat(getComputedStyle(el).fontSize) * room) / widest * 0.98}px`;
    });
  }

  /* ------------------------------------------------------------------------
     Typer (rotating focus areas)
     ------------------------------------------------------------------------ */
  const typer = (() => {
    const el = $(".typer");
    let timer = null, word = 0, pos = 0, deleting = false;
    function tick() {
      const words = t("roles");
      const current = words[word % words.length];
      if (reduceMotion) { el.textContent = current; return; }
      pos += deleting ? -1 : 1;
      el.textContent = current.slice(0, pos);
      let delay = deleting ? 28 : 55;
      if (!deleting && pos === current.length) { deleting = true; delay = 1700; }
      else if (deleting && pos === 0) { deleting = false; word++; delay = 350; }
      timer = setTimeout(tick, delay);
    }
    return {
      restart() { clearTimeout(timer); pos = 0; deleting = false; if (el) tick(); },
    };
  })();

  /* ------------------------------------------------------------------------
     Boot sequence
     ------------------------------------------------------------------------ */
  function boot() {
    const num = $(".preloader__num");
    const bar = $(".preloader__bar span");
    const logs = $$(".preloader__log li");
    if (staticMode) {
      document.documentElement.style.scrollBehavior = "auto";
      // In a tall capture window the hero keeps a normal screen's height.
      const hero = $(".hero");
      if (hero && innerHeight > 1400) hero.style.minHeight = "900px";
      $(".preloader")?.remove();
      document.body.classList.add("is-loaded", "is-ready");
      document.body.classList.remove("is-loading");
      $$("[data-split]").forEach((el) => el.classList.add("is-in"));
      return;
    }
    const quick = reduceMotion || sessionStorage.getItem("sb-booted") === "1";
    const duration = quick ? 500 : 2100;
    let loaded = document.readyState === "complete";
    window.addEventListener("load", () => { loaded = true; });
    const start = performance.now();
    let shown = 0;

    function frame(now) {
      // Time-based (not per-frame), so a slow or throttled tab still finishes on time; never waits more than 6 s.
      const elapsed = now - start;
      const k = Math.min(1, elapsed / duration);
      let target = 1 - Math.pow(1 - k, 3);
      if (!loaded && elapsed < 6000) target = Math.min(target, 0.9);
      shown = Math.max(shown, Math.min(1, target + (loaded && k === 1 ? 1 : 0)));
      const pct = Math.round(shown * 100);
      num.textContent = String(pct).padStart(2, "0");
      bar.style.transform = `scaleX(${shown})`;
      logs.forEach((li, i) => {
        const at = i / logs.length;
        li.classList.toggle("is-on", shown >= at);
        li.classList.toggle("is-done", shown >= at + 1 / logs.length - 0.02);
      });
      if (shown < 1) { requestAnimationFrame(frame); return; }
      try { sessionStorage.setItem("sb-booted", "1"); } catch { /* ignore */ }
      setTimeout(() => {
        document.body.classList.add("is-loaded");
        document.body.classList.remove("is-loading");
        setTimeout(() => {
          document.body.classList.add("is-ready");
          $$(".hero [data-split]").forEach((el) => el.classList.add("is-in"));
        }, quick ? 150 : 350);
      }, quick ? 0 : 250);
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------------
     Ember particles (hero canvas)
     ------------------------------------------------------------------------ */
  function embers() {
    const canvas = $(".hero__embers");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const hero = $(".hero");
    const fpsEl = $(".hud__fps-num");
    let w = 0, h = 0, dpr = 1, particles = [], running = true, visible = true;
    const mouse = { x: -9999, y: -9999 };

    function spawn(p, fresh) {
      p.x = Math.random() * w;
      p.y = fresh ? Math.random() * h : h + 10 + Math.random() * 40;
      p.r = 0.6 + Math.random() * 2.2;
      p.vy = -(0.25 + Math.random() * 0.95) * (0.6 + p.r / 3);
      p.vx = (Math.random() - 0.5) * 0.3;
      p.sway = 0.4 + Math.random() * 1.2;
      p.phase = Math.random() * Math.PI * 2;
      p.life = 0;
      p.max = 260 + Math.random() * 420;
      p.hue = 8 + Math.random() * 32;
      return p;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(50, Math.min(200, Math.round((w * h) / 9500)));
      while (particles.length < count) particles.push(spawn({}, true));
      particles.length = count;
    }

    let last = performance.now(), fpsAcc = 0, fpsFrames = 0;
    function draw(now) {
      if (!running) return;
      const dt = Math.min(3, (now - last) / 16.667);
      last = now;
      fpsAcc += now - (draw.prev || now); draw.prev = now; fpsFrames++;
      if (fpsAcc > 500 && fpsEl) { fpsEl.textContent = Math.round((fpsFrames * 1000) / fpsAcc); fpsAcc = 0; fpsFrames = 0; }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        p.life += dt;
        p.phase += 0.02 * dt;
        let vx = p.vx + Math.sin(p.phase) * 0.25 * p.sway;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 22000) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / 148) * 2.4;
          p.x += (dx / d) * f * dt; p.y += (dy / d) * f * dt;
        }
        p.x += vx * dt; p.y += p.vy * dt;
        if (p.y < -20 || p.life > p.max || p.x < -30 || p.x > w + 30) spawn(p, false);
        const fade = Math.sin(Math.min(1, p.life / p.max) * Math.PI);
        const flicker = 0.75 + Math.sin(p.phase * 6) * 0.25;
        const a = fade * flicker;
        ctx.fillStyle = `hsla(${p.hue}, 100%, 55%, ${a * 0.12})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `hsla(${p.hue + 12}, 100%, ${62 + p.r * 6}%, ${a * 0.9})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      requestAnimationFrame(draw);
    }

    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) { last = performance.now(); draw.prev = last; requestAnimationFrame(draw); }
    }

    resize();
    window.addEventListener("resize", resize);
    hero.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      const x = $(".hud__x"), y = $(".hud__y");
      if (x) x.textContent = String(Math.round(e.clientX)).padStart(4, "0");
      if (y) y.textContent = String(Math.round(e.clientY)).padStart(4, "0");
    });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; setRunning(visible && !document.hidden); }).observe(hero);
    document.addEventListener("visibilitychange", () => setRunning(visible && !document.hidden));

    if (reduceMotion) { running = true; draw(performance.now()); running = false; return; }
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------------------
     Custom cursor
     ------------------------------------------------------------------------ */
  function cursor() {
    if (!finePointer || reduceMotion) return;
    document.documentElement.classList.add("has-cursor");
    const root = $(".cursor"), dot = $(".cursor__dot"), ring = $(".cursor__ring"), label = $(".cursor__label");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    window.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; root.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("pointerleave", () => root.classList.add("is-hidden"));
    window.addEventListener("pointerdown", () => root.classList.add("is-down"));
    window.addEventListener("pointerup", () => root.classList.remove("is-down"));
    document.addEventListener("pointerover", (e) => {
      const labelled = e.target.closest("[data-cursor]");
      const hoverable = e.target.closest("a, button, .chip, input");
      if (labelled) {
        label.textContent = t("cursor")[labelled.dataset.cursor] || "";
        root.classList.add("is-label"); root.classList.remove("is-hover");
      } else {
        root.classList.remove("is-label");
        root.classList.toggle("is-hover", !!hoverable);
      }
    });
    (function loop() {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------------------------------
     Magnetic buttons & 3D tilt
     ------------------------------------------------------------------------ */
  function magnetic() {
    if (!finePointer || reduceMotion) return;
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = "transform 0.15s linear";
        el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.32}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
      });
    });
  }

  function tilt() {
    if (!finePointer || reduceMotion) return;
    $$("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.classList.add("is-tilting");
        el.style.setProperty("--ry", `${(px - 0.5) * 9}deg`);
        el.style.setProperty("--rx", `${(0.5 - py) * 7}deg`);
        el.style.setProperty("--gx", `${px * 100}%`);
        el.style.setProperty("--gy", `${py * 100}%`);
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("is-tilting");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ------------------------------------------------------------------------
     Text scramble on nav hover
     ------------------------------------------------------------------------ */
  function scramble() {
    if (reduceMotion) return;
    const glyphs = "!<>-_\\/[]{}—=+*^?#01";
    $$("[data-scramble]").forEach((el) => {
      const link = el.closest("a") || el;
      let running = false;
      link.addEventListener("pointerenter", () => {
        if (running) return;
        running = true;
        const final = t(el.dataset.i18n) || el.textContent;
        let frame = 0;
        const total = 14;
        (function step() {
          el.textContent = final.split("").map((ch, i) => {
            if (ch === " ") return " ";
            return i < (frame / total) * final.length ? ch : glyphs[(Math.random() * glyphs.length) | 0];
          }).join("");
          if (++frame <= total) requestAnimationFrame(step);
          else { el.textContent = final; running = false; }
        })();
      });
    });
  }

  /* ------------------------------------------------------------------------
     Reveals & counters
     ------------------------------------------------------------------------ */
  function reveals() {
    const counters = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        $$("[data-count]", entry.target).forEach((c) => counters.add(c) && count(c));
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    if (staticMode) {
      $$("[data-reveal], [data-split]").forEach((el) => el.classList.add("is-in"));
      $$("[data-count]").forEach((c) => { c.textContent = c.dataset.count; });
      return;
    }
    $$("[data-reveal], [data-split]").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });

    function count(el) {
      const target = Number(el.dataset.count);
      if (reduceMotion || target === 0) { el.textContent = target; return; }
      const start = performance.now(), dur = 1400;
      (function step(now) {
        const k = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(start);
    }
  }

  /* ------------------------------------------------------------------------
     Project filters
     ------------------------------------------------------------------------ */
  function filters() {
    const chips = $$(".chip");
    const projects = $$(".project");
    chips.forEach((chip) => chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.toggle("is-active", c === chip));
      const f = chip.dataset.filter;
      projects.forEach((p) => {
        const show = f === "all" || p.dataset.engine === f;
        p.classList.toggle("is-filtered", !show);
        p.classList.remove("is-entering");
        if (show) { void p.offsetWidth; p.classList.add("is-entering", "is-in"); }
      });
    }));
  }

  /* ------------------------------------------------------------------------
     Before / after slider
     ------------------------------------------------------------------------ */
  function compare() {
    const box = $(".compare");
    if (!box) return;
    const range = $(".compare__range", box);
    const set = (v) => { box.style.setProperty("--pos", `${v}%`); range.value = v; };
    range.addEventListener("input", () => set(range.value));
    if (reduceMotion) return;
    // A short demo sweep the first time it shows, so it reads as interactive.
    new IntersectionObserver(([entry], obs) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const keys = [50, 22, 78, 50], start = performance.now(), seg = 650;
      (function step(now) {
        const k = (now - start) / seg, i = Math.floor(k);
        if (i >= keys.length - 1) { set(50); return; }
        const e = 0.5 - Math.cos((k - i) * Math.PI) / 2;
        set(keys[i] + (keys[i + 1] - keys[i]) * e);
        requestAnimationFrame(step);
      })(start);
    }, { threshold: 0.6 }).observe(box);
  }

  /* ------------------------------------------------------------------------
     Header, progress, active section, menu
     ------------------------------------------------------------------------ */
  function chrome() {
    const header = $(".header"), bar = $(".progress span");
    let lastY = scrollY;
    function onScroll() {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      header.classList.toggle("is-scrolled", y > 40);
      const menuOpen = document.body.classList.contains("menu-open");
      header.classList.toggle("is-hidden", !menuOpen && y > 300 && y > lastY + 2);
      if (y < lastY - 2 || y < 300) header.classList.remove("is-hidden");
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const links = $$(".nav__link");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["work", "tools", "about", "contact"].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });

    const btn = $(".menu-btn");
    btn.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    $$(".mobile-menu a").forEach((a) => a.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
    }));

    $(".lang").addEventListener("click", () => applyLang(lang === "es" ? "en" : "es", true));
  }

  /* ------------------------------------------------------------------------
     Email copy, clock, year
     ------------------------------------------------------------------------ */
  function contact() {
    const toast = $(".toast");
    let hideTimer;
    $$("[data-email]").forEach((btn) => btn.addEventListener("click", async () => {
      const email = btn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        toast.textContent = t("copied");
        toast.classList.add("is-on");
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => toast.classList.remove("is-on"), 2200);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    }));

    const clock = $(".clock");
    const fmt = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" });
    const tickClock = () => { if (clock) clock.textContent = fmt.format(new Date()); };
    tickClock();
    setInterval(tickClock, 15000);
    $$(".year").forEach((y) => { y.textContent = new Date().getFullYear(); });
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  $$("[data-split]:not([data-i18n])").forEach(split);
  applyLang(lang, false);
  window.addEventListener("resize", fit);
  if (document.fonts) document.fonts.ready.then(fit);
  boot();
  embers();
  cursor();
  magnetic();
  tilt();
  scramble();
  reveals();
  filters();
  compare();
  chrome();
  contact();
})();
