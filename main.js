/* SHIFT/ — One fit. Four worlds. */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------ */
  /* Worlds                                                              */
  /* ------------------------------------------------------------------ */
  const WORLDS = [
    { id: 'acid', name: 'ACID', split: 2,
      desc: 'Lab-grown lime. Reactive print glows under strip light.',
      vars: { '--bg': '#0a0d04', '--bg2': '#141a07', '--acc': '#c8ff1a', '--acc2': '#f0ff9e', '--hood': '#a9e80c', '--ink': '#f4f7e8', '--on': '#0a0d04' } },
    { id: 'ember', name: 'EMBER', split: 2,
      desc: 'Heat-mapped fleece, burnt at the edges, warm to the core.',
      vars: { '--bg': '#0f0503', '--bg2': '#1d0904', '--acc': '#ff5b1f', '--acc2': '#ffc23a', '--hood': '#f2581c', '--ink': '#fff1e8', '--on': '#140503' } },
    { id: 'glacier', name: 'GLACIER', split: 3,
      desc: 'Ice-washed cotton that moves like silk in a cold wind.',
      vars: { '--bg': '#030c16', '--bg2': '#071a2b', '--acc': '#7ad8ff', '--acc2': '#e6fbff', '--hood': '#8fd0ee', '--ink': '#eefaff', '--on': '#03111c' } },
    { id: 'uv', name: 'ULTRAVIOLET', split: 5,
      desc: 'The after-hours colourway. Built for laser light and 4am.',
      vars: { '--bg': '#07030f', '--bg2': '#130826', '--acc': '#b066ff', '--acc2': '#ff4fd8', '--hood': '#7f3bf0', '--ink': '#f5eeff', '--on': '#0b0418' } },
  ];

  let cur = 0;
  const params = new URLSearchParams(location.search);
  const deep = WORLDS.findIndex(w => w.id === (params.get('world') || '').toLowerCase());
  if (deep > -1) cur = deep;

  const halfL = $('#halfL'), halfR = $('#halfR'), measure = $('#measure');
  const stage = $('#stage'), figWrap = $('#figWrap');
  const btns = $$('.world-btn');
  const wIdx = $('#wIdx'), wDesc = $('#wDesc');
  const autoLabel = $('#autoLabel');
  const metaTheme = $('meta[name="theme-color"]');

  function applyVars(w, instant) {
    if (hasGsap && !instant) gsap.to(root, { ...w.vars, duration: 0.9, ease: 'power2.inOut', overwrite: 'auto' });
    else Object.entries(w.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    metaTheme.setAttribute('content', w.vars['--bg']);
  }

  /* text scramble */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/#%&@$0123456789';
  function scramble(el, to, dur = 0.85) {
    cancelAnimationFrame(el._raf);
    if (reduce) { el.textContent = to; return; }
    const from = el.textContent;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / (dur * 1000));
      const len = Math.round(from.length + (to.length - from.length) * Math.min(1, p * 1.8));
      let out = '';
      for (let i = 0; i < len; i++) {
        const settle = 0.35 + (i / Math.max(1, len)) * 0.55;
        out += (p >= settle && i < to.length) ? to[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) el._raf = requestAnimationFrame(step);
      else el.textContent = to;
    };
    el._raf = requestAnimationFrame(step);
  }

  /* fit the two halves of the world name around the figure */
  const isMobile = () => window.innerWidth <= 760;
  function widthOf(txt) { measure.textContent = txt; return measure.getBoundingClientRect().width || 1; }
  function fitTitle(animate) {
    const w = WORLDS[cur];
    const a = w.name.slice(0, w.split), b = w.name.slice(w.split);
    const wa = widthOf(a), wb = widthOf(b);
    const lh = 200 * 0.84;
    const sr = stage.getBoundingClientRect();
    const figW = figWrap.getBoundingClientRect().width;
    let s, gap;
    if (!isMobile()) {
      gap = figW * 0.2;
      const avail = sr.width / 2 - gap - Math.max(20, sr.width * 0.03);
      s = Math.min(avail / Math.max(wa, wb), (sr.height * 0.66) / lh);
    } else {
      gap = 0;
      s = Math.min((sr.width - 32) / Math.max(wa, wb), (sr.height * 0.3) / lh);
    }
    const mob = isMobile();
    const d = animate && hasGsap && !reduce ? 0.9 : 0;
    const common = { scale: s, yPercent: mob ? 0 : -50, duration: d, ease: 'expo.out', overwrite: 'auto' };
    if (hasGsap) {
      gsap.to(halfL, { ...common, x: -gap });
      gsap.to(halfR, { ...common, x: gap });
    } else {
      halfL.style.transform = `translate(${-gap}px, ${mob ? 0 : -50}%) scale(${s})`;
      halfR.style.transform = `translate(${gap}px, ${mob ? 0 : -50}%) scale(${s})`;
    }
  }

  function jump() {
    if (reduce || !hasGsap) return;
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
    tl.to('#figJump', { scaleY: 0.93, scaleX: 1.05, duration: 0.14, ease: 'power2.in' })
      .to('#figJump', { y: () => -figWrap.offsetHeight * 0.075, scaleY: 1.05, scaleX: 0.97, rotation: -2, duration: 0.3, ease: 'power3.out' })
      .to('#figJump', { y: 0, scaleY: 1, scaleX: 1, rotation: 0, duration: 0.32, ease: 'power2.in' })
      .to('#figJump', { scaleY: 0.96, scaleX: 1.03, duration: 0.08, ease: 'power1.out' })
      .to('#figJump', { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    gsap.timeline()
      .to('#figShadow', { scaleX: 1.1, duration: 0.14 })
      .to('#figShadow', { scaleX: 0.6, opacity: 0.45, duration: 0.3, ease: 'power3.out' })
      .to('#figShadow', { scaleX: 1, opacity: 1, duration: 0.32, ease: 'power2.in' });
  }

  function wipe() {
    if (reduce || !hasGsap) return;
    gsap.fromTo('.wipe', { xPercent: -120 }, { xPercent: 120, duration: 0.9, ease: 'power3.inOut' });
  }

  function setWorld(i, opts = {}) {
    const prev = cur;
    cur = (i + WORLDS.length) % WORLDS.length;
    const w = WORLDS[cur];
    btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === cur)));
    applyVars(w, opts.instant);
    wIdx.textContent = String(cur + 1).padStart(2, '0');
    wDesc.textContent = w.desc;
    if (opts.instant) {
      halfL.textContent = w.name.slice(0, w.split);
      halfR.textContent = w.name.slice(w.split);
      fitTitle(false);
      scene.set(cur, true);
      return;
    }
    scramble(halfL, w.name.slice(0, w.split));
    scramble(halfR, w.name.slice(w.split), 0.95);
    fitTitle(true);
    if (prev !== cur) { jump(); wipe(); }
    scene.set(cur, false);
  }

  /* auto cycle until the user picks */
  const AUTO_MS = 4.6;
  let autoOn = !reduce && deep === -1;
  let autoCall = null, progTween = null;
  function scheduleAuto() {
    if (!autoOn || !hasGsap) return;
    autoCall && autoCall.kill();
    progTween && progTween.kill();
    $$('.prog').forEach(p => gsap.set(p, { scaleX: 0 }));
    progTween = gsap.fromTo(btns[cur].querySelector('.prog'), { scaleX: 0 }, { scaleX: 1, duration: AUTO_MS, ease: 'none' });
    autoCall = gsap.delayedCall(AUTO_MS, () => { setWorld(cur + 1); scheduleAuto(); });
  }
  function stopAuto() {
    autoOn = false;
    autoCall && autoCall.kill();
    progTween && progTween.kill();
    if (hasGsap) $$('.prog').forEach(p => gsap.to(p, { scaleX: 0, duration: 0.3 }));
    autoLabel.classList.add('off');
    autoLabel.lastChild.textContent = 'AUTO-SHIFT OFF';
  }
  if (!autoOn) { autoLabel.classList.add('off'); autoLabel.lastChild.textContent = 'AUTO-SHIFT OFF'; }

  btns.forEach((b, k) => b.addEventListener('click', () => {
    stopAuto();
    if (k !== cur) setWorld(k);
    else jump();
  }));

  /* keyboard: arrow keys move between worlds inside the group */
  $('.worlds').addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const k = btns.indexOf(document.activeElement);
    if (k < 0) return;
    e.preventDefault();
    btns[(k + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length].focus();
  });

  /* pointer parallax */
  if (!reduce && hasGsap && window.matchMedia('(hover: hover)').matches) {
    const hero = $('.hero');
    const qx = [gsap.quickTo('#figIdle', 'x', { duration: 0.8, ease: 'power3' }),
                gsap.quickTo(stage.querySelector('.meta-l'), 'x', { duration: 1, ease: 'power3' })];
    const lx = gsap.quickTo(halfL, 'rotationY', { duration: 1, ease: 'power3' });
    const rx = gsap.quickTo(halfR, 'rotationY', { duration: 1, ease: 'power3' });
    hero.addEventListener('pointermove', e => {
      const nx = e.clientX / window.innerWidth - 0.5;
      qx[0](nx * 18); qx[1](nx * -10);
      lx(nx * 10); rx(nx * 10);
    });
  }

  /* idle breathing */
  if (!reduce && hasGsap) {
    gsap.to('#figIdle', { scaleY: 1.008, y: -3, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  /* ------------------------------------------------------------------ */
  /* Canvas scenes                                                       */
  /* ------------------------------------------------------------------ */
  const scene = (() => {
    const cv = $('#scene');
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, DPR = 1;
    let A = 1; // scene alpha during cross-fades
    const ga = a => { ctx.globalAlpha = Math.max(0, Math.min(1, a * A)); };
    const rand = (a, b) => a + Math.random() * (b - a);

    const acid = {
      init() {
        this.strips = Array.from({ length: 16 }, (_, i) => ({ z: i / 16, side: i % 2 ? 1 : -1, f: Math.random() * 100, frame: i % 4 === 0 }));
        this.specks = Array.from({ length: 70 }, () => ({ x: rand(0, W), y: rand(0, H), r: rand(0.4, 1.8), v: rand(6, 22) }));
      },
      draw(t, dt) {
        const cx = W / 2, cy = H * 0.44;
        ctx.globalCompositeOperation = 'source-over';
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.8);
        g.addColorStop(0, '#26360a'); g.addColorStop(0.45, '#0c1204'); g.addColorStop(1, '#030401');
        ga(1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        // perspective floor + ceiling rails
        ctx.lineWidth = 1;
        for (let i = -10; i <= 10; i++) {
          ga(0.13); ctx.strokeStyle = '#c8ff1a';
          ctx.beginPath(); ctx.moveTo(cx + i * 5, cy + H * 0.03); ctx.lineTo(cx + i * W * 0.2, H); ctx.stroke();
          ga(0.06);
          ctx.beginPath(); ctx.moveTo(cx + i * 5, cy - H * 0.03); ctx.lineTo(cx + i * W * 0.2, 0); ctx.stroke();
        }
        // floor bands moving toward the viewer
        for (let k = 0; k < 10; k++) {
          const f = ((k / 10) + t * 0.05) % 1;
          const y = cy + H * 0.03 + (H - cy) * Math.pow(f, 2.3);
          ga(0.12 * f); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
        // glowing light strips (tunnel)
        const sorted = this.strips.slice().sort((a, b) => b.z - a.z);
        ctx.lineCap = 'round';
        for (const s of sorted) {
          s.z -= dt * 0.055; if (s.z <= 0) s.z += 1;
          const p = 1 / (0.13 + s.z * 2.4);
          const fade = Math.min(1, (1 - s.z) * 1.4) * Math.min(1, s.z * 7);
          const flick = Math.sin(t * 31 + s.f) > 0.985 ? 0.25 : 1;
          const a = fade * flick;
          const hw = W * 0.085 * p, hh = H * 0.075 * p;
          if (s.frame) {
            ga(a * 0.35); ctx.strokeStyle = '#c8ff1a'; ctx.lineWidth = Math.max(1, 1.4 * p);
            ctx.strokeRect(cx - hw, cy - hh, hw * 2, hh * 2);
            continue;
          }
          const x = cx + s.side * hw;
          for (const [lw, al, col] of [[18 * p, 0.05, '#9dff00'], [7 * p, 0.14, '#c8ff1a'], [2.2 * p, 0.95, '#f4ffd0']]) {
            ga(al * a); ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, lw);
            ctx.beginPath(); ctx.moveTo(x, cy - hh * 0.9); ctx.lineTo(x, cy + hh * 0.9); ctx.stroke();
          }
          // ceiling strip
          ga(0.5 * a); ctx.strokeStyle = '#e8ffa0'; ctx.lineWidth = Math.max(1, 1.6 * p);
          ctx.beginPath(); ctx.moveTo(cx - hw * 0.25, cy - hh); ctx.lineTo(cx + hw * 0.25, cy - hh); ctx.stroke();
        }
        // haze + specks
        const hz = ctx.createLinearGradient(0, cy - H * 0.2, 0, cy + H * 0.2);
        hz.addColorStop(0, 'rgba(200,255,26,0)'); hz.addColorStop(0.5, 'rgba(200,255,26,.10)'); hz.addColorStop(1, 'rgba(200,255,26,0)');
        ga(1); ctx.fillStyle = hz; ctx.fillRect(0, cy - H * 0.2, W, H * 0.4);
        ctx.fillStyle = '#d8ff6a';
        for (const s of this.specks) {
          s.y -= s.v * dt; if (s.y < -4) { s.y = H + 4; s.x = rand(0, W); }
          ga(0.35 + 0.35 * Math.sin(t * 3 + s.x)); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      },
    };

    const ember = {
      spawn(any) { return { x: rand(0, W), y: any ? rand(0, H) : H + rand(0, 40), r: rand(0.6, 2.8), vy: rand(30, 110), ph: rand(0, 6.28), sw: rand(10, 40) }; },
      init() { this.p = Array.from({ length: Math.min(260, Math.round((W * H) / 6500)) }, () => this.spawn(true)); },
      draw(t, dt) {
        ctx.globalCompositeOperation = 'source-over';
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#0a0201'); g.addColorStop(0.55, '#2a0903'); g.addColorStop(1, '#7a2004');
        ga(1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        // fire glow blobs
        for (let k = 0; k < 5; k++) {
          const x = W * (0.1 + k * 0.2) + Math.sin(t * 0.7 + k * 2) * W * 0.05;
          const r = H * (0.45 + 0.08 * Math.sin(t * 1.3 + k));
          const rg = ctx.createRadialGradient(x, H * 1.02, 0, x, H * 1.02, r);
          rg.addColorStop(0, 'rgba(255,120,30,.45)'); rg.addColorStop(0.5, 'rgba(255,60,10,.12)'); rg.addColorStop(1, 'rgba(255,40,0,0)');
          ga(0.8 + 0.2 * Math.sin(t * 5 + k * 3)); ctx.fillStyle = rg; ctx.fillRect(x - r, H * 1.02 - r, r * 2, r);
        }
        // flame tongues
        for (let k = 0; k < 6; k++) {
          ctx.beginPath();
          const y0 = H * (0.66 + k * 0.06);
          ctx.moveTo(0, H);
          for (let x = 0; x <= W + 20; x += 20) {
            const y = y0 + Math.sin(x * 0.009 + t * (1.4 + k * 0.3) + k) * (10 + k * 5) + Math.sin(x * 0.023 - t * 2.2) * 6;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(W, H); ctx.closePath();
          ga(0.07); ctx.fillStyle = k % 2 ? '#ff7a1a' : '#ff3d0a'; ctx.fill();
        }
        // embers
        for (const p of this.p) {
          p.y -= p.vy * dt; p.x += Math.sin(t * 1.6 + p.ph) * p.sw * dt;
          if (p.y < -10) Object.assign(p, this.spawn(false));
          const life = Math.max(0, Math.min(1, p.y / H));
          const col = life > 0.5 ? '255,190,70' : '255,110,30';
          ga((0.15 + 0.85 * life) * (0.6 + 0.4 * Math.sin(t * 9 + p.ph)));
          ctx.fillStyle = `rgba(${col},.18)`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
          ctx.fillStyle = `rgba(${col},1)`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        // heat shimmer: displace the lower half of the canvas in thin slices
        if (!reduce) {
          const top = Math.floor(H * 0.5), sl = 6;
          ga(1);
          for (let y = top; y < H; y += sl) {
            const off = Math.sin(y * 0.06 + t * 7) * 2.2 * ((y - top) / (H - top));
            ctx.drawImage(cv, 0, y * DPR, cv.width, sl * DPR, off, y, W, sl);
          }
        }
      },
    };

    const glacier = {
      init() { this.snow = Array.from({ length: 90 }, () => ({ x: rand(0, W), y: rand(0, H), r: rand(0.5, 2), v: rand(8, 26), ph: rand(0, 6.28) })); },
      draw(t, dt) {
        ctx.globalCompositeOperation = 'source-over';
        const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        g.addColorStop(0, '#020913'); g.addColorStop(0.55, '#082a43'); g.addColorStop(1, '#0d4561');
        ga(1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        const sun = ctx.createRadialGradient(W * 0.75, H * 0.15, 0, W * 0.75, H * 0.15, H * 0.7);
        sun.addColorStop(0, 'rgba(180,235,255,.22)'); sun.addColorStop(1, 'rgba(180,235,255,0)');
        ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        const step = Math.max(10, W / 110);
        for (let r = 0; r < 6; r++) {
          const base = H * (0.14 + r * 0.15);
          const amp = H * (0.07 + 0.015 * (r % 3));
          const thick = H * (0.035 + 0.012 * (r % 3));
          let px = null, pt = null, pb = null;
          for (let x = -step; x <= W + step; x += step) {
            const u = x / W;
            const y = base + Math.sin(u * 4.6 + t * 0.55 + r * 1.3) * amp + Math.sin(u * 10.5 - t * 0.8 + r) * amp * 0.25;
            const ph = u * 3.3 - t * 0.6 + r * 2.1;
            const th = thick * Math.sin(ph);
            const top = y - th, bot = y + th;
            if (px !== null) {
              const face = Math.sin(ph) > 0;
              const hl = Math.abs(Math.cos(ph));
              ga(0.06 + 0.3 * hl);
              ctx.fillStyle = face ? (r % 2 ? '#bdeeff' : '#8fd8ff') : '#3f9ccc';
              ctx.beginPath(); ctx.moveTo(px, pt); ctx.lineTo(x, top); ctx.lineTo(x, bot); ctx.lineTo(px, pb); ctx.closePath(); ctx.fill();
              ga(0.12 + 0.5 * hl); ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(px, pt); ctx.lineTo(x, top); ctx.stroke();
            }
            px = x; pt = top; pb = bot;
          }
        }
        ctx.fillStyle = '#ffffff';
        for (const s of this.snow) {
          s.y += s.v * dt; s.x += Math.sin(t + s.ph) * 10 * dt;
          if (s.y > H + 4) { s.y = -4; s.x = rand(0, W); }
          ga(0.25 + 0.5 * Math.abs(Math.sin(t * 2 + s.ph))); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      },
    };

    const uv = {
      init() { this.stars = Array.from({ length: 80 }, () => ({ x: rand(0, W), y: rand(0, H * 0.55), r: rand(0.4, 1.4), ph: rand(0, 6.28) })); },
      draw(t) {
        const hz = H * 0.6, cx = W / 2;
        ctx.globalCompositeOperation = 'source-over';
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#040109'); g.addColorStop(0.5, '#1f0a3d'); g.addColorStop(0.6, '#3a0f5e'); g.addColorStop(0.61, '#0c0420'); g.addColorStop(1, '#07020f');
        ga(1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = '#ffffff';
        for (const s of this.stars) { ga(0.2 + 0.4 * Math.abs(Math.sin(t * 1.5 + s.ph))); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); }
        const glow = ctx.createRadialGradient(cx, hz, 0, cx, hz, W * 0.6);
        glow.addColorStop(0, 'rgba(255,79,216,.45)'); glow.addColorStop(0.4, 'rgba(176,102,255,.15)'); glow.addColorStop(1, 'rgba(176,102,255,0)');
        ga(1); ctx.fillStyle = glow; ctx.fillRect(0, hz - W * 0.6, W, W * 1.2);
        // laser grid floor
        const grid = (dir, alpha) => {
          const span = dir > 0 ? H - hz : hz;
          for (let i = -22; i <= 22; i++) {
            const xb = cx + i * W * 0.09;
            for (const [lw, al] of [[5, 0.08], [1.4, 0.7]]) {
              ga(al * alpha); ctx.strokeStyle = '#c38bff'; ctx.lineWidth = lw;
              ctx.beginPath(); ctx.moveTo(cx + i * 3, hz); ctx.lineTo(xb, hz + dir * span); ctx.stroke();
            }
          }
          for (let k = 0; k < 16; k++) {
            const f = ((k / 16) + t * 0.09) % 1;
            const y = hz + dir * span * Math.pow(f, 2.6);
            for (const [lw, al] of [[6, 0.08], [1.5, 0.8]]) {
              ga(al * alpha * Math.min(1, f * 3)); ctx.strokeStyle = k % 4 === 0 ? '#ff4fd8' : '#b066ff'; ctx.lineWidth = lw * (0.4 + f);
              ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
            }
          }
        };
        grid(1, 1);
        grid(-1, 0.18);
        // horizon line
        ga(0.9); ctx.strokeStyle = '#ffb3f0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, hz); ctx.lineTo(W, hz); ctx.stroke();
        // sweeping lasers
        for (let j = 0; j < 4; j++) {
          const ox = W * (0.08 + 0.28 * j), oy = -20;
          const ang = Math.PI / 2 + Math.sin(t * 0.6 + j * 1.9) * 0.7;
          const len = H * 1.4;
          const ex = ox + Math.cos(ang) * len, ey = oy + Math.sin(ang) * len;
          const lg = ctx.createLinearGradient(ox, oy, ex, ey);
          lg.addColorStop(0, j % 2 ? 'rgba(255,79,216,.9)' : 'rgba(176,102,255,.9)'); lg.addColorStop(1, 'rgba(176,102,255,0)');
          ctx.strokeStyle = lg;
          for (const [lw, al] of [[14, 0.08], [2, 0.75]]) {
            ga(al); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke();
          }
        }
        ctx.globalCompositeOperation = 'source-over';
      },
    };

    const scenes = [acid, ember, glacier, uv];
    let idx = cur, prev = -1, mix = 1, t = 0, last = 0, running = false, visible = true, raf = 0;

    function resize() {
      const r = cv.getBoundingClientRect();
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      scenes.forEach(s => s.init());
      if (!running) frame(0, true);
    }

    function render(dt) {
      if (prev > -1 && mix < 1) {
        A = 1; scenes[prev].draw(t, dt);
        A = mix; scenes[idx].draw(t, dt);
      } else {
        A = 1; scenes[idx].draw(t, dt);
      }
      ctx.globalAlpha = 1;
    }

    function frame(now, once) {
      const dt = once ? 0.016 : Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      t += dt;
      render(dt);
      if (!once && running) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduce) return;
      running = true; last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function sync() { (visible && !document.hidden) ? start() : stop(); }

    new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }, { threshold: 0 }).observe(cv);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', resize);
    resize();

    return {
      start: sync,
      set(i, instant) {
        if (i === idx && !instant) return;
        prev = idx; idx = i;
        if (instant || reduce || !hasGsap) { mix = 1; prev = -1; if (!running) frame(0, true); return; }
        const o = { m: 0 }; mix = 0;
        gsap.to(o, { m: 1, duration: 1.1, ease: 'power2.inOut', onUpdate: () => { mix = o.m; }, onComplete: () => { prev = -1; mix = 1; } });
      },
    };
  })();

  /* ------------------------------------------------------------------ */
  /* Marquee                                                             */
  /* ------------------------------------------------------------------ */
  const DROPS = [['01', 'Acid Rain'], ['02', 'Ember Core'], ['03', 'Glacier Silk'], ['04', 'UV Nightshift'], ['05', 'Static Bloom'], ['06', 'Low Orbit'], ['07', 'Four Worlds'], ['08', 'Nightshift — soon']];
  const itemsA = DROPS.map(([n, d]) => `<span class="item"><small>DROP ${n}</small>${d}<i class="star"></i></span>`).join('');
  const itemsB = ['Heavyweight 480gsm', 'Dyed to order', 'Free returns', 'Built to be worn loud', 'Made in small runs', 'Four worlds, one fit']
    .map(s => `<span class="item">${s} <i class="star"></i></span>`).join('');
  $('#trackA').innerHTML = itemsA + `<span aria-hidden="true" style="display:contents">${itemsA}</span>`;
  $('#trackB').innerHTML = itemsB + itemsB + itemsB + itemsB;

  /* ------------------------------------------------------------------ */
  /* Shop the look                                                       */
  /* ------------------------------------------------------------------ */
  const grad = id => `
    <linearGradient id="${id}G" x1="0" x2="1"><stop offset="0" style="stop-color:var(--pd)"/><stop offset=".3" style="stop-color:var(--p)"/><stop offset=".55" style="stop-color:var(--pl)"/><stop offset=".8" style="stop-color:var(--p)"/><stop offset="1" style="stop-color:var(--pd)"/></linearGradient>
    <radialGradient id="${id}R" cx=".35" cy=".3" r=".8"><stop offset="0" style="stop-color:var(--pl)"/><stop offset=".5" style="stop-color:var(--p)"/><stop offset="1" style="stop-color:var(--pd)"/></radialGradient>
    <linearGradient id="${id}W" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#c9c8cf"/></linearGradient>
    <pattern id="${id}Rib" width="5" height="10" patternUnits="userSpaceOnUse"><rect width="2" height="10" fill="#000" fill-opacity=".22"/></pattern>`;

  const ART = {
    hoodie: id => `<svg viewBox="0 0 220 220" aria-hidden="true"><defs>${grad(id)}</defs>
      <path d="M78 42 C82 14 138 14 142 42 L132 58 L88 58 Z" style="fill:var(--pd)"/>
      <path d="M72 44 C86 56 134 56 148 44 L178 56 C192 62 198 76 200 92 L210 166 C202 170 192 172 184 172 L172 110 L170 186 L50 186 L48 110 L36 172 C28 172 18 170 10 166 L20 92 C22 76 28 62 42 56 Z" fill="url(#${id}G)" stroke="#000" stroke-opacity=".3"/>
      <path d="M86 42 C94 62 126 62 134 42 C126 28 94 28 86 42 Z" style="fill:var(--pdd)"/>
      <path d="M86 42 C94 62 126 62 134 42" fill="none" style="stroke:var(--pl)" stroke-width="3" opacity=".6"/>
      <g fill="none" style="stroke:var(--pd)" stroke-width="2.4" stroke-linecap="round" opacity=".7">
        <path d="M58 100 C64 120 64 140 60 162"/><path d="M162 100 C156 120 156 140 160 162"/>
        <path d="M24 118 C30 122 38 122 44 118"/><path d="M196 118 C190 122 182 122 176 118"/><path d="M20 140 C26 144 34 144 40 140"/><path d="M200 140 C194 144 186 144 180 140"/>
      </g>
      <text x="110" y="104" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="20" fill="#000" fill-opacity=".28">SHIFT/</text>
      <path d="M80 126 L140 126 L150 166 L70 166 Z" fill="url(#${id}G)" style="stroke:var(--pdd)" stroke-width="2"/>
      <path d="M70 166 L150 166 L149 170 L71 170 Z" fill="#000" fill-opacity=".25"/>
      <path d="M50 178 L170 178 L170 191 L50 191 Z" style="fill:var(--pd)"/><path d="M50 178 L170 178 L170 191 L50 191 Z" fill="url(#${id}Rib)"/>
      <path d="M10 166 L36 172 L33 186 L7 179 Z" style="fill:var(--pd)"/><path d="M210 166 L184 172 L187 186 L213 179 Z" style="fill:var(--pd)"/>
      <path d="M100 58 C99 72 97 84 98 98 M120 58 C121 72 123 84 122 98" fill="none" stroke="#f3f0e8" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="95.5" y="96" width="5" height="10" rx="1.5" fill="#1a1a1e"/><rect x="119.5" y="96" width="5" height="10" rx="1.5" fill="#1a1a1e"/>
    </svg>`,
    tee: id => `<svg viewBox="0 0 220 220" aria-hidden="true"><defs>${grad(id)}</defs>
      <path d="M84 26 C92 36 128 36 136 26 C128 20 92 20 84 26 Z" style="fill:var(--pdd)"/>
      <path d="M70 30 C84 44 136 44 150 30 L198 52 C201 66 195 82 186 96 L160 86 L162 194 L58 194 L60 86 L34 96 C25 82 19 66 22 52 Z" fill="url(#${id}G)" stroke="#000" stroke-opacity=".3"/>
      <path d="M70 30 C84 44 136 44 150 30 C146 27 140 25 136 26 C128 36 92 36 84 26 C80 25 74 27 70 30 Z" style="fill:var(--pd)"/>
      <g fill="none" style="stroke:var(--pd)" stroke-width="2.2" stroke-linecap="round" opacity=".7">
        <path d="M60 86 C66 110 66 150 62 186"/><path d="M160 86 C154 110 154 150 158 186"/><path d="M34 96 L58 86 M186 96 L162 86" stroke-dasharray="3 3"/>
        <path d="M96 150 C104 156 116 156 124 150"/>
      </g>
      <text x="110" y="104" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="34" fill="#000" fill-opacity=".3">ONE FIT.</text>
      <text x="110" y="134" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="22" fill="#000" fill-opacity=".22">FOUR WORLDS</text>
      <path d="M58 188 L162 188" stroke="#000" stroke-opacity=".25" stroke-width="2" stroke-dasharray="3 3"/>
    </svg>`,
    cap: id => `<svg viewBox="0 0 220 220" aria-hidden="true"><defs>${grad(id)}</defs>
      <path d="M62 144 C58 96 88 60 132 60 C174 60 200 96 196 144 Z" fill="url(#${id}R)" stroke="#000" stroke-opacity=".3"/>
      <g fill="none" style="stroke:var(--pd)" stroke-width="2" opacity=".75">
        <path d="M132 60 C120 86 112 114 110 144"/><path d="M132 60 C150 88 160 116 162 144"/><path d="M132 60 C100 70 76 102 70 142"/>
      </g>
      <g fill="none" style="stroke:var(--pl)" stroke-width="1" stroke-dasharray="2 2" opacity=".7">
        <path d="M128 64 C116 88 108 114 106 144"/><path d="M137 64 C154 90 164 116 166 144"/>
      </g>
      <circle cx="96" cy="94" r="2.6" style="fill:var(--pdd)"/><circle cx="150" cy="90" r="2.6" style="fill:var(--pdd)"/>
      <ellipse cx="132" cy="60" rx="8" ry="4.5" style="fill:var(--pd)"/>
      <path d="M62 140 C100 150 160 150 196 140 L196 150 C160 160 100 160 62 150 Z" style="fill:var(--pd)"/>
      <path d="M68 140 C44 140 16 150 12 163 C10 174 52 178 98 166 C116 162 124 152 118 144 Z" fill="url(#${id}G)" stroke="#000" stroke-opacity=".35"/>
      <path d="M12 163 C10 174 52 178 98 166 C78 176 34 180 12 163 Z" style="fill:var(--pdd)"/>
      <path d="M22 160 C40 152 70 146 108 146" fill="none" style="stroke:var(--pl)" stroke-width="1" stroke-dasharray="2 2" opacity=".8"/>
      <g transform="rotate(-6 132 112)"><rect x="112" y="100" width="42" height="22" rx="4" fill="#0d0d10"/><text x="133" y="117" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="15" fill="#fff">S/</text></g>
    </svg>`,
    sneaker: id => `<svg viewBox="0 0 220 220" aria-hidden="true"><defs>${grad(id)}</defs>
      <path d="M18 150 C18 130 34 120 58 114 L92 98 C100 84 116 78 132 82 L160 88 C180 94 196 112 204 150 Z" fill="url(#${id}W)" stroke="#000" stroke-opacity=".25"/>
      <path d="M18 150 C18 136 30 126 50 120 C54 132 56 142 60 150 Z" fill="#e5e3dc"/>
      <path d="M110 86 C112 70 124 62 138 64 L144 86 Z" style="fill:var(--pd)"/>
      <path d="M168 90 C186 98 198 120 204 150 L176 150 C178 128 174 108 168 90 Z" fill="url(#${id}G)"/>
      <path d="M66 150 L118 110 L134 110 L84 150 Z M96 150 L148 110 L164 110 L114 150 Z" fill="url(#${id}G)" stroke="#000" stroke-opacity=".3"/>
      <path d="M190 116 L200 108 L206 132 L198 136 Z" style="fill:var(--p)"/>
      <g stroke="#2a2a30" stroke-width="3.2" stroke-linecap="round"><path d="M86 100 L98 92"/><path d="M94 106 L108 96"/><path d="M102 112 L118 100"/></g>
      <path d="M14 150 C10 168 22 180 42 180 L190 180 C204 180 210 168 206 150 Z" fill="url(#${id}W)" stroke="#000" stroke-opacity=".2"/>
      <path d="M14 161 C50 168 80 156 110 163 C140 170 170 158 207 163" fill="none" style="stroke:var(--p)" stroke-width="3"/>
      <path d="M24 178 L196 178" stroke="#7d7d86" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  };

  const SW = {
    acid: ['Acid', '#c8ff1a'], ember: ['Ember', '#ff5b1f'], glacier: ['Glacier', '#7ad8ff'], uv: ['Ultraviolet', '#9a52ff'],
    bone: ['Bone', '#e9e2cf'], jet: ['Jet', '#2b2b31'], sand: ['Sand', '#c9a77a'],
  };
  const PRODUCTS = [
    { id: 'hoodie', name: 'Oversize Hood 01', price: 128, tag: 'BESTSELLER', sw: ['acid', 'ember', 'glacier', 'uv', 'jet'] },
    { id: 'tee', name: 'Boxy Tee', price: 58, tag: '240GSM', sw: ['bone', 'acid', 'glacier', 'uv'] },
    { id: 'cap', name: '6-Panel Cap', price: 42, tag: 'NEW', sw: ['jet', 'ember', 'acid', 'sand'] },
    { id: 'sneaker', name: 'Stomp Runner', price: 164, tag: 'LIMITED', sw: ['acid', 'uv', 'ember', 'glacier'] },
  ];

  const gridEl = $('#grid');
  gridEl.innerHTML = PRODUCTS.map(p => {
    const [cn, hex] = SW[p.sw[0]];
    return `<article class="card" data-id="${p.id}" style="--p:${hex}">
      <div class="card-art" role="img" aria-label="${p.name} illustration">
        <span class="tag">${p.tag}</span>
        ${ART[p.id](p.id)}
        <button class="qa" type="button" aria-label="Quick add ${p.name} to bag"><span>+ Quick add</span><span>$${p.price}</span></button>
      </div>
      <div class="card-info">
        <h3>${p.name}</h3><span class="price">$${p.price}</span>
        <span class="cname">Colour: <b>${cn}</b></span>
        <div class="swatches" role="group" aria-label="${p.name} colour">
          ${p.sw.map((s, i) => `<button class="sw" type="button" style="--s:${SW[s][1]}" data-sw="${s}" aria-label="${SW[s][0]}" aria-pressed="${i === 0}"></button>`).join('')}
        </div>
      </div>
    </article>`;
  }).join('');

  $$('.card').forEach(card => {
    const cname = $('.cname b', card);
    $$('.sw', card).forEach(btn => btn.addEventListener('click', () => {
      const [n, hex] = SW[btn.dataset.sw];
      $$('.sw', card).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      cname.textContent = n;
      if (hasGsap && !reduce) {
        gsap.to(card, { '--p': hex, duration: 0.6, ease: 'power2.out' });
        gsap.fromTo($('svg', card), { rotation: -8, scale: 0.92 }, { rotation: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, .5)', clearProps: 'transform' });
      } else card.style.setProperty('--p', hex);
    }));
  });

  /* bag + toast */
  let bag = 0, toastT = 0;
  const bagCount = $('#bagCount'), bagBtn = $('#bagBtn'), toast = $('#toast');
  function say(msg) {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  $$('.qa').forEach(btn => btn.addEventListener('click', () => {
    const card = btn.closest('.card');
    const p = PRODUCTS.find(x => x.id === card.dataset.id);
    bag++;
    bagCount.textContent = bag;
    bagBtn.setAttribute('aria-label', `Bag, ${bag} item${bag === 1 ? '' : 's'}`);
    btn.classList.add('added'); btn.firstElementChild.textContent = '✓ Added';
    setTimeout(() => { btn.classList.remove('added'); btn.firstElementChild.textContent = '+ Quick add'; }, 1400);
    say(`Added — ${p.name} / ${$('.cname b', card).textContent}`);
    if (hasGsap && !reduce) {
      gsap.fromTo(bagCount, { scale: 1.8, rotation: -15 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, .4)' });
      gsap.fromTo($('svg', card), { y: 0 }, { y: -28, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', clearProps: 'transform' });
    }
  }));

  /* ------------------------------------------------------------------ */
  /* Countdown with flip digits                                          */
  /* ------------------------------------------------------------------ */
  function nextFriday() {
    const d = new Date();
    const t = new Date(d);
    t.setHours(19, 0, 0, 0);
    t.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7));
    if (t <= d) t.setDate(t.getDate() + 7);
    return t;
  }
  let target = nextFriday();
  const digits = {};
  $$('.pair').forEach(pair => {
    const u = pair.dataset.u;
    if (u === 's') pair.classList.add('accent');
    digits[u] = [0, 1].map(() => {
      const el = document.createElement('div');
      el.className = 'flip';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<span class="h top"><span>0</span></span><span class="h bot"><span>0</span></span><span class="h ft"><span>0</span></span><span class="h fb"><span>0</span></span>';
      pair.appendChild(el);
      const parts = ['.top', '.bot', '.ft', '.fb'].map(s => $(s + ' > span', el));
      const fb = $('.fb', el);
      fb.addEventListener('animationend', () => {
        parts[1].textContent = el._v; parts[2].textContent = el._v;
        el.classList.remove('go');
      });
      el._v = '0';
      el._set = (v, animate) => {
        if (v === el._v) return;
        const old = el._v; el._v = v;
        if (!animate || reduce) { parts.forEach(p => { p.textContent = v; }); return; }
        el.classList.remove('go');
        parts[0].textContent = v; parts[1].textContent = old; parts[2].textContent = old; parts[3].textContent = v;
        void el.offsetWidth;
        el.classList.add('go');
      };
      return el;
    });
  });
  const clock = $('#clock');
  function tick(animate) {
    let ms = target - Date.now();
    if (ms <= 0) { target = nextFriday(); ms = target - Date.now(); }
    const s = Math.floor(ms / 1000);
    const v = { d: Math.min(99, Math.floor(s / 86400)), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
    for (const u in v) {
      const str = String(v[u]).padStart(2, '0');
      digits[u][0]._set(str[0], animate); digits[u][1]._set(str[1], animate);
    }
    clock.setAttribute('aria-label', `Drop 08 lands in ${v.d} days, ${v.h} hours, ${v.m} minutes`);
  }
  tick(false);
  setInterval(() => tick(!document.hidden), 1000);

  const notify = $('#notifyBtn');
  notify.addEventListener('click', () => {
    const on = notify.getAttribute('aria-pressed') !== 'true';
    notify.setAttribute('aria-pressed', String(on));
    notify.firstElementChild.textContent = on ? "✓ You're on the list" : 'Notify me';
    say(on ? 'We will ping you when Nightshift lands' : 'Reminder removed');
    if (on && hasGsap && !reduce) gsap.fromTo(notify, { scale: 0.9 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, .4)', clearProps: 'transform' });
  });

  /* ------------------------------------------------------------------ */
  /* Header + scroll reveals                                             */
  /* ------------------------------------------------------------------ */
  const header = $('.site');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (hasGsap && window.ScrollTrigger && !reduce) {
    $$('.sec-head, .drop-inner').forEach(el => {
      gsap.from(el.children, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    gsap.from('.card', { y: 80, opacity: 0, rotation: 2, duration: 0.9, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity', scrollTrigger: { trigger: '#grid', start: 'top 85%', once: true } });
    gsap.to('.drop-bg', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.drop', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */
  setWorld(cur, { instant: true });
  const ready = document.fonts && document.fonts.load ? document.fonts.load('200px Anton') : Promise.resolve();
  ready.catch(() => {}).then(() => {
    fitTitle(false);
    if (hasGsap && !reduce) {
      gsap.from([halfL, halfR], { yPercent: (i) => (isMobile() ? 0 : -50) + (i ? 40 : -40), opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 });
      gsap.from('#figJump', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.1 });
      gsap.from('.hero-foot > *', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.25 });
    }
    scheduleAuto();
  });
  let rz = 0;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => fitTitle(false), 120); });
})();
