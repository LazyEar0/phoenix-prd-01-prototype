/* ============================================================
   需求澄清面板 · 联动逻辑
   锚点模型：
   - 视图锚点（setView）：进入某个页面时切换，作为底层锚点；
   - 压栈锚点（push/pop）：弹窗、抽屉、全屏浮层打开时压栈，关闭时弹出，
     当前生效锚点 = 栈顶（无栈则取视图锚点）。
   面板关闭时仍持续追踪当前锚点，重新打开即落在正确位置。
   ============================================================ */

window.ReqPanel = (() => {
  let viewAnchor = 'login';   // 视图锚点（默认登录页）
  let stack = [];             // 压栈锚点 [{ key, id }]
  let token = 0;              // 压栈令牌自增
  let openState = false;      // 面板开合
  let inited = false;

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  function currentId() {
    return stack.length ? stack[stack.length - 1].id : viewAnchor;
  }

  /* 首次打开时构建目录与内容 */
  function render() {
    const nav = $('#req-nav'), content = $('#req-content');
    if (!nav || !content) return;
    nav.innerHTML = '';
    content.innerHTML = '';
    (window.REQ_SECTIONS || []).forEach(sec => {
      const b = document.createElement('button');
      b.className = 'req-nav-item';
      b.dataset.id = sec.id;
      b.type = 'button';
      b.innerHTML = `<span class="req-nav-module">${sec.module}</span><span class="req-nav-title">${sec.title}</span>`;
      b.onclick = () => { scrollToSec(sec.id); };
      nav.appendChild(b);

      const d = document.createElement('section');
      d.className = 'req-sec';
      d.id = 'req-sec-' + sec.id;
      d.dataset.id = sec.id;
      d.innerHTML = `
        <div class="req-sec-head">
          <div class="req-sec-title">${sec.title}</div>
          <div class="req-sec-src">${sec.src}</div>
        </div>
        <div class="req-sec-body">${sec.html}</div>`;
      content.appendChild(d);
    });
    inited = true;
  }

  function markSubtitle(id) {
    const sec = (window.REQ_SECTIONS || []).find(s => s.id === id);
    const cur = $('#req-cur');
    if (cur) cur.textContent = sec ? `当前：${sec.title}` : '—';
  }

  function activate(id) {
    $$('.req-nav-item').forEach(b => b.classList.toggle('active', b.dataset.id === id));
    $$('.req-sec').forEach(s => s.classList.toggle('active', s.dataset.id === id));
    markSubtitle(id);
    const el = document.getElementById('req-sec-' + id);
    if (el) {
      el.classList.remove('flash');
      void el.offsetWidth; /* 重启动画 */
      el.classList.add('flash');
    }
  }

  function scrollToSec(id) {
    const el = document.getElementById('req-sec-' + id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    activate(id);
  }

  /* 锚点变化时应用：开面板则滚动定位，关面板仅更新追踪 */
  function apply() {
    const id = currentId();
    if (!openState) { markSubtitle(id); return; }
    if (!inited) render();
    scrollToSec(id);
  }

  /* ---------- 面板宽度拖拽 ---------- */
  const MIN_W = 300;      // 面板最小宽度
  const DEF_W = 400;      // 默认宽度（双击分隔条恢复）
  const LS_KEY = 'req-panel-width';

  function maxW() {
    /* 演示区至少保留 480px，面板最宽不超过视口 80% */
    return Math.max(MIN_W, Math.min(window.innerWidth - 480, window.innerWidth * 0.8));
  }
  function clampW(w) { return Math.min(Math.max(w, MIN_W), maxW()); }

  function applyWidth(w) {
    const p = $('#req-panel');
    if (p) p.style.width = clampW(w) + 'px';
  }

  function restoreWidth() {
    let w = DEF_W;
    try { w = parseInt(localStorage.getItem(LS_KEY), 10) || DEF_W; } catch (_) {}
    applyWidth(w);
  }

  function initResize() {
    const rz = $('#req-resizer'), p = $('#req-panel');
    if (!rz || !p) return;
    rz.addEventListener('pointerdown', e => {
      e.preventDefault();
      const startX = e.clientX, startW = p.getBoundingClientRect().width;
      rz.classList.add('dragging');
      document.body.classList.add('req-resizing');
      rz.setPointerCapture(e.pointerId);
      const onMove = ev => applyWidth(startW + (startX - ev.clientX));
      const onUp = () => {
        rz.classList.remove('dragging');
        document.body.classList.remove('req-resizing');
        rz.removeEventListener('pointermove', onMove);
        rz.removeEventListener('pointerup', onUp);
        rz.removeEventListener('pointercancel', onUp);
        try { localStorage.setItem(LS_KEY, String(Math.round(p.getBoundingClientRect().width))); } catch (_) {}
      };
      rz.addEventListener('pointermove', onMove);
      rz.addEventListener('pointerup', onUp);
      rz.addEventListener('pointercancel', onUp);
    });
    /* 双击恢复默认宽度 */
    rz.addEventListener('dblclick', () => {
      applyWidth(DEF_W);
      try { localStorage.removeItem(LS_KEY); } catch (_) {}
    });
    /* 窗口收窄时兜底，避免面板溢出 */
    window.addEventListener('resize', () => {
      if (openState) applyWidth(p.getBoundingClientRect().width);
    });
  }

  function toggleResizer(show) {
    const rz = $('#req-resizer');
    if (rz) rz.classList.toggle('req-hidden', !show);
  }

  return {
    init() { markSubtitle(currentId()); initResize(); },
    setView(id) { viewAnchor = id; apply(); },
    push(id) { const key = ++token; stack.push({ key, id }); apply(); return key; },
    pop(key) {
      const i = stack.findIndex(t => t.key === key);
      if (i >= 0) stack.splice(i, 1);
      apply();
    },
    toggle() { openState ? this.close() : this.open(); },
    open() {
      openState = true;
      if (!inited) render();
      restoreWidth();
      const p = $('#req-panel');
      if (p) p.classList.remove('req-hidden');
      toggleResizer(true);
      apply();
    },
    close() {
      openState = false;
      const p = $('#req-panel');
      if (p) p.classList.add('req-hidden');
      toggleResizer(false);
    },
    isOpen() { return openState; },
  };
})();
