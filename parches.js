/* ==========================================================================
   Parches y mods: the room, its CRT, the plain list and the case animation.
   To add a game, add an entry to GAMES and its key to SHELF. Everything else
   (spine, name, list row, TV channel and title screen) comes from that entry.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const html = document.documentElement;
  const isStatic = new URLSearchParams(location.search).has("static");
  const calm = isStatic || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover)").matches;
  if (isStatic) html.classList.add("static");

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ------------------------------------------------------------------------
     Games with patches. Everything else on the shelf is scenery.
     ------------------------------------------------------------------------ */
  const GAMES = {
    xenosaga2: {
      title: "Xenosaga Episode II",
      folder: "./images/parches/xenosaga2/",
      discs: ["disco1.webp", "disco2.webp"],
      screens: ["tv-04.webp", "tv-12.webp", "tv-16.webp"],
      patches: [
        {
          name: { es: "Traducción al español", en: "Spanish translation" },
          status: { es: "v0.9.4 beta", en: "v0.9.4 beta" },
          text: { es: "Todo el juego en español.", en: "The whole game in Spanish." },
          download: "https://github.com/Batnoska/xenosaga2-es/releases/latest",
          repo: "https://github.com/Batnoska/xenosaga2-es",
        },
        {
          name: { es: "Definitive Edition", en: "Definitive Edition" },
          status: { es: "En desarrollo", en: "In development" },
          text: { es: "Combates más ágiles. Todo opcional.", en: "Faster battles. All optional." },
          repo: "https://github.com/Batnoska/xenosaga2-definitive",
        },
      ],
    },
  };

  const SHELF = [
    "spiderman2", "needforspeedunderground2", "granturismo4", "tekken5", "dragonballzbudokai3", "guitarhero", "gtavicecity", "bully", "residentevil4", "silenthill2", "silenthill3", "fatalframe", "clocktower3",
    "ruleofrose", "devilmaycry", "devilmaycry3", "onimusha2", "godofwar", "ico", "shadowofthecolossus", "okami", "finalfantasyx", "finalfantasyx2", "finalfantasyxii", "xenosagaepisode1",
    "xenosaga2",
    "xenosagaepisode3", "shinmegamitenseinocturne", "shadowhearts", "suikoden5", "wildarms3", "valkyrieprofile2", "talesoftheabyss", "radiatastories", "roguegalaxy", "darkcloud2", "kingdomhearts", "kingdomheartsii",
  ];

  // The date the camera prints: the day Xenosaga II came out in America.
  const STAMP = "'05 02 15";

  const TEXT = {
    es: {
      title: "Parches y mods", open: "Abrir", close: "Cerrar", listTitle: "Parches",
      contact: "¿Un error?", legal: "Proyecto de fans. No incluye juegos.", credits: "Cajas:", creditsDiscs: "Discos:", creditsTv: "Tele:", creditsWood: "Madera y pared:",
      download: "Descargar", front: "Tapa de", lang: "English",
      patches: (n) => (n === 1 ? "1 parche" : `${n} parches`),
    },
    en: {
      title: "Patches & mods", open: "Open", close: "Close", listTitle: "Patches",
      contact: "Found a bug?", legal: "Fan project. No games included.", credits: "Cases:", creditsDiscs: "Discs:", creditsTv: "TV:", creditsWood: "Wood and wall:",
      download: "Download", front: "Front cover of", lang: "Español",
      patches: (n) => (n === 1 ? "1 patch" : `${n} patches`),
    },
  };

  let lang = store.get("sb-lang") || ((navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en");
  const t = () => TEXT[lang];

  /* ------------------------------------------------------------------------
     Sound: plastic, air and a CRT, synthesized, and only after a first gesture
     ------------------------------------------------------------------------ */
  const sfx = (() => {
    let ctx = null, noise = null, on = store.get("sb-sound") !== "off";
    function unlock() {
      if (!ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        ctx = new Ctx();
        noise = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      ctx.resume?.();
    }
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    const ready = () => on && ctx && ctx.state === "running";

    function burst(freq, q, dur, vol, wait = 0, type = "bandpass") {
      if (!ready()) return;
      const now = ctx.currentTime + wait, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = noise;
      f.type = type; f.frequency.value = freq; f.Q.value = q;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(vol, now + Math.min(0.012, dur / 3));
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      src.connect(f).connect(g).connect(ctx.destination);
      src.start(now, Math.random() * 0.3, dur + 0.02);
    }
    function tone(a, b, dur, vol, wait = 0, type = "sine") {
      if (!ready()) return;
      const now = ctx.currentTime + wait, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(a, now);
      o.frequency.exponentialRampToValueAtTime(b, now + dur);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(vol, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g).connect(ctx.destination);
      o.start(now);
      o.stop(now + dur + 0.02);
    }
    return {
      get on() { return on; },
      toggle() { on = !on; store.set("sb-sound", on ? "on" : "off"); return on; },
      tick() { burst(2400 + Math.random() * 1500, 3, 0.028, 0.03); },
      slide(wait = 0) { burst(1300, 0.7, 0.3, 0.06, wait); },
      clack(wait = 0) { burst(2600, 1.2, 0.03, 0.2, wait); burst(700, 1, 0.06, 0.24, wait + 0.008); tone(150, 70, 0.1, 0.16, wait + 0.008); },
      air(wait = 0) { burst(620, 0.5, 0.7, 0.05, wait); },
      blip() { tone(880, 720, 0.09, 0.04); },
      hover() { tone(520, 780, 0.14, 0.022); },
      channel() { burst(5200, 0.4, 0.17, 0.05, 0, "highpass"); },
    };
  })();

  /* ------------------------------------------------------------------------
     Shelf
     ------------------------------------------------------------------------ */
  function buildShelf() {
    const lit = SHELF.flatMap((key, i) => (GAMES[key] ? [i] : []));
    $("#row").innerHTML = SHELF.map((key, i) => {
      const game = GAMES[key];
      const dist = Math.min(...lit.map((l) => Math.abs(l - i)));
      if (game) {
        return `<button class="spine spine--on" type="button" data-game="${key}" aria-haspopup="dialog" style="--dist:0">
          <span class="spine__bloom" style="background-image:url('${game.folder}lomo.webp')"></span>
          <span class="spine__body"><span class="spine__hold">
            <span class="spine__lid"></span>
            <span class="spine__side" style="background-image:url('${game.folder}tapa.webp')"></span>
            <span class="spine__case"><img src="${game.folder}lomo.webp" alt="" width="106" height="1324" /></span>
          </span></span>
          <span class="spine__tag"><span class="spine__name"><i class="led"></i><span data-name></span></span><span class="keys" aria-hidden="true"><b class="key-x">✕</b><span data-open></span></span></span></button>`;
      }
      // A real shelf isn't perfect: each case catches the light a little differently.
      const wobble = Math.sin(i * 12.9898) * 43758.5453, jitter = wobble - Math.floor(wobble);
      const base = (Math.max(0.46, 0.76 - dist * 0.014) + (jitter - 0.5) * 0.07).toFixed(2);
      return `<span class="spine" aria-hidden="true" data-base="${base}" style="--dist:${dist};--b:${base}"><span class="spine__body"><span class="spine__hold"><span class="spine__lid"></span><span class="spine__case"><img src="./images/parches/lomos/${key}.webp" alt="" width="60" height="720" /></span></span></span></span>`;
    }).join("");
    $("#row").addEventListener("click", (e) => {
      const spine = e.target.closest("[data-game]");
      if (spine) openCase(spine.dataset.game);
    });
    $$("#row .spine--on").forEach((spine) => {
      const show = () => television.show(GAMES[spine.dataset.game]);
      spine.addEventListener("pointerenter", () => { sfx.hover(); show(); });
      spine.addEventListener("focus", show);
      spine.addEventListener("pointerleave", () => television.menu());
      spine.addEventListener("blur", () => television.menu());
    });
  }

  // However wide the window is, the games with patches stay in view: the row hangs from its
  // right end, so only as many spines as fit go on that side.
  function fitShelf() {
    const all = $$("#row .spine"), games = $(".unit__games").clientWidth;
    const lastLit = all.reduce((found, el, i) => (el.classList.contains("spine--on") ? i : found), 0);
    const width = all[0].offsetWidth || all[lastLit].offsetWidth;
    const narrow = window.matchMedia("(max-width: 760px)").matches;
    const room = narrow ? all.length : Math.max(2, Math.floor((games * 0.64 - width / 2) / width));
    all.forEach((el, i) => {
      el.classList.toggle("is-cut", i - lastLit > room);
      el.classList.remove("is-last");
    });
    if (!narrow) all[Math.min(all.length - 1, lastLit + room)].classList.add("is-last");
  }

  // What depends on where things ended up: the shadows on the wall, what the wood mirrors, and the cable.
  function stageDepth() {
    const room = $(".room"), world = $("#world"), casts = $("#casts"), glints = $("#glints"), halo = $("#tv-halo");
    const css = getComputedStyle(room), P = parseFloat(css.getPropertyValue("--P")), D = parseFloat(css.getPropertyValue("--D"));
    const px = (name) => parseFloat(css.getPropertyValue(name));
    const keep = world.style.transform;
    world.style.transform = "none";
    const R = room.getBoundingClientRect(), ox = R.left + R.width / 2;
    const narrow = window.matchMedia("(max-width: 760px)").matches;
    const boardLeft = $("#board").getBoundingClientRect().left;
    // From what the screen shows at depth z, back to where the thing really is on the plank.
    const onPlank = (x, z) => ox + (x - ox) * (P + z) / P - boardLeft;
    const size = (v, z) => v * (P + z) / P;
    let shadows = "", wood = "";

    const reflect = (src, r, z, ao = true) => {
      const left = onPlank(r.left, z), width = size(r.width, z), height = size(r.height, z);
      if (src) wood += `<img class="glint" src="${src}" alt="" style="left:${left}px;width:${width}px;top:${D - z}px;height:${height * 5}px" />`;
      if (ao) wood += `<i class="ao" style="left:${left - 3}px;width:${width + 6}px;top:${D - z - 34}px;height:68px"></i>`;
    };
    const castImg = (el) => {
      const r = el.getBoundingClientRect();
      shadows += `<img class="cast" src="${el.getAttribute("src")}" alt="" style="left:${r.left - R.left + 11}px;top:${r.top - R.top + 11}px;width:${r.width}px;height:${r.height}px" />`;
      return r;
    };

    const boardY = $("#board").getBoundingClientRect().top - R.top, eye = R.height * 0.44;
    const wallFoot = eye + (boardY - eye) * P / (P + D);
    shadows += `<div class="wall-ao" style="top:${wallFoot - 110}px;height:110px"></div>`;

    const kos = $(".fig--kos img"), kr = castImg(kos);
    if (!narrow) {
      reflect(kos.getAttribute("src"), kr, px("--kos-z"), false);
      castImg($(".fig--top img"));
      const tv = $("#tv").getBoundingClientRect(), tz = px("--tv-z");
      shadows += `<div class="cast cast--box" style="left:${tv.left - R.left + 14}px;top:${tv.top - R.top + 12}px;width:${tv.width}px;height:${tv.height}px"></div>`;
      reflect($(".tv__body").getAttribute("src"), tv, tz);
      wood += `<i class="tv-light" style="left:${onPlank(tv.left, tz) + tv.width * 0.12}px;width:${tv.width * 0.76}px;top:${D - tz}px;height:${tz}px"></i>`;
    }
    const halfW = $("#tv").getBoundingClientRect();
    halo.style.cssText += `;left:${halfW.left - R.left - halfW.width * 0.3}px;top:${halfW.top - R.top - halfW.height * 0.3}px;width:${halfW.width * 1.5}px;height:${halfW.height * 1.4}px`;

    // The row, case by case.
    const rz = px("--row-z");
    let first = null, last = null;
    $$("#row .spine").forEach((el) => {
      if (!el.offsetWidth) return;
      const r = el.getBoundingClientRect();
      if (r.right < R.left - 40 || r.left > R.right + 40) return;
      first = first || r;
      last = r;
      reflect(el.querySelector("img").getAttribute("src"), r, rz, false);
    });
    if (first && last) {
      const left = onPlank(first.left, rz), right = onPlank(last.right, rz);
      wood += `<i class="ao" style="left:${left - 300}px;width:${right - left + 303}px;top:${D - rz - 34}px;height:68px"></i>`;
      shadows += `<div class="cast cast--box" style="left:-40px;top:${first.top - R.top + 12}px;width:${last.right - R.left + 50}px;height:${first.height}px"></div>`;
    }
    casts.innerHTML = shadows;
    glints.innerHTML = wood;

    // The controller's cable, from its top corner to the console's first port.
    const cubby = $("#cubby");
    if (!narrow && cubby.offsetWidth) {
      const C = cubby.getBoundingClientRect(), m = $("#mando").getBoundingClientRect(), f = $("#ps2-front").getBoundingClientRect();
      const x1 = m.left - C.left + m.width * 0.9, y1 = m.top - C.top + 2;
      const x2 = f.left - C.left + f.width * 0.147, y2 = f.top - C.top + f.height * 0.48;
      const d = `M ${x1} ${y1} C ${x1 + 18} ${y1 - 26}, ${x2 - 70} ${y2 - 44}, ${x2 - 34} ${y2 + 26} S ${x2 - 10} ${y2 + 10}, ${x2} ${y2}`;
      $$("#cable path").forEach((path) => path.setAttribute("d", d));
      const cd = px("--cd"), pz = 26, near = ox + (f.left - ox) * (P + pz) / P - C.left, wide = size(f.width, pz), high = size(f.height, pz);
      $("#cubby-floor").innerHTML = `<img class="glint" src="${$("#ps2-front").getAttribute("src")}" alt="" style="left:${near}px;width:${wide}px;top:${cd - pz}px;height:${high * 5}px" /><i class="ao" style="left:${near - 3}px;width:${wide + 6}px;top:${cd - pz - 34}px;height:68px"></i>`;
    }
    world.style.transform = keep;
  }

  // The room reacts: a light follows the pointer, and running it along the shelf
  // lifts and leans the spines, like brushing them with a finger. With no pointer
  // around, the light wanders on its own.
  function livingRoom() {
    if (calm) return;
    const room = $(".room"), row = $("#row"), world = $("#world"), torch = $("#torch"), gloss = $("#gloss"), glossDoor = $("#gloss-door");
    const items = $$(".spine", row).map((el) => ({ el, body: $(".spine__body", el), on: el.classList.contains("spine--on"), base: Number(el.dataset.base || 1), cx: 0, lift: 0, lean: 0, glow: 0, last: "", lastB: "" }));
    let woodLeft = 0;
    const measure = () => {
      items.forEach((s) => { const r = s.el.getBoundingClientRect(); s.cx = r.left + r.width / 2; });
      woodLeft = $("#board").offsetLeft;
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    const pointer = { x: 0, y: 0, inRow: false, moved: -1e5, vx: 0, lastX: 0, index: -1, lastTick: 0 };
    let lx = window.innerWidth * 0.4, ly = room.clientHeight * 0.55, px = 0, py = 0, running = true;
    room.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const rr = row.getBoundingClientRect();
      pointer.x = e.clientX;
      pointer.y = e.clientY - room.getBoundingClientRect().top;
      pointer.inRow = e.clientY >= rr.top && e.clientY <= rr.bottom && e.clientX <= rr.right;
      pointer.vx += e.clientX - pointer.lastX;
      pointer.lastX = e.clientX;
      pointer.moved = performance.now();
      const step = Math.max(1, (items[1]?.cx ?? 1) - (items[0]?.cx ?? 0));
      const index = Math.floor((e.clientX - (items[0]?.cx ?? 0)) / step + 0.5);
      if (pointer.inRow && index !== pointer.index && performance.now() - pointer.lastTick > 42) { sfx.tick(); pointer.lastTick = performance.now(); }
      pointer.index = index;
    });
    room.addEventListener("pointerleave", () => { pointer.inRow = false; });

    function frame(now) {
      if (!running) return;
      const idle = now - pointer.moved > 3800;
      const width = window.innerWidth;
      const targetX = idle ? width * 0.42 + Math.sin(now * 0.00021) * width * 0.34 : pointer.x;
      lx += (targetX - lx) * (idle ? 0.018 : 0.09);
      ly += ((idle ? room.clientHeight * 0.5 + Math.sin(now * 0.00037) * 60 : pointer.y) - ly) * 0.07;
      torch.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`;
      const onWood = `translate3d(${(lx - woodLeft).toFixed(1)}px, 0, 0)`;
      gloss.style.transform = onWood;
      glossDoor.style.transform = onWood;

      pointer.vx *= 0.86;
      const brushing = !idle && pointer.inRow;
      const lean = clamp(pointer.vx * 0.14, -2, 2);
      for (const s of items) {
        const d = (s.cx - lx) / 140, f = Math.exp(-d * d);
        s.lift += ((brushing && !s.on ? f * 5 : 0) - s.lift) * 0.17;
        s.lean += ((brushing ? lean * f : 0) - s.lean) * 0.15;
        s.glow += (f * (idle ? 0.4 : 1) - s.glow) * 0.11;
        const transform = `translateY(${(-s.lift).toFixed(2)}px) rotate(${s.lean.toFixed(2)}deg)`;
        if (transform !== s.last) { s.body.style.transform = transform; s.last = transform; }
        const bright = (s.base + s.glow * 0.3).toFixed(2);
        if (!s.on && bright !== s.lastB) { s.el.style.setProperty("--b", bright); s.lastB = bright; }
      }

      // The camera: looking around moves everything by its real depth. Alone, it sways a little.
      const tx = idle ? Math.sin(now * 0.00026) * 0.42 : clamp((pointer.lastX / width - 0.5) * 2, -1, 1);
      const ty = idle ? Math.sin(now * 0.00019) * 0.3 : clamp((pointer.y / room.clientHeight - 0.5) * 2, -1, 1);
      px += (tx - px) * 0.045;
      py += (ty - py) * 0.045;
      world.style.transform = `translateX(${(px * -7).toFixed(2)}px) rotateX(${(py * 1).toFixed(3)}deg) rotateY(${(px * -2.3).toFixed(3)}deg)`;
      requestAnimationFrame(frame);
    }
    const resume = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
    requestAnimationFrame(frame);
    new IntersectionObserver(([entry]) => { if (entry.isIntersecting) resume(); else running = false; }).observe(room);
    livingRoom.pause = () => { running = false; };
    livingRoom.resume = () => { if (room.getBoundingClientRect().bottom > 0) resume(); };
  }

  // A little dust in the flash.
  function dust() {
    if (calm) return;
    const canvas = $("#dust"), c = canvas.getContext("2d"), room = $(".room");
    const motes = Array.from({ length: 30 }, () => ({ x: Math.random(), y: Math.random(), r: 0.5 + Math.random() * 1.3, v: 0.00003 + Math.random() * 0.00008, p: Math.random() * 6.28 }));
    let w = 0, h = 0, running = true, prev = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = room.clientWidth; h = room.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);
    function draw(now) {
      if (!running) return;
      if (state !== "closed") { requestAnimationFrame(draw); return; }
      const dt = Math.min(50, now - prev || 16);
      prev = now;
      c.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= m.v * dt;
        if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
        const a = 0.1 + 0.22 * (0.5 + 0.5 * Math.sin(now * 0.0011 + m.p * 3));
        c.fillStyle = `rgba(255, 240, 214, ${a.toFixed(3)})`;
        c.beginPath();
        c.arc((m.x + Math.sin(now * 0.00018 + m.p) * 0.012) * w, m.y * h, m.r, 0, 6.283);
        c.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    new IntersectionObserver(([entry]) => {
      const was = running;
      running = entry.isIntersecting;
      if (running && !was) requestAnimationFrame(draw);
    }).observe(room);
  }

  /* ------------------------------------------------------------------------
     The CRT: idle on the console's menu, on the game when you touch its spine
     ------------------------------------------------------------------------ */
  function television() {
    const tv = $("#tv"), ring = $("#tv-ring"), shot = $("#tv-shot"), noise = $("#tv-static"), osd = $("#tv-osd"), halo = $("#tv-halo"), spill = $("#tv-spill");
    const rc = ring.getContext("2d"), nc = noise.getContext("2d");
    let leaveTimer = 0, slideTimer = 0, burstTimer = 0, osdTimer = 0, slide = 0, current = null, staticOn = false;

    // The same ring of blue lights as the boot screen, so both feel like one machine.
    const dot = document.createElement("canvas");
    dot.width = dot.height = 48;
    const dc = dot.getContext("2d"), glow = dc.createRadialGradient(24, 24, 0, 24, 24, 24);
    glow.addColorStop(0, "rgba(235,246,255,1)");
    glow.addColorStop(0.18, "rgba(130,190,255,0.95)");
    glow.addColorStop(0.46, "rgba(40,110,255,0.3)");
    glow.addColorStop(1, "rgba(20,60,255,0)");
    dc.fillStyle = glow;
    dc.fillRect(0, 0, 48, 48);
    function sizeRing() {
      // Layout size, not the on-screen one: the picture may be mid switch-on.
      ring.width = Math.max(1, ring.offsetWidth);
      ring.height = Math.max(1, ring.offsetHeight);
      drawRing(performance.now());
    }
    function drawRing(now) {
      const w = ring.width, h = ring.height, cx = w / 2, cy = h * 0.4, R = Math.min(w, h) * 0.2, n = 12, head = now * 0.0015;
      rc.clearRect(0, 0, w, h);
      rc.globalCompositeOperation = "lighter";
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 6.283 + now * 0.00018, flare = Math.pow(1 - (((head - i) % n + n) % n) / n, 3), s = R * (0.34 + 0.68 * flare);
        rc.globalAlpha = 0.24 + 0.76 * flare;
        rc.drawImage(dot, cx + Math.cos(a) * R - s / 2, cy + Math.sin(a) * R - s / 2, s, s);
      }
      rc.globalAlpha = 1;
      rc.globalCompositeOperation = "source-over";
    }
    sizeRing();
    window.addEventListener("resize", sizeRing);
    function drawNoise() {
      const img = nc.createImageData(noise.width, noise.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 235;
        img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v + 12; img.data[i + 3] = 255;
      }
      nc.putImageData(img, 0, 0);
    }
    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(tv);
    function loop(now) {
      if (visible && state === "closed") {
        if (staticOn) drawNoise();
        else if (tv.dataset.mode === "menu") drawRing(now);
      }
      requestAnimationFrame(loop);
    }
    if (!calm) requestAnimationFrame(loop);

    // The flicker of the CRT on the wall.
    (function flicker() {
      const base = tv.dataset.mode === "menu" ? 0.52 : 0.72;
      const light = (base + Math.random() * 0.34).toFixed(2);
      halo.style.opacity = light;
      spill.style.opacity = light;
      if (!calm) setTimeout(flicker, 180 + Math.random() * Math.random() * 2400);
    })();

    function cut(apply, label) {
      clearTimeout(burstTimer);
      if (calm) { apply(); return; }
      staticOn = true;
      tv.classList.add("is-static");
      drawNoise();
      sfx.channel();
      burstTimer = setTimeout(() => {
        apply();
        staticOn = false;
        tv.classList.remove("is-static");
      }, 170);
      if (label) {
        osd.textContent = label;
        clearTimeout(osdTimer);
        osdTimer = setTimeout(() => { osd.textContent = ""; }, 1900);
      }
    }
    television.show = (game) => {
      clearTimeout(leaveTimer);
      if (current === game) return;
      current = game;
      const first = `${game.folder}${game.screens[slide % game.screens.length]}`;
      cut(() => { shot.src = first; tv.dataset.mode = "game"; }, "AV1");
      clearInterval(slideTimer);
      if (!calm) slideTimer = setInterval(() => {
        slide++;
        shot.src = `${game.folder}${game.screens[slide % game.screens.length]}`;
      }, 2600);
    };
    television.menu = () => {
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => {
        if (!current || state !== "closed") return;
        current = null;
        clearInterval(slideTimer);
        cut(() => { tv.dataset.mode = "menu"; }, "");
      }, 420);
    };
  }

  // The camera's date, in the seven-segment digits it used.
  function stamp() {
    const SEG = { 0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc", 5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abcfgd" };
    const bar = { a: [1.4, 0, 6.2, 1.5], b: [7.6, 1.2, 1.5, 6.6], c: [7.6, 9.2, 1.5, 6.6], d: [1.4, 15.5, 6.2, 1.5], e: [0, 9.2, 1.5, 6.6], f: [0, 1.2, 1.5, 6.6], g: [1.4, 7.75, 6.2, 1.5] };
    let x = 0, out = "";
    for (const ch of STAMP) {
      if (ch === " ") { x += 6; continue; }
      if (ch === "'") { out += `<rect x="${x}" y="0" width="1.6" height="4"/>`; x += 5; continue; }
      for (const s of SEG[ch]) out += `<rect x="${x + bar[s][0]}" y="${bar[s][1]}" width="${bar[s][2]}" height="${bar[s][3]}"/>`;
      x += 12;
    }
    $$(".stamp").forEach((el) => { el.innerHTML = `<svg viewBox="0 0 ${x - 3} 17" fill="currentColor">${out}</svg>`; });
  }

  function renderList() {
    $("#list").innerHTML = Object.entries(GAMES).map(([key, game]) => `
      <article class="game">
        <button class="game__cover" type="button" data-game="${key}" aria-haspopup="dialog" aria-label="${t().open}: ${game.title}"><img src="${game.folder}tapa.webp" alt="" width="940" height="1324" loading="lazy" /></button>
        <div>
          <h3 class="game__name">${game.title}</h3>
          ${game.patches.map((p) => `
            <div class="row">
              <span>${p.name[lang]}</span>
              <span class="row__status">${p.status[lang]}</span>
              <span class="row__links">
                ${p.download ? `<a class="is-main" href="${p.download}" target="_blank" rel="noopener">${t().download}</a>` : ""}
                <a href="${p.repo}" target="_blank" rel="noopener">GitHub</a>
              </span>
            </div>`).join("")}
        </div>
      </article>`).join("");
  }
  $("#list").addEventListener("click", (e) => {
    const cover = e.target.closest("[data-game]");
    if (cover) openCase(cover.dataset.game);
  });

  /* ------------------------------------------------------------------------
     The case
     ------------------------------------------------------------------------ */
  const dialog = $("#case"), fly = $("#fly"), tilt = $("#tilt"), box = $("#box"), tray = $("#tray"), menu = $("#menu");
  const phone = window.matchMedia("(max-width: 760px)");
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const REST = "translate3d(0px, 0px, 0px) rotateY(0deg) scale3d(1, 1, 1)";
  let game = null, selected = 0, spineEl = null, flight = null, run = 0, state = "closed";

  function fillCase(key) {
    game = GAMES[key];
    $("#case-spine").src = `${game.folder}lomo.webp`;
    $("#case-front").src = `${game.folder}tapa.webp`;
    $("#case-front").alt = `${t().front} ${game.title}`;
    $("#screen-art").style.backgroundImage = `url('${game.folder}portada.webp')`;
    $("#screen-logo").src = `${game.folder}logo.webp`;
    $("#screen-logo").alt = game.title;
    $("#bloom").style.backgroundImage = `url('${game.folder}tapa.webp')`;
    tray.dataset.n = String(game.discs.length);
    tray.innerHTML = game.discs.map((disc) => `<span class="disc"><img src="${game.folder}${disc}" alt="" width="281" height="281" /></span>`).join("");
    menu.innerHTML = `${game.patches.map((p, i) => `<a class="menu__item" href="${p.download || p.repo}" target="_blank" rel="noopener" data-i="${i}">${p.name[lang]}</a>`).join("")}<p class="menu__help" id="menu-help"></p><div class="menu__keys" id="menu-keys"></div>`;
    selectPatch(0);
    placeMenu();
  }
  function placeMenu() { (phone.matches ? $("#sheet") : $("#screen")).append(menu); }
  phone.addEventListener("change", placeMenu);

  // Like a game's menu: one option lit at a time, with a line of help and its button prompts.
  function selectPatch(i, sound) {
    if (sound && i !== selected) sfx.blip();
    selected = i;
    const p = game.patches[i];
    $$(".menu__item", menu).forEach((item, k) => item.classList.toggle("is-on", k === i));
    const help = $("#menu-help", menu);
    help.textContent = `${p.status[lang]} · ${p.text[lang]}`;
    help.style.animation = "none";
    void help.offsetWidth;
    help.style.animation = "";
    $("#menu-keys", menu).innerHTML = `
      ${p.download ? `<a class="key" href="${p.download}" target="_blank" rel="noopener"><b class="key-x" aria-hidden="true">✕</b>${t().download}</a>` : ""}
      <a class="key" href="${p.repo}" target="_blank" rel="noopener"><b class="key-t" aria-hidden="true">△</b>GitHub</a>`;
  }
  menu.addEventListener("pointerover", (e) => {
    const item = e.target.closest(".menu__item");
    if (item && e.pointerType !== "touch") selectPatch(Number(item.dataset.i), true);
  });
  menu.addEventListener("focusin", (e) => {
    const item = e.target.closest(".menu__item");
    if (item) selectPatch(Number(item.dataset.i), true);
  });
  // On touch there is no hover: the first tap selects, the second one opens.
  menu.addEventListener("click", (e) => {
    const item = e.target.closest(".menu__item");
    if (item && !fine && Number(item.dataset.i) !== selected) { e.preventDefault(); selectPatch(Number(item.dataset.i), true); }
  });
  dialog.addEventListener("keydown", (e) => {
    if (state !== "open" || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    const n = game.patches.length, next = (selected + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
    selectPatch(next, true);
    $$(".menu__item", menu)[next].focus();
  });

  // Where the case has to be for its spine to sit exactly on the one in the shelf.
  function atShelf() {
    const spine = $(".spine__case", spineEl).getBoundingClientRect();
    const rest = fly.getBoundingClientRect();
    const scale = spine.height / rest.height;
    const dx = spine.left + spine.width / 2 - (rest.left + rest.width / 2);
    const dy = spine.top + spine.height / 2 - (rest.top + rest.height / 2);
    const z = (-rest.width * scale) / 2;
    const place = (depth) => `translate3d(${dx}px, ${dy}px, ${depth}px) rotateY(90deg) scale3d(${scale}, ${scale}, ${scale})`;
    return { home: place(z), pulled: place(z + rest.width * scale * 1.1) };
  }

  async function openCase(key) {
    if (state !== "closed") return;
    const id = ++run;
    state = "opening";
    spineEl = $(`#row [data-game="${key}"]`);
    fillCase(key);
    dialog.showModal();
    dialog.classList.add("is-up");
    box.classList.toggle("no-motion", calm);
    livingRoom.pause?.();
    if (calm) {
      box.classList.add("is-open");
      dialog.classList.add("is-open");
      spineEl.classList.add("is-out");
      state = "open";
      return;
    }
    const { home, pulled } = atShelf();
    spineEl.classList.add("is-out");
    fly.classList.add("is-flying");
    sfx.slide();
    flight = fly.animate(
      [
        { transform: home, easing: "cubic-bezier(0.3, 0.1, 0.3, 1)" },
        { transform: pulled, offset: 0.26, easing: "cubic-bezier(0.42, 0.25, 0.2, 1)" },
        { transform: REST },
      ],
      { duration: 1200, fill: "both" }
    );
    try { await flight.finished; } catch { return; }
    if (id !== run) return;
    fly.classList.remove("is-flying");
    await wait(140);
    if (id !== run) return;
    box.classList.add("is-open");
    dialog.classList.add("is-open");
    sfx.clack();
    sfx.air(0.05);
    state = "open";
  }

  async function closeCase() {
    if (state === "closed" || state === "closing") return;
    const id = ++run;
    const wasOpen = box.classList.contains("is-open");
    state = "closing";
    resetTilt();
    dialog.classList.remove("is-open");
    box.classList.remove("is-open");
    fly.classList.remove("is-flying");
    if (calm) { finishClose(); return; }
    if (wasOpen) {
      sfx.air();
      await wait(640);
      if (id !== run) return;
      sfx.clack();
    }
    const from = getComputedStyle(fly).transform;
    flight?.cancel();
    const { home, pulled } = atShelf();
    dialog.classList.remove("is-up");
    sfx.slide(0.42);
    flight = fly.animate(
      [
        { transform: from === "none" ? REST : from, easing: "cubic-bezier(0.45, 0, 0.5, 1)" },
        { transform: pulled, offset: 0.72, easing: "cubic-bezier(0.4, 0, 0.5, 1)" },
        { transform: home },
      ],
      { duration: 860, fill: "both" }
    );
    try { await flight.finished; } catch { return; }
    if (id !== run) return;
    finishClose();
  }

  function finishClose() {
    spineEl?.classList.remove("is-out");
    dialog.classList.remove("is-up", "is-open");
    dialog.close();
    flight?.cancel();
    flight = null;
    state = "closed";
    livingRoom.resume?.();
    if (!spineEl?.matches(":hover")) television.menu();
  }

  // Clicking anywhere that isn't the case puts it back.
  dialog.addEventListener("click", (e) => {
    if (!e.target.closest(".tray, .lid__in, .lid__out, .case__sheet")) closeCase();
  });
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeCase();
  });

  // Once open, the case follows the pointer a little, and light slides over the discs.
  let tiltX = 0, tiltY = 0, goalX = 0, goalY = 0, tilting = false;
  function tiltFrame() {
    tiltX += (goalX - tiltX) * 0.07;
    tiltY += (goalY - tiltY) * 0.07;
    tilt.style.transform = `rotateX(${tiltX.toFixed(3)}deg) rotateY(${tiltY.toFixed(3)}deg)`;
    if (Math.abs(goalX - tiltX) + Math.abs(goalY - tiltY) > 0.004) requestAnimationFrame(tiltFrame);
    else tilting = false;
  }
  function resetTilt() {
    goalX = goalY = 0;
    if (!tilting && !calm) { tilting = true; requestAnimationFrame(tiltFrame); }
  }
  if (!calm && fine) {
    dialog.addEventListener("pointermove", (e) => {
      if (state !== "open") return;
      const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      goalY = x * 3.4;
      goalX = y * -2.4;
      if (!tilting) { tilting = true; requestAnimationFrame(tiltFrame); }
      $$(".disc", tray).forEach((disc, i) => disc.style.setProperty("--a", `${(x * 170 + y * 120 + i * 40).toFixed(1)}deg`));
    });
  }

  /* ------------------------------------------------------------------------
     Language and controls
     ------------------------------------------------------------------------ */
  function paint() {
    html.lang = lang;
    document.title = `${t().title} · Santiago Batnoska`;
    $$("[data-t]").forEach((el) => { el.textContent = t()[el.dataset.t]; });
    $("#lang").textContent = t().lang;
    $$("#row [data-game]").forEach((spine) => {
      const g = GAMES[spine.dataset.game];
      $("[data-name]", spine).textContent = g.title;
      $("[data-open]", spine).textContent = t().open;
      spine.setAttribute("aria-label", `${g.title}: ${t().patches(g.patches.length)}`);
    });
    renderList();
  }
  $("#lang").addEventListener("click", () => {
    lang = lang === "es" ? "en" : "es";
    store.set("sb-lang", lang);
    sfx.blip();
    paint();
  });
  const soundBtn = $("#sound");
  soundBtn.setAttribute("aria-pressed", String(sfx.on));
  soundBtn.addEventListener("click", () => {
    soundBtn.setAttribute("aria-pressed", String(sfx.toggle()));
    sfx.blip();
  });

  buildShelf();
  fitShelf();
  let settle = 0;
  window.addEventListener("resize", () => {
    fitShelf();
    clearTimeout(settle);
    settle = setTimeout(stageDepth, 120);
  });
  paint();
  stamp();
  television();
  livingRoom();
  dust();
  stageDepth();
  window.addEventListener("load", stageDepth);
  const list = $(".list");
  if (calm || !("IntersectionObserver" in window)) list.classList.add("is-in");
  else new IntersectionObserver(([entry], io) => { if (entry.isIntersecting) { list.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.15 }).observe(list);
})();
