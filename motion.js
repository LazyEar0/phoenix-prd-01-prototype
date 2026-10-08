/* ============================================================
   Phoenix 原型 · 动效层
   移植自 Vue Bits 的 8 个效果（原生实现，无框架依赖）：
   1. Aurora 极光背景（登录页）        2. SplitText 逐字入场（品牌名）
   3. ShinyText 流光（思考中/调用中）  4. FadeContent 淡入上移（欢迎区/消息/卡片）
   5. SpotlightCard 悬停聚光灯（卡片） 6. CountUp 数字滚动（统计数）
   7. StarBorder 星光描边（主按钮）    8. ClickSpark 点击火花（主按钮）
   日常用强度：短时长、低透明度；prefers-reduced-motion 下自动降级。
   ============================================================ */
window.Motion = (() => {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Aurora 极光背景（canvas 2D 轻量版，Logo 同款蓝/紫/玫瑰） ---------- */
  let aurora = null;
  function startAurora(cv) {
    stopAurora();
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const blobs = [
      { c: '96,165,250',  x: .20, y: .28, sx: .15, sy: .11, r: .58, p: 0 },
      { c: '139,124,246', x: .80, y: .26, sx: .13, sy: .15, r: .62, p: 2.1 },
      { c: '244,114,182', x: .52, y: .88, sx: .17, sy: .09, r: .52, p: 4.2 },
    ];
    let w = 0, h = 0, raf = 0, dead = false;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    addEventListener('resize', size);
    const draw = t => {
      ctx.clearRect(0, 0, w, h);
      const dark = document.documentElement.dataset.theme === 'dark';
      const a0 = dark ? .22 : .15;
      for (const b of blobs) {
        const cx = (b.x + Math.sin(t * .12 + b.p) * b.sx) * w;
        const cy = (b.y + Math.cos(t * .10 + b.p) * b.sy) * h;
        const R = b.r * Math.max(w, h) * .62 * (1 + Math.sin(t * .07 + b.p) * .06);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        g.addColorStop(0, `rgba(${b.c},${a0})`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    };
    draw(0); // 先同步画一帧，保证首屏立即可见（后台标签页 rAF 暂停时也有静态极光）
    if (!reduced) {
      const t0 = performance.now();
      const loop = now => { if (dead) return; draw((now - t0) / 1000); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }
    aurora = {
      stop() {
        dead = true; cancelAnimationFrame(raf);
        removeEventListener('resize', size);
        ctx.clearRect(0, 0, w, h);
      },
    };
  }
  function stopAurora() { if (aurora) { aurora.stop(); aurora = null; } }

  /* ---------- 2. SplitText 逐字入场 ---------- */
  function splitIn(el, step = 45) {
    if (!el) return;
    const text = el.dataset.orig || el.textContent;
    el.dataset.orig = text;
    if (reduced) { el.textContent = text; return; }
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.animationDelay = `${i * step}ms`;
      el.appendChild(s);
    });
  }

  /* ---------- 3. FadeContent 淡入上移（stagger） ---------- */
  function reveal(nodes, { step = 50, from = 0, max = 14 } = {}) {
    if (reduced) return;
    Array.from(nodes || []).slice(0, max).forEach((el, i) => {
      el.classList.remove('anim-in');
      void el.offsetWidth; // 强制重排，重复调用时可重播
      el.style.animationDelay = `${from + i * step}ms`;
      el.classList.add('anim-in');
    });
  }
  /* 消息流只让「最新一条」入场，避免整屏历史重播 */
  function animateLast(col) {
    const el = col && col.lastElementChild;
    if (!reduced && el && el.classList.contains('msg')) el.classList.add('anim-in');
  }

  /* ---------- 4. CountUp 数字滚动（进入视野触发一次） ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); runCount(en.target); } });
  }, { threshold: .4 });
  function runCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduced || !target) { el.textContent = String(target); return; }
    const dur = 650, t0 = performance.now();
    const tick = now => {
      if (!el.isConnected) return;
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- 5. SpotlightCard 悬停聚光灯（事件委托，一次绑定全局生效） ---------- */
  document.addEventListener('pointermove', e => {
    const card = e.target.closest && e.target.closest('.emp-card, .agent-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- 6. StarBorder 星光描边（包裹主按钮） ---------- */
  function starWrap(b) {
    if (b.dataset.sb) return;
    b.dataset.sb = '1';
    const w = document.createElement('span');
    w.className = 'sb-wrap' + ((b.classList.contains('btn-block') || b.classList.contains('new-conv-btn')) ? ' sb-block' : '');
    b.replaceWith(w);
    w.appendChild(b);
  }

  /* ---------- 7. ClickSpark 点击火花（全屏 canvas + 事件委托） ---------- */
  const sparkCv = document.createElement('canvas');
  sparkCv.className = 'spark-cv';
  document.body.appendChild(sparkCv);
  const sctx = sparkCv.getContext('2d');
  let sparks = [], sparkRaf = 0;
  const sizeSpark = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    sparkCv.width = innerWidth * dpr; sparkCv.height = innerHeight * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  sizeSpark();
  addEventListener('resize', sizeSpark);
  document.addEventListener('click', e => {
    if (reduced) return;
    const t = e.target.closest && e.target.closest('.btn-primary, .send-btn, .new-conv-btn');
    if (!t || t.disabled) return;
    const now = performance.now();
    for (let i = 0; i < 8; i++) sparks.push({ x: e.clientX, y: e.clientY, a: (Math.PI * 2 * i) / 8 + (Math.random() - .5) * .35, t0: now });
    if (!sparkRaf) sparkTick(now); // 同步画首帧并自行调度后续 rAF（后台标签页 rAF 暂停时也能看到反馈）
  });
  function sparkTick(now) {
    sctx.clearRect(0, 0, innerWidth, innerHeight);
    const DUR = 420, R0 = 6, R1 = 26, LEN = 9;
    sparks = sparks.filter(s => now - s.t0 < DUR);
    for (const s of sparks) {
      const p = (now - s.t0) / DUR, e = 1 - Math.pow(1 - p, 3);
      const rOut = R0 + (R1 - R0) * e, rIn = Math.max(0, rOut - LEN * (1 - e));
      sctx.strokeStyle = `rgba(244,63,94,${1 - p})`;
      sctx.lineWidth = 2; sctx.lineCap = 'round';
      sctx.beginPath();
      sctx.moveTo(s.x + Math.cos(s.a) * rIn, s.y + Math.sin(s.a) * rIn);
      sctx.lineTo(s.x + Math.cos(s.a) * rOut, s.y + Math.sin(s.a) * rOut);
      sctx.stroke();
    }
    sparkRaf = sparks.length ? requestAnimationFrame(sparkTick) : 0;
  }

  /* ---------- 8. 自动增强：StarBorder + CountUp（新增 DOM 自动扫描，渲染函数零接线） ---------- */
  const scan = root => {
    if (root.matches && root.matches('.btn-star')) starWrap(root);
    $$('.btn-star', root).forEach(starWrap);
    const cs = [];
    if (root.matches && root.matches('[data-count]')) cs.push(root);
    $$('[data-count]', root).forEach(el => cs.push(el));
    cs.forEach(el => { if (!el.dataset.cdone) { el.dataset.cdone = '1'; io.observe(el); } });
  };
  new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      scan(n);
    }
  }).observe(document.body, { childList: true, subtree: true });
  scan(document);

  /* ---------- 登录页编排：极光 + 品牌逐字 + 表单依次入场 ---------- */
  function loginEnter() {
    startAurora($('#aurora-cv'));
    splitIn($('.login-title'));
    const card = $('.login-card');
    if (card) reveal([card], { from: 0 });
    reveal($$('.login-sub, .login-form, .login-foot'), { step: 90, from: 350 });
  }

  return { startAurora, stopAurora, splitIn, reveal, animateLast, loginEnter };
})();
