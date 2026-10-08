/* ============================================================
   Phoenix 原型 · 交互逻辑
   ============================================================ */

/* ---------------- 工具 ---------------- */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = p => (p || 'id') + '-' + Math.random().toString(36).slice(2, 9);
const sleep = ms => new Promise(r => setTimeout(r, ms));

function fmtTime(d) {
  d = d || new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fmtHm(d) { const p = n => String(n).padStart(2, '0'); return `${p(d.getHours())}:${p(d.getMinutes())}`; }
/* 侧栏相对时间：刚刚 / HH:mm（今天）/ MM-DD HH:mm（更早） */
function relTime(ts) {
  const d = new Date(ts), now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return (now - d < 60 * 1000) ? '刚刚' : fmtHm(d);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${fmtHm(d)}`;
}
function greet() {
  const h = new Date().getHours();
  if (h < 6) return '凌晨好'; if (h < 12) return '上午好';
  if (h < 14) return '中午好'; if (h < 18) return '下午好'; return '晚上好';
}

const LOGO_SVG = `<svg viewBox="0 0 48 48" fill="none">
  <defs>
    <linearGradient id="rlg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#8b7cf6"/></linearGradient>
    <linearGradient id="rlg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b7cf6"/><stop offset="1" stop-color="#f472b6"/></linearGradient>
    <linearGradient id="rlg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#60a5fa"/></linearGradient>
  </defs>
  <path d="M24 4c3 8 2 14-2 20-3-7-2-14 2-20z" fill="url(#rlg2)"/>
  <path d="M24 44c-8-2-14-8-15-16 7-1 13 2 17 8 1 3 0 6-2 8z" fill="url(#rlg1)"/>
  <path d="M24 44c8-2 14-8 15-16-7-1-13 2-17 8-1 3 0 6 2 8z" fill="url(#rlg3)"/>
</svg>`;

const BOT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M8 4h8"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/><path d="M9.5 17h5"/></svg>';
const PANEL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>';

/* ---------------- 图标（线性 SVG） ---------------- */
const ICONS = {
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12Z"/></svg>',
  agents: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/><circle cx="12" cy="12" r="2.5"/></svg>',
  models: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.6c2.4.3 4.3 1.8 5 4.4"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a4.5 4.5 0 0 0-6 5.6L3 17.6V21h3.4l5.7-5.7a4.5 4.5 0 0 0 5.6-6l-3 3-2.4-.6-.6-2.4 3-3Z"/></svg>',
  knowledge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h14"/></svg>',
  cost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M15.5 9.5c-.7-1-2-1.5-3.5-1.5-1.9 0-3.2 1-3.2 2.5 0 3.4 6.8 1.6 6.8 5 0 1.5-1.4 2.5-3.6 2.5-1.6 0-3-.6-3.7-1.6"/></svg>',
  audit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v5c0 4.4 3 8.2 7 10 4-1.8 7-5.6 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.24.6.83 1 1.5 1H21a2 2 0 1 1 0 4h-.09c-.67 0-1.26.4-1.51 1Z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H20v15H4.5A2.5 2.5 0 0 0 2 20.5v-15Z"/><path d="M20 18v3H4.5A2.5 2.5 0 0 1 2 20.5"/></svg>',
};

/* ---------------- Store ---------------- */
const store = {
  data: null,
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.data = raw ? JSON.parse(raw) : buildSeed();
    } catch (e) { this.data = buildSeed(); }
    if (!rawExists()) this.save();
    function rawExists() { return !!localStorage.getItem(STORAGE_KEY); }
  },
  save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); },
  reset() { this.data = buildSeed(); this.save(); },
};

/* ---------------- 全局状态 ---------------- */
const state = {
  user: null,             // 当前登录用户对象
  view: 'chat',           // chat | agents | models | users
  chatMode: 'employee',   // employee | general
  chatScreen: 'roster',   // roster | conversation（employee 模式默认名册）
  activeEmpId: null,      // 数字员工模式选中的员工
  activeConvId: null,
  rosterFolder: 'ALL',    // 名册当前文件夹
  streaming: false,
  abort: null,            // {stop:boolean}
  backendOk: true,
  backendTimer: null,
  agentTab: 'all',
  theme: localStorage.getItem(THEME_KEY) || 'light',
  /* 列表页状态：q=搜索词，sortKey/sortDir=表头排序，sort=卡片页排序预设，page/pageSize=分页 */
  usersList:  { q: '', role: 'ALL', status: 'ALL', sortKey: 'username', sortDir: 'asc', page: 1, pageSize: 10 },
  modelsList: { q: '', status: 'ALL', sortKey: 'priority', sortDir: 'desc', page: 1, pageSize: 10 },
  agentsList: { q: '', sort: 'created_desc', page: 1, pageSize: 12 },
  rosterList: { q: '', sort: 'created_desc', page: 1, pageSize: 12 },
};

/* ---------------- Toast ---------------- */
function toast(msg, type) {
  const el = document.createElement('div');
  el.className = 'toast ' + (type || 'info');
  el.textContent = msg;
  $('#toast-root').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3000);
}

/* ---------------- Modal / Confirm ---------------- */
function openModal({ title, body, foot, wide, form, req }) {
  const reqKey = req ? ReqPanel.push(req) : null;
  const root = $('#modal-root');
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML = `<div class="modal${wide ? ' modal-wide' : ''}">
    <div class="modal-head"><div class="modal-title">${esc(title)}</div><button class="modal-close">×</button></div>
    <div class="modal-body"></div>
    ${foot ? '<div class="modal-foot"></div>' : ''}
  </div>`;
  const bodyEl = $('.modal-body', mask);
  if (typeof body === 'string') bodyEl.innerHTML = body; else bodyEl.appendChild(body);
  // 底部按钮直接挂进 .modal-foot（打平包裹层），保证 flex 间距生效
  if (foot) { const f = $('.modal-foot', mask); if (typeof foot === 'string') f.innerHTML = foot; else f.append(...foot.childNodes); }
  // 表单类：快照初始值，关闭时有改动则二次确认；data-nosnap 的控件（如搜索框）不计入改动
  const snap = () => JSON.stringify([...$$('input,select,textarea', mask)].filter(el => !el.dataset.nosnap).map(el => el.type === 'checkbox' ? !!el.checked : el.value));
  const snap0 = form ? snap() : null;
  const isDirty = () => form && snap() !== snap0;
  const isTop = () => { const all = [...document.querySelectorAll('#modal-root .modal-mask')]; return all[all.length - 1] === mask; };
  const close = () => { document.removeEventListener('keydown', onKey, true); mask.remove(); if (reqKey) ReqPanel.pop(reqKey); };
  const requestClose = () => {
    if (!isDirty()) return close();
    confirmModal({
      title: '放弃未保存的内容？',
      text: '表单中已有填写或修改的内容，退出后这些内容将丢失。',
      danger: true, okText: '放弃并退出',
      onOk: close,
    });
  };
  $('.modal-close', mask).onclick = requestClose;
  mask.addEventListener('mousedown', e => { if (e.target === mask && isTop()) requestClose(); });
  const onKey = e => {
    if (!document.body.contains(mask)) { document.removeEventListener('keydown', onKey, true); return; }
    if (!isTop()) return;
    if (e.key === 'Escape') { e.stopPropagation(); requestClose(); }
    else if (form && e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && !e.target.dataset.noenter) {
      const ok = $('.modal-foot .btn-primary, .modal-foot .btn-danger', mask);
      if (ok) { e.preventDefault(); ok.click(); }
    }
  };
  document.addEventListener('keydown', onKey, true);
  root.appendChild(mask);
  setTimeout(() => { const first = $('input:not([type=checkbox]):not([disabled]), textarea:not([disabled]), select:not([disabled])', mask); if (first) first.focus(); }, 0);
  return { mask, close, bodyEl, requestClose };
}

function confirmModal({ title, text, danger, okText, onOk }) {
  const foot = document.createElement('div');
  const cancel = document.createElement('button'); cancel.className = 'btn'; cancel.textContent = '取消';
  const ok = document.createElement('button'); ok.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary'); ok.textContent = okText || '确认';
  foot.append(cancel, ok);
  const { close } = openModal({ title: title || '二次确认', body: `<div style="font-size:13.5px;line-height:1.7">${text}</div>`, foot });
  cancel.onclick = close;
  ok.onclick = () => { close(); onOk && onOk(); };
}

/* ---------------- 登录 ---------------- */
function renderLogin() {
  $('#view-login').classList.remove('hidden');
  $('#shell').classList.add('hidden');
  ReqPanel.setView('login');
  const errEl = $('#login-error');
  errEl.classList.add('hidden');
  $('#login-btn').onclick = doLogin;
  $('#login-password').onkeydown = e => { if (e.key === 'Enter') doLogin(); };
  $('#login-username').onkeydown = e => { if (e.key === 'Enter') doLogin(); };
  $('#login-pwd-toggle').onclick = () => {
    const inp = $('#login-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  };
  $('#login-reset').onclick = () => {
    confirmModal({
      title: '重置演示数据',
      text: '将清除全部本地数据（成员、智能体、员工、对话等）并恢复为系统初始预置状态。该操作不可撤销，是否继续？',
      danger: true, okText: '重置',
      onOk: () => { store.reset(); localStorage.removeItem(SESSION_KEY); toast('已恢复初始数据', 'success'); },
    });
  };
  if (window.Motion) Motion.loginEnter();
}

function doLogin() {
  const username = $('#login-username').value.trim();
  const password = $('#login-password').value;
  const errEl = $('#login-error');
  const showErr = msg => { errEl.textContent = msg; errEl.classList.remove('hidden'); };
  const u = store.data.users.find(x => x.username === username);
  if (!u || u.password !== password) return showErr('用户名或密码错误');
  if (u.status !== 'active') return showErr('账号已停用，请联系管理员');
  state.user = u;
  if ($('#login-remember').checked) localStorage.setItem(SESSION_KEY, username);
  else localStorage.removeItem(SESSION_KEY);
  enterShell();
}

function forceLogout(msg) {
  state.user = null;
  localStorage.removeItem(SESSION_KEY);
  renderLogin();
  if (msg) { const errEl = $('#login-error'); errEl.textContent = msg; errEl.classList.remove('hidden'); }
}

function checkSelf() {
  if (!state.user) return false;
  const me = store.data.users.find(u => u.username === state.user.username);
  if (!me || me.status !== 'active') { forceLogout('账号已停用，请联系管理员'); toast('账号已停用，请联系管理员', 'error'); return false; }
  state.user = me;
  return true;
}

/* ---------------- 壳 ---------------- */
/* 导航全量 10 项（PRD 3.2-1）；grey 为本期置灰项，点击 Toast 不跳转 */
const NAV_ITEMS = [
  { key: 'chat',      label: '对话',     icon: 'chat' },
  { key: 'search-g',  label: '搜索',     icon: 'search', grey: true },
  { key: 'agents',    label: '智能体中心', icon: 'agents' },
  { key: 'tools',     label: '工具中心', icon: 'tools', grey: true },
  { key: 'knowledge', label: '知识中心', icon: 'knowledge', grey: true },
  { key: 'models',    label: '模型中心', icon: 'models' },
  { key: 'cost',      label: '成本中心', icon: 'cost', grey: true },
  { key: 'audit',     label: '审计中心', icon: 'audit', grey: true },
  { key: 'users',     label: '用户中心', icon: 'users', adminOnly: true },
  { key: 'settings',  label: '设置',     icon: 'settings', grey: true },
];

function enterShell() {
  $('#view-login').classList.add('hidden');
  $('#shell').classList.remove('hidden');
  if (window.Motion) Motion.stopAurora();
  document.documentElement.dataset.theme = state.theme;
  renderRail();
  renderTopbar();
  applyBackendUI();
  state.view = 'chat';
  state.chatScreen = state.chatMode === 'employee' ? 'roster' : 'conversation';
  switchView('chat');
}

function renderRail() {
  const rail = $('#rail');
  const isAdmin = state.user.role === 'admin';
  rail.innerHTML = `<div class="rail-logo">${LOGO_SVG}</div>`;
  NAV_ITEMS.forEach(item => {
    if (item.adminOnly && !isAdmin) return;
    const b = document.createElement('button');
    b.className = 'rail-item' + (item.grey ? ' grey' : '') + (state.view === item.key ? ' active' : '');
    b.innerHTML = ICONS[item.icon] + `<span class="rail-tip">${item.label}${item.grey ? '（后续版本）' : ''}</span>`;
    b.onclick = () => {
      if (!checkSelf()) return;
      if (item.grey) { toast('该模块将在后续版本开放', 'info'); return; }
      switchView(item.key);
    };
    rail.appendChild(b);
  });
  const spacer = document.createElement('div'); spacer.className = 'rail-spacer'; rail.appendChild(spacer);
  const av = document.createElement('div');
  av.className = 'rail-avatar';
  av.innerHTML = esc(state.user.name.slice(0, 1)) + `<span class="rail-tip">${esc(state.user.name)} · ${state.user.role === 'admin' ? '管理员' : '成员'}<br>点击退出登录</span>`;
  av.onclick = () => confirmModal({ title: '退出登录', text: '确定退出当前账号吗？', onOk: () => forceLogout() });
  rail.appendChild(av);
}

const VIEW_TITLES = { chat: '对话', agents: '智能体中心', models: '模型中心', users: '用户中心', search: '全局搜索' };

function topbarTitleHtml() {
  if (state.view === 'chat') {
    const conv = currentConv();
    const modeTag = state.chatMode === 'general' ? '<span class="topbar-tag">通用场景</span>' : '<span class="topbar-tag">数字员工</span>';
    let title = conv && conv.title ? conv.title : '';
    if (!title && state.chatMode === 'employee') {
      const emp = store.data.employees.find(e => e.id === state.activeEmpId);
      title = state.chatScreen === 'roster' ? '数字员工名册' : (emp ? emp.name : '数字员工');
    }
    if (!title) title = '通用助手';
    return `<div class="topbar-title">${esc(title)}</div>${modeTag}`;
  }
  return `<div class="topbar-title">${VIEW_TITLES[state.view] || ''}</div>`;
}

function renderTopbar() {
  const bar = $('#topbar');
  bar.innerHTML = `
    <button class="topbar-toggle" id="tb-toggle" title="收起 / 展开侧栏">${PANEL_SVG}</button>
    ${topbarTitleHtml()}
    <div class="topbar-right">
      <button class="topbar-icon" id="tb-search" title="全局搜索（占位页）">${ICONS.search}</button>
      <button class="req-toggle" id="req-toggle" title="需求澄清面板（评审模式）">${ICONS.book}<span>需求</span></button>
      <button class="backend-status" id="backend-status" title="点击模拟后端断开/恢复"></button>
      <button class="theme-toggle" id="theme-toggle" title="切换深色/浅色主题">${state.theme === 'light' ? '🌙' : '☀️'}</button>
    </div>`;
  $('#tb-search').onclick = () => { if (checkSelf()) switchView('search'); };
  $('#req-toggle').onclick = () => { ReqPanel.toggle(); syncReqToggle(); };
  $('#tb-toggle').onclick = () => {
    const sb = $('#chat-sidebar');
    if (state.view === 'chat' && sb) sb.classList.toggle('collapsed');
  };
  $('#theme-toggle').onclick = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, state.theme);
    document.documentElement.dataset.theme = state.theme;
    renderTopbar();
  };
  $('#backend-status').onclick = toggleBackend;
  renderBackendStatus();
}

function renderBackendStatus() {
  const el = $('#backend-status');
  if (!el) return;
  el.innerHTML = state.backendOk
    ? '<span class="dot dot-ok"></span><span>后端正常</span>'
    : '<span class="dot dot-err"></span><span>后端已断开</span>';
}

function toggleBackend() {
  if (state.backendOk) {
    state.backendOk = false;
    if (state.abort) state.abort.backendDown = true; // 触发流式异常中断
    applyBackendUI();
    toast('后端连接已断开，正在重连…', 'error');
    // 模拟自动重连
    clearTimeout(state.backendTimer);
    state.backendTimer = setTimeout(() => {
      if (!state.backendOk) { state.backendOk = true; applyBackendUI(); toast('后端连接已恢复', 'success'); }
    }, 8000);
  } else {
    clearTimeout(state.backendTimer);
    state.backendOk = true;
    applyBackendUI();
    toast('后端连接已恢复', 'success');
  }
}

function applyBackendUI() {
  renderBackendStatus();
  $('#backend-banner').classList.toggle('hidden', state.backendOk);
  const composer = $('.composer');
  if (composer) composer.classList.toggle('disabled', !state.backendOk);
  const ta = $('#composer-input');
  if (ta) ta.placeholder = state.backendOk ? '输入消息，Enter 发送，Shift+Enter 换行' : '后端连接已断开，暂时无法发送…';
}

/* ---------------- 路由 ---------------- */
function syncReqToggle() {
  const b = $('#req-toggle');
  if (b) b.classList.toggle('on', ReqPanel.isOpen());
}
function switchView(view) {
  state.view = view;
  ['chat', 'agents', 'models', 'users', 'search'].forEach(v => $('#view-' + v).classList.toggle('hidden', v !== view));
  renderRail(); renderTopbar();
  if (view === 'chat') renderChat();
  if (view === 'agents') { renderAgents(); ReqPanel.setView('agents'); }
  if (view === 'models') { renderModels(); ReqPanel.setView('models'); }
  if (view === 'users') { renderUsers(); ReqPanel.setView('users'); }
  if (view === 'search') { renderSearch(); ReqPanel.setView('shell'); }
  syncReqToggle();
}

/* 顶部全局搜索 · 占位页（PRD 3.2-5） */
function renderSearch() {
  $('#view-search').innerHTML = `<div class="placeholder-page">
    <div class="p-icon">🔍</div>
    <div class="p-title">全局搜索</div>
    <div class="p-sub">本期仅交付入口与占位页，该功能将在后续版本开放</div>
  </div>`;
}

/* ============================================================
   Markdown 渲染管线
   ============================================================ */
let mmSeq = 0;
mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

const mdRenderer = new marked.Renderer();
mdRenderer.code = function (code, lang) {
  lang = (lang || '').trim();
  if (lang === 'mermaid') {
    return `<div class="mermaid-box"><button class="mermaid-expand">⛶ 全屏</button><div class="mermaid-src" style="display:none">${esc(code)}</div><div class="mermaid-render"></div></div>`;
  }
  return `<pre><div class="code-lang"><span>${esc(lang || 'text')}</span><button class="code-copy" type="button">复制</button></div><code>${esc(code)}</code></pre>`;
};
marked.setOptions({ renderer: mdRenderer, gfm: true, breaks: false });

function renderMarkdown(src) {
  const maths = [];
  let text = String(src || '');
  // 脚注：先收集独立成行的定义，再把正文引用替换为上标（PRD 3.6-1 / AC-48）
  const fns = [];
  text = text.replace(/^\[\^([^\]]+)\]:[ \t]*(.*)$/gm, (m, id, def) => { fns.push({ id, def: def.trim() }); return ''; });
  if (fns.length) {
    text = text.replace(/\[\^([^\]]+)\]/g, (m, id) => {
      const fn = fns.find(f => f.id === id);
      return fn ? `<sup class="fn-ref" title="${esc(fn.def)}">[${esc(id)}]</sup>` : m;
    });
  }
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (m, f) => { maths.push({ f, display: true }); return `@@MATH${maths.length - 1}@@`; });
  text = text.replace(/\$([^$\n]+?)\$/g, (m, f) => { maths.push({ f, display: false }); return `@@MATH${maths.length - 1}@@`; });
  let html = marked.parse(text);
  html = html.replace(/@@MATH(\d+)@@/g, (m, i) => {
    const { f, display } = maths[+i];
    try { return katex.renderToString(f.trim(), { displayMode: display, throwOnError: false }); }
    catch (e) { return `<code>${esc(f)}</code>`; }
  });
  if (fns.length) {
    html += `<div class="md-footnotes">${fns.map(f => `<div class="md-fn"><span class="fn-id">[${esc(f.id)}]</span><span>${esc(f.def)}</span></div>`).join('')}</div>`;
  }
  return html;
}

/* 渲染后处理：Alert 块、代码复制、Mermaid（流式期间跳过图表，仅显示占位） */
async function postProcessMd(container, opts) {
  const skipMermaid = !!(opts && opts.skipMermaid);
  // Alert：> [!NOTE] / > [!WARNING]
  $$('blockquote', container).forEach(bq => {
    const first = bq.querySelector('p');
    if (!first) return;
    const m = first.textContent.trim().match(/^\[!(NOTE|WARNING)\]\s*/i);
    if (!m) return;
    const kind = m[1].toLowerCase();
    const div = document.createElement('div');
    div.className = 'md-alert ' + kind;
    first.innerHTML = first.innerHTML.replace(/^\[!(NOTE|WARNING)\]\s*/i, '');
    div.innerHTML = `<div class="a-title">${kind === 'note' ? 'ⓘ NOTE' : '⚠ WARNING'}</div>` + bq.innerHTML;
    bq.replaceWith(div);
  });
  // 代码复制
  $$('.code-copy', container).forEach(btn => {
    btn.onclick = () => {
      const code = btn.closest('pre').querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => { btn.textContent = '已复制'; setTimeout(() => btn.textContent = '复制', 1500); });
    };
  });
  // Mermaid
  for (const el of $$('.mermaid-render', container)) {
    if (el.dataset.done) continue;
    if (skipMermaid) { el.innerHTML = '<div style="color:var(--text-3);font-size:12px;padding:14px;text-align:center">图表生成中，完成后渲染…</div>'; continue; }
    el.dataset.done = '1';
    const code = el.closest('.mermaid-box').querySelector('.mermaid-src').textContent;
    const renderId = 'mm-' + (++mmSeq);
    try {
      const { svg } = await mermaid.render(renderId, code);
      el.innerHTML = svg;
    } catch (e) {
      // 清理 mermaid 失败时注入 body 的临时错误元素
      const tmp = document.getElementById(renderId);
      if (tmp) tmp.remove();
      $$('.mermaid[data-processed="true"]').forEach(d => { if (!d.closest('.md-body') && !d.closest('.mermaid-box')) d.remove(); });
      const box = el.closest('.mermaid-box');
      box.innerHTML = `<div class="mermaid-err">图表解析失败</div><pre><div class="code-lang"><span>mermaid</span></div><code>${esc(code)}</code></pre>`;
    }
  }
  // 全屏
  $$('.mermaid-expand', container).forEach(btn => {
    btn.onclick = () => {
      const svg = btn.closest('.mermaid-box').querySelector('.mermaid-render').innerHTML;
      openMermaidOverlay(svg);
    };
  });
}

/* Mermaid 全屏 */
let mmScale = 1;
let mmReqKey = null;
function openMermaidOverlay(svg) {
  $('#mm-canvas').innerHTML = svg;
  mmScale = 1;
  applyMmScale();
  $('#mermaid-overlay').classList.remove('hidden');
  mmReqKey = ReqPanel.push('richtext');
}
function closeMermaidOverlay() {
  $('#mermaid-overlay').classList.add('hidden');
  if (mmReqKey) { ReqPanel.pop(mmReqKey); mmReqKey = null; }
}
function applyMmScale() {
  $('#mm-canvas').style.transform = `scale(${mmScale})`;
  $('#mm-zoom-label').textContent = Math.round(mmScale * 100) + '%';
}
$('#mm-zoom-in').onclick = () => { mmScale = Math.min(3, mmScale + 0.2); applyMmScale(); };
$('#mm-zoom-out').onclick = () => { mmScale = Math.max(0.2, mmScale - 0.2); applyMmScale(); };
$('#mm-zoom-fit').onclick = () => { mmScale = 1; applyMmScale(); };
$('#mm-close').onclick = closeMermaidOverlay;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMermaidOverlay(); });

/* ============================================================
   员工生效配置（继承-覆盖）
   ============================================================ */
const PROFILE_FIELDS = ['persona', 'model', 'approval', 'rounds', 'context', 'tools'];
function effectiveEmp(emp) {
  const agent = store.data.agents.find(a => a.id === emp.agentId);
  const eff = {};
  PROFILE_FIELDS.forEach(f => { eff[f] = (f in emp.overrides) ? emp.overrides[f] : (agent ? agent[f] : undefined); });
  return { eff, agent };
}
function approvalLabel(v) { return v === 'ask' ? '每次询问' : '自动审批'; }
function contextLabel(v) { return (v || 200) + 'K'; }
function roundsLabel(v) { return v ? String(v) + ' 轮' : '全局默认'; }

/* 对话的生效上下文上限（token） */
function convContextLimit(conv) {
  let k = 200;
  if (conv.mode === 'employee') {
    const emp = store.data.employees.find(e => e.id === conv.employeeId);
    if (emp) k = effectiveEmp(emp).eff.context || 200;
  } else {
    const gen = store.data.agents.find(a => a.id === 'ag-general');
    if (gen) k = gen.context || 200;
  }
  return k * 1000;
}

/* ============================================================
   工作台
   ============================================================ */
function renderChat() {
  renderChatSidebar();
  renderChatMain();
  renderTopbar();
}

/* ---------- 侧栏 ---------- */
function renderChatSidebar() {
  const sb = $('#chat-sidebar');
  sb.innerHTML = `
    <div class="mode-tabs">
      <button class="mode-tab ${state.chatMode === 'employee' ? 'active' : ''}" data-mode="employee">数字员工</button>
      <button class="mode-tab ${state.chatMode === 'general' ? 'active' : ''}" data-mode="general">通用助手</button>
    </div>
    <div id="sb-body" style="display:flex;flex-direction:column;flex:1;min-height:0"></div>`;
  $$('.mode-tab', sb).forEach(t => t.onclick = () => {
    if (!checkSelf()) return;
    state.chatMode = t.dataset.mode;
    if (state.chatMode === 'general') state.chatScreen = 'conversation';
    else if (!state.activeEmpId) state.chatScreen = 'roster';
    state.activeConvId = null;
    renderChat();
  });
  const body = $('#sb-body', sb);
  if (state.chatMode === 'general') renderConvList(body, 'general');
  else {
    if (state.chatScreen === 'roster') renderRosterSide(body);
    else renderConvList(body, 'employee');
  }
}

function convStatusHtml(conv) {
  if (conv.status === 'running') return '<span class="conv-status running"><span class="dot dot-run"></span>进行中</span>';
  if (conv.status === 'interrupted') return `<span class="conv-status interrupted">中断 · ${esc(conv.interruptReason || '生成异常')}</span>`;
  return '<span class="conv-status done">完成</span>';
}

function renderConvList(container, mode) {
  let list = store.data.conversations.filter(c => c.mode === mode);
  if (mode === 'employee') list = list.filter(c => c.employeeId === state.activeEmpId);
  list = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  const emp = mode === 'employee' ? store.data.employees.find(e => e.id === state.activeEmpId) : null;
  container.innerHTML = `
    ${mode === 'employee' && emp ? `
      <div class="sidebar-head" style="padding-top:2px"><div class="sidebar-head-row" style="width:100%">
        <button class="btn btn-sm" id="back-roster">‹ 名册</button>
        <button class="btn btn-primary btn-sm" id="new-conv">＋ 新建对话</button>
      </div></div>
      <div class="emp-side-item" style="margin:0 10px 8px;cursor:default">
        <span class="avatar ${empAvatarClass(emp)}">${esc(emp.name.slice(0, 1))}</span>
        <div class="info"><div class="name">${esc(emp.name)}</div><div class="sub">${esc(effectiveEmp(emp).eff.model || '')} · ${toolCount(emp)} 工具</div></div>
      </div>` : `
      <div class="sidebar-head"><button class="new-conv-btn btn-star" id="new-conv">＋ 新建对话</button></div>`}
    <div class="sidebar-section">对话列表</div>
    <div class="sidebar-list" id="conv-list"></div>`;
  if (mode === 'employee' && emp) $('#back-roster', container).onclick = () => { state.chatScreen = 'roster'; state.activeConvId = null; renderChat(); };
  $('#new-conv', container).onclick = () => { if (checkSelf()) createConversation(mode); };
  const listEl = $('#conv-list', container);
  if (!list.length) {
    listEl.innerHTML = `<div style="text-align:center;color:var(--text-3);font-size:12px;padding:26px 10px">暂无对话<br>点击上方按钮开始</div>`;
    return;
  }
  list.forEach(c => {
    const el = document.createElement('div');
    el.className = 'conv-item' + (c.id === state.activeConvId ? ' active' : '');
    el.innerHTML = `<div class="conv-item-top"><div class="conv-item-title">${esc(c.title || '新对话')}</div></div>
      <div class="conv-item-meta"><span>${relTime(c.updatedAt)}</span>${convStatusHtml(c)}</div>
      ${c.status === 'running' ? '<span class="conv-spinner"></span>' : ''}`;
    el.onclick = () => { if (!checkSelf()) return; state.activeConvId = c.id; renderChat(); renderTopbar(); };
    listEl.appendChild(el);
  });
}

function renderRosterSide(container) {
  const emps = store.data.employees;
  container.innerHTML = `
    <div class="sidebar-head"><button class="new-conv-btn btn-star" id="new-emp">＋ 新建数字员工</button></div>
    <div class="sidebar-section">名册 <span style="font-weight:400"><b data-count="${emps.length}">${emps.length}</b> 位同事</span></div>
    <div class="sidebar-list" id="emp-side-list"></div>`;
  $('#new-emp', container).onclick = () => {
    if (!checkSelf()) return;
    const cur = state.rosterFolder;
    openNewEmployeeModal(undefined, cur === 'ALL' || cur === 'ROOT' ? '' : cur);
  };
  const listEl = $('#emp-side-list', container);
  if (!emps.length) {
    listEl.innerHTML = `<div style="text-align:center;color:var(--text-3);font-size:12px;padding:26px 10px">名册为空<br>去智能体中心派生第一位同事</div>`;
    return;
  }
  emps.forEach(emp => {
    const el = document.createElement('div');
    el.className = 'emp-side-item';
    el.innerHTML = `<span class="avatar ${empAvatarClass(emp)}">${esc(emp.name.slice(0, 1))}</span>
      <div class="info"><div class="name">${esc(emp.name)}</div><div class="sub">${esc(effectiveEmp(emp).eff.model || '')}</div></div>`;
    el.onclick = () => { if (!checkSelf()) return; state.activeEmpId = emp.id; state.chatScreen = 'conversation'; state.activeConvId = null; renderChat(); };
    listEl.appendChild(el);
  });
}

function avatarClass(id) { return 'a' + (1 + (Math.abs(hash(id)) % 6)); }
/* 头像颜色跟随「引用智能体」：同一智能体派生的员工同色，无来源时回退到员工自身 id */
function empAvatarClass(emp) { return avatarClass(emp && (emp.agentId || emp.id) || 'x'); }
function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }
function toolCount(emp) { return (effectiveEmp(emp).eff.tools || []).length; }

/* ---------- 主区 ---------- */
function renderChatMain() {
  const main = $('#chat-main');
  if (state.chatMode === 'employee' && state.chatScreen === 'roster') { ReqPanel.setView('roster'); return renderRoster(main); }
  ReqPanel.setView('conversation');
  renderConversation(main);
}

/* ---------- 名册屏 ---------- */
function renderRoster(main) {
  const folders = store.data.folders;
  const emps = store.data.employees;
  const inFolder = fid => emps.filter(e => (e.folderId || null) === fid);
  const current = state.rosterFolder;
  const curFolder = current === 'ALL' || current === 'ROOT' ? null : folders.find(f => f.id === current);
  const presetFolderId = curFolder ? curFolder.id : '';
  const ls = state.rosterList;
  main.innerHTML = `<div class="roster-layout">
    <div class="roster-folders">
      <div class="sidebar-section" style="padding-top:0">部门文件夹
        <button class="mini-add" id="add-folder" title="新建文件夹">＋</button>
      </div>
      <div class="folder-item ${current === 'ALL' ? 'active' : ''}" data-f="ALL"><span class="f-icon">▦</span><span class="f-name">全部</span><span class="f-count">${emps.length}</span></div>
      <div class="folder-item ${current === 'ROOT' ? 'active' : ''}" data-f="ROOT"><span class="f-icon">▣</span><span class="f-name">未分组</span><span class="f-count">${inFolder(null).length}</span></div>
      ${folders.map(f => `<div class="folder-item ${current === f.id ? 'active' : ''}" data-f="${f.id}"><span class="f-icon">▤</span><span class="f-name">${esc(f.name)}</span><span class="f-count">${inFolder(f.id).length}</span></div>`).join('')}
    </div>
    <div class="roster-main">
      <div class="page-head">
        <div class="page-title" id="roster-title"></div>
        <div class="spacer"></div>
        <button class="btn btn-primary btn-star" id="new-emp-2">＋ 新建数字员工</button>
      </div>
      ${current === 'ALL' ? '<div class="page-sub">从智能体派生你的 AI 同事；点「对话」开始干活，点「配置」微调它的能力剖面。</div>' : ''}
      <div class="table-toolbar list-toolbar">
        ${toolbarSearchHtml('rq', '搜索员工 / 引用智能体')}
        <select class="toolbar-filter" id="r-sort">
          <option value="created_desc">创建时间 · 新到旧</option>
          <option value="created_asc">创建时间 · 旧到新</option>
          <option value="name_asc">名称 · A 到 Z</option>
        </select>
      </div>
      <div id="emp-grid"></div>
      <div id="emp-pager"></div>
    </div>
  </div>`;
  $$('.folder-item', main).forEach(el => el.onclick = () => { state.rosterFolder = el.dataset.f; state.rosterList.page = 1; renderChatMain(); });
  $('#add-folder', main).onclick = () => { if (checkSelf()) openNewFolderModal(); };
  $('#new-emp-2', main).onclick = () => { if (checkSelf()) openNewEmployeeModal(undefined, presetFolderId); };
  /* 工具栏只绑一次：输入/变更只重绘卡片区与分页条，搜索框不丢焦点 */
  const q = $('#rq'); q.value = ls.q;
  q.oninput = () => { ls.q = q.value.trim(); ls.page = 1; renderEmpCards(); };
  const sort = $('#r-sort'); sort.value = ls.sort;
  sort.onchange = () => { ls.sort = sort.value; ls.page = 1; renderEmpCards(); };
  renderEmpCards();
}

function renderEmpCards() {
  const folders = store.data.folders;
  const emps = store.data.employees;
  const current = state.rosterFolder;
  const curFolder = current === 'ALL' || current === 'ROOT' ? null : folders.find(f => f.id === current);
  const presetFolderId = curFolder ? curFolder.id : '';
  const ls = state.rosterList;
  let shown = current === 'ALL' ? [...emps] : emps.filter(e => (e.folderId || null) === (current === 'ROOT' ? null : current));
  if (ls.q) shown = shown.filter(e => {
    const ag = store.data.agents.find(a => a.id === e.agentId);
    return e.name.includes(ls.q) || (ag && ag.name.includes(ls.q));
  });
  shown = sortByPreset(shown, ls.sort);
  const { rows, total, pages } = paginate(shown, ls);
  /* 标题跟随文件夹与筛选结果 */
  $('#roster-title').textContent = current === 'ALL' ? '数字员工名册'
    : `${curFolder ? curFolder.name : '未分组'} · ${total} 位同事`;
  const grid = $('#emp-grid');
  grid.innerHTML = '';
  if (!rows.length) {
    if (!emps.length || ls.q) {
      const emptyTxt = !emps.length ? '名册还是空的，从智能体派生第一位 AI 同事吧'
        : '无匹配员工，请调整搜索条件或切换文件夹';
      grid.innerHTML = `<div class="empty-state"><div class="e-icon">${emps.length ? '🔍' : '🪺'}</div><div class="e-txt">${esc(emptyTxt)}</div>${!emps.length ? '<button class="btn btn-primary" onclick="window.__newEmp()">＋ 新建数字员工</button>' : ''}</div>`;
      window.__newEmp = () => { if (checkSelf()) openNewEmployeeModal(undefined, presetFolderId); };
    } else {
      grid.innerHTML = `<div class="empty-state"><div class="e-icon">🪺</div><div class="e-txt">「${esc(curFolder ? curFolder.name : '未分组')}」里还没有同事</div><button class="btn btn-primary" onclick="window.__newEmp()">＋ 新建数字员工</button></div>`;
      window.__newEmp = () => { if (checkSelf()) openNewEmployeeModal(undefined, presetFolderId); };
    }
  } else {
    const cardGrid = document.createElement('div');
    cardGrid.className = 'card-grid';
    rows.forEach(emp => {
      const { eff, agent } = effectiveEmp(emp);
      const card = document.createElement('div');
      card.className = 'emp-card';
      card.innerHTML = `
        <div class="emp-card-top">
          <span class="avatar ${empAvatarClass(emp)}">${esc(emp.name.slice(0, 1))}</span>
          <div style="min-width:0">
            <div class="emp-card-name">${esc(emp.name)}</div>
            <div class="emp-card-sub">引用智能体 · ${esc(agent ? agent.name : '已删除')}</div>
          </div>
        </div>
        <div class="emp-card-meta">
          <span>${esc(eff.model || '未配置模型')} · <b data-count="${toolCount(emp)}">${toolCount(emp)}</b> 工具 · 技能 0</span>
          ${Object.keys(emp.overrides).length ? '<span class="badge badge-warn">有自定义</span>' : '<span class="badge badge-sys">全跟随</span>'}
        </div>
        <div class="emp-card-ops">
          <button class="btn btn-accent btn-sm act-chat">对 话</button>
          <button class="btn btn-sm act-cfg">配 置</button>
          <button class="btn btn-sm act-more" title="更多操作">⋯</button>
        </div>`;
      $('.act-chat', card).onclick = () => { if (!checkSelf()) return; state.activeEmpId = emp.id; state.chatScreen = 'conversation'; state.activeConvId = null; renderChat(); };
      $('.act-cfg', card).onclick = () => { if (checkSelf()) openEmpConfigDrawer(emp.id); };
      /* 低频操作收进更多菜单：移动 / 删除（危险项红色置底） */
      $('.act-more', card).onclick = () => openOpsMenu($('.act-more', card), [
        { label: '移动', onClick: () => { if (checkSelf()) openMoveEmpModal(emp.id); } },
        { label: '删除', danger: true, onClick: () => {
          if (!checkSelf()) return;
          const n = store.data.conversations.filter(c => c.employeeId === emp.id).length;
          confirmModal({
            title: '删除数字员工',
            text: `将删除员工「${esc(emp.name)}」${n ? `及其 ${n} 个对话` : ''}。该操作不可撤销，是否继续？`,
            danger: true, okText: '删除',
            onOk: () => {
              store.data.employees = store.data.employees.filter(e => e.id !== emp.id);
              store.data.conversations = store.data.conversations.filter(c => c.employeeId !== emp.id);
              if (state.activeEmpId === emp.id) { state.activeEmpId = null; state.activeConvId = null; }
              store.save(); toast('已删除', 'success'); renderChat();
            },
          });
        } },
      ]);
      cardGrid.appendChild(card);
    });
    grid.appendChild(cardGrid);
    if (window.Motion) Motion.reveal(cardGrid.children, { step: 40 });
  }
  const pager = $('#emp-pager');
  pager.innerHTML = pagerHtml(ls, total, pages, true);
  bindPager(pager, ls, renderEmpCards);
}

/* ---------- 对话屏 ---------- */
function currentConv() { return store.data.conversations.find(c => c.id === state.activeConvId) || null; }

function createConversation(mode) {
  if (mode === 'employee' && !state.activeEmpId) return;
  const conv = {
    id: uid('cv'), mode, employeeId: mode === 'employee' ? state.activeEmpId : null,
    title: '', updatedAt: Date.now(), status: 'done', permMode: 'ask',
    model: defaultModelFor(mode, mode === 'employee' ? state.activeEmpId : null),
    messages: [], ctx: { warned: false, compressedRounds: 0 },
  };
  store.data.conversations.push(conv);
  store.save();
  state.activeConvId = conv.id;
  renderChat();
}

function defaultModelFor(mode, empId) {
  let m = null;
  if (mode === 'employee' && empId) {
    const emp = store.data.employees.find(e => e.id === empId);
    if (emp) m = effectiveEmp(emp).eff.model;
  } else {
    const gen = store.data.agents.find(a => a.id === 'ag-general');
    if (gen) m = gen.model;
  }
  const enabled = enabledModels();
  return enabled.includes(m) ? m : (enabled[0] || m || '未配置');
}

function enabledModels() {
  return [...new Set(store.data.endpoints.filter(e => e.status === 'enabled').map(e => e.model))];
}

function renderConversation(main) {
  const conv = currentConv();
  const mode = state.chatMode;
  const emp = mode === 'employee' ? store.data.employees.find(e => e.id === state.activeEmpId) : null;
  const gen = mode === 'general' ? store.data.agents.find(a => a.id === 'ag-general') : null;
  const whoName = mode === 'employee' ? (emp ? emp.name : '数字员工') : '通用助手';
  const whoModel = mode === 'employee' && emp ? effectiveEmp(emp).eff.model : (gen ? gen.model : '');

  main.innerHTML = `
    <div class="conv-head">
      <div class="who">
        <span class="avatar ${mode === 'employee' ? empAvatarClass(emp) : ''}" style="width:32px;height:32px;font-size:13px">${esc(whoName.slice(0, 1))}</span>
        <div><div class="name">${esc(whoName)}</div><div class="sub">${esc(whoModel || '')}${mode === 'employee' && emp ? ' · 引用 ' + esc((effectiveEmp(emp).agent || {}).name || '') : ''}</div></div>
      </div>
      <div class="spacer"></div>
      <div class="ctx-meter" id="ctx-meter"></div>
      ${mode === 'employee' && emp ? '<button class="btn btn-sm" id="emp-cfg-btn">员工配置</button>' : ''}
    </div>
    <div class="msg-scroll" id="msg-scroll"><div class="msg-col" id="msg-col"></div></div>
    <div class="composer-wrap"><div class="composer-col"><div class="composer-outer">
      <div class="slash-panel hidden" id="slash-panel">
        <div class="slash-head">技能面板</div>
        <div class="slash-empty">暂无可用技能</div>
      </div>
      <div class="composer" id="composer">
        <textarea id="composer-input" rows="2" placeholder="输入消息，Enter 发送，Shift+Enter 换行"></textarea>
        <div class="composer-bar">
          <button class="attach-btn" id="attach-btn" title="附件">📎</button>
          <span class="composer-select" title="权限模式（对话级保存）">
            <span style="font-size:11px;color:var(--text-3)">权限</span>
            <select id="perm-mode"><option value="ask">询问审批</option><option value="full">完全访问</option></select>
          </span>
          <span class="composer-right">
            <span class="composer-select" title="模型选择（启用状态端点的模型）">
              <select id="model-select"></select>
            </span>
            <button class="send-btn" id="send-btn" title="发送">↑</button>
          </span>
        </div>
      </div>
      <div class="composer-hint">请勿输入敏感信息 · 内容由 AI 生成，请注意甄别</div>
    </div></div></div>`;

  if (mode === 'employee' && emp) $('#emp-cfg-btn').onclick = () => { if (checkSelf()) openEmpConfigDrawer(emp.id); };

  // 模型选择器
  const sel = $('#model-select');
  const models = enabledModels();
  sel.innerHTML = models.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
  if (conv) sel.value = conv.model;
  sel.onchange = () => { if (conv) { conv.model = sel.value; store.save(); } };

  // 权限模式
  const perm = $('#perm-mode');
  if (conv) perm.value = conv.permMode;
  perm.onchange = () => { if (conv) { conv.permMode = perm.value; store.save(); toast(perm.value === 'ask' ? '已切换：询问审批（工具执行前询问）' : '已切换：完全访问', 'info'); } };

  const ta = $('#composer-input');
  $('#attach-btn').onclick = () => toast('附件功能将在后续版本开放', 'info');
  ta.onkeydown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendCurrent(); }
    if (e.key === 'Escape') { const sp = $('#slash-panel'); if (sp) sp.classList.add('hidden'); }
  };
  ta.oninput = () => {
    autoGrow(ta);
    const sp = $('#slash-panel');
    if (sp) sp.classList.toggle('hidden', !ta.value.startsWith('/'));
  };
  $('#send-btn').onclick = sendCurrent;

  renderMsgCol();
  applyBackendUI();
}

function autoGrow(ta) { ta.style.height = 'auto'; ta.style.height = Math.min(160, ta.scrollHeight) + 'px'; }

/* ---------- 消息版本（重新生成留存历史，可切换查看） ---------- */
function newVersion(model) {
  return { ts: Date.now(), thinking: '', thinkDone: false, contentStarted: false, tools: [], content: '', state: 'streaming', followups: [], model, startedAt: Date.now() };
}
/* 取消息当前展示的版本；旧数据（无 versions）视为单版本 */
function curVer(m) {
  if (!m || m.role !== 'ai' || !m.versions || !m.versions.length) return m;
  if (m.cur == null || m.cur < 0 || m.cur > m.versions.length - 1) m.cur = m.versions.length - 1;
  return m.versions[m.cur];
}

/* ---------- 消息渲染 ---------- */
function renderMsgCol() {
  const col = $('#msg-col');
  if (!col) return;
  const conv = currentConv();
  const mode = state.chatMode;
  if (!conv || !conv.messages.length) return renderWelcome(col, mode);
  col.innerHTML = '';
  conv.messages.forEach(m => col.appendChild(msgNode(m, conv)));
  updateCtxMeter();
  scrollToBottom();
  if (window.Motion) Motion.animateLast(col);
}

function renderWelcome(col, mode) {
  const name = state.user.name;
  const isEmp = mode === 'employee';
  const emp = isEmp ? store.data.employees.find(e => e.id === state.activeEmpId) : null;
  col.innerHTML = `
    <div class="welcome">
      <h2>${greet()}，${esc(name)}</h2>
      <p>${isEmp && emp ? `我是 ${esc(emp.name)}，已就绪。选择下面的推荐问题，或直接输入你的任务。` : '我是通用助手，已就绪。选择下面的推荐问题，或直接输入你的任务。'}</p>
      <div class="q-cards">
        ${SUGGESTED_QUESTIONS.map((q, i) => `<button class="q-card" data-q="${esc(q)}"><span class="num">0${i + 1}</span><span class="txt">${esc(q)}</span><span class="go">↗</span></button>`).join('')}
      </div>
      <div class="skill-area">
        <div class="skill-area-head">可用技能</div>
        <div class="skill-empty">暂无可用技能</div>
      </div>
    </div>`;
  $$('.q-card', col).forEach(b => b.onclick = () => { $('#composer-input').value = b.dataset.q; sendCurrent(); });
  updateCtxMeter();
  if (window.Motion) {
    Motion.reveal($$('.welcome > *', col), { step: 80 });
    Motion.reveal($$('.q-card', col), { step: 55, from: 240 });
  }
}

function msgNode(m, conv) {
  const wrap = document.createElement('div');
  if (m.role === 'compress') {
    wrap.className = 'compress-mark';
    wrap.innerHTML = `<span class="cm-tag" title="已压缩 ${m.compressedRounds} 轮早期对话 · 压缩前用量约 ${m.beforeTokens} tokens">🗜 已压缩早期对话内容（保留最近 10 轮原文）</span>`;
    return wrap;
  }
  wrap.className = 'msg ' + (m.role === 'user' ? 'user' : 'ai');
  if (m.role === 'user') {
    wrap.innerHTML = `<div class="msg-body"><div class="msg-bubble"></div>
      <div class="msg-meta-row"><span>${fmtHm(new Date(m.ts))}</span>
        <span class="msg-ops"><button class="msg-op op-copy" title="复制">${ICON_COPY}</button></span></div></div>`;
    $('.msg-bubble', wrap).textContent = m.content;
    $('.op-copy', wrap).onclick = () => navigator.clipboard.writeText(m.content || '').then(() => toast('已复制', 'success'));
    return wrap;
  }
  // AI 消息：头部（头像+名称+时间）+ 平铺正文
  const v = curVer(m);
  wrap.innerHTML = `<span class="ai-avatar">${BOT_SVG}</span>
    <div class="msg-body">
      <div class="ai-head"><span class="ai-name">${esc(aiName(conv))}</span><span class="ai-time">${fmtHm(new Date(v.ts))}</span></div>
      <div class="msg-bubble"></div>
      <div class="msg-meta-row"></div>
    </div>`;
  const bubble = $('.msg-bubble', wrap);
  fillBubble(bubble, m);
  const meta = $('.msg-meta-row', wrap);
  // 版本切换：多次重新生成时出现 ‹ n/N ›
  if (m.versions && m.versions.length > 1) {
    const nav = document.createElement('span');
    nav.className = 'ver-nav';
    nav.innerHTML = `<button class="ver-btn" data-d="-1" ${m.cur <= 0 ? 'disabled' : ''} title="上一版">‹</button><span class="ver-ind">${m.cur + 1}/${m.versions.length}</span><button class="ver-btn" data-d="1" ${m.cur >= m.versions.length - 1 ? 'disabled' : ''} title="下一版">›</button>`;
    $$('.ver-btn', nav).forEach(b => b.onclick = () => {
      m.cur = Math.min(m.versions.length - 1, Math.max(0, m.cur + (+b.dataset.d)));
      store.save();
      wrap.replaceWith(msgNode(m, conv));
      updateCtxMeter();
    });
    meta.appendChild(nav);
  }
  // 生成中不显示「重新生成 / 复制」，生成结束后 renderMsgCol 重绘时出现
  if (v.state !== 'streaming') {
    const ops = document.createElement('span');
    ops.className = 'msg-ops';
    ops.innerHTML = `
      <button class="msg-op op-regen">${ICON_REGEN}${v.state === 'failed' ? '重试' : '重新生成'}</button>
      <button class="msg-op op-copy">${ICON_COPY}复制</button>
      <button class="msg-op disabled" disabled title="Trace 回放将在后续版本开放">Trace</button>`;
    ops.querySelector('.op-copy').onclick = () => { navigator.clipboard.writeText(v.content || '').then(() => toast('已复制', 'success')); };
    ops.querySelector('.op-regen').onclick = () => { if (checkSelf()) regenerate(conv, m); };
    meta.appendChild(ops);
  }
  if (v.state === 'stopped') meta.insertAdjacentHTML('beforeend', '<span class="msg-flag stopped">已停止</span>');
  if (v.state === 'failed') meta.insertAdjacentHTML('beforeend', '<span class="msg-flag failed">生成异常 · 可重试</span>');
  if (v.state === 'streaming') meta.insertAdjacentHTML('beforeend', '<span class="spin"></span>');
  return wrap;
}

const ICON_REGEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 3v4h-4"/></svg>';
const ICON_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

function aiName(conv) {
  if (conv.mode === 'employee') {
    const emp = store.data.employees.find(e => e.id === conv.employeeId);
    return emp ? emp.name : '数字员工';
  }
  return '通用助手';
}

/* 气泡内容填充（思考块 + 工具卡 + 正文） */
function fillBubble(bubble, m) {
  bubble.innerHTML = '';
  if (m.role === 'user') { bubble.textContent = m.content; return; }
  const v = curVer(m);
  if (v.thinking !== undefined && v.thinking !== null && (v.thinking.length || v.state === 'streaming')) {
    const tb = document.createElement('div');
    tb.className = 'think-block' + (v.state === 'streaming' && !v.contentStarted ? ' open' : '');
    tb.innerHTML = `<div class="think-head">${v.state === 'streaming' && !v.thinkDone ? '<span class="think-spin"></span><span class="shiny-text">思考中…</span>' : `<span class="arrow">▶</span><span class="think-ico">i</span>思考 ${v.thinking.length} 字`}</div><div class="think-body">${esc(v.thinking)}</div>`;
    tb.querySelector('.think-head').onclick = () => tb.classList.toggle('open');
    bubble.appendChild(tb);
  }
  (v.tools || []).forEach(t => bubble.appendChild(toolCardNode(t)));
  const body = document.createElement('div');
  body.className = 'md-body';
  let src = v.content || '';
  // 流式容错：未闭合代码围栏临时补齐
  if (v.state === 'streaming' && (src.match(/```/g) || []).length % 2 === 1) src += '\n```';
  body.innerHTML = renderMarkdown(src);
  if (v.state === 'streaming' && v.contentStarted) body.insertAdjacentHTML('beforeend', '<span class="typing-caret"></span>');
  bubble.appendChild(body);
  postProcessMd(body, { skipMermaid: v.state === 'streaming' });
  if (v.state === 'done' && v.followups && v.followups.length) {
    const fu = document.createElement('div');
    fu.className = 'followups';
    fu.innerHTML = `<div class="fu-label">猜你想问</div><div class="q-cards">` +
      v.followups.map((f, i) => `<button class="q-card" data-i="${i}"><span class="num">0${i + 1}</span><span class="txt">${esc(f)}</span><span class="go">↗</span></button>`).join('') +
      '</div>';
    $$('.q-card', fu).forEach(card => card.onclick = () => {
      if (!checkSelf()) return;
      $('#composer-input').value = v.followups[+card.dataset.i];
      sendCurrent();
    });
    bubble.appendChild(fu);
  }
}

function toolCardNode(t) {
  const el = document.createElement('div');
  el.className = 'tool-card';
  const stateHtml = t.state === 'running'
    ? '<span class="tool-state"><span class="tool-spin"></span><span class="shiny-text">调用中…</span></span>'
    : t.ok ? `<span class="tool-state ok">✓ 成功 · ${t.duration}ms</span>` : `<span class="tool-state err">✕ 失败 · ${t.duration}ms</span>`;
  el.innerHTML = `<div class="tool-head"><span class="tool-icon">⚒</span><span class="tool-name">${esc(t.name)}</span>${stateHtml}</div>
    <div class="tool-args">${esc(Object.entries(t.args).map(([k, v]) => `${k}: ${v}`).join('\n'))}</div>`;
  return el;
}

function scrollToBottom() {
  const sc = $('#msg-scroll');
  if (sc) sc.scrollTop = sc.scrollHeight;
}

/* ---------- 上下文计量 ---------- */
/* 该对话生效的人设（系统提示） */
function convPersona(conv) {
  if (conv.mode === 'employee') {
    const emp = store.data.employees.find(e => e.id === conv.employeeId);
    if (emp) return effectiveEmp(emp).eff.persona || '';
  } else {
    const gen = store.data.agents.find(a => a.id === 'ag-general');
    if (gen) return gen.persona || '';
  }
  return '';
}

/* 上限来源说明（悬浮卡展示用） */
function ctxLimitSource(conv) {
  if (conv.mode === 'employee') {
    const emp = store.data.employees.find(e => e.id === conv.employeeId);
    if (!emp) return '未知';
    const { agent } = effectiveEmp(emp);
    if ('context' in emp.overrides) return `员工自定义 · ${emp.overrides.context}K`;
    return `跟随智能体「${agent ? agent.name : '已删除'}」· ${(agent && agent.context) || 200}K`;
  }
  const gen = store.data.agents.find(a => a.id === 'ag-general');
  return `通用助手配置 · ${(gen && gen.context) || 200}K`;
}

/* 用量 = 人设 + 历史消息（含思考）+ 工具调用记录 + 压缩摘要，按当前展示版本计算 */
function convUsage(conv) {
  const tok = c => Math.ceil(c / 1.6);
  let historyChars = 0, toolChars = 0, compressedChars = 0;
  conv.messages.forEach(m => {
    if (m.role === 'compress') { compressedChars += m.compressedChars || 0; return; }
    const v = curVer(m);
    historyChars += (v.content || '').length + (v.thinking || '').length;
    (v.tools || []).forEach(t => { toolChars += (t.name || '').length + JSON.stringify(t.args || {}).length; });
  });
  const parts = {
    persona: tok(convPersona(conv).length),
    history: tok(historyChars),
    tools: tok(toolChars),
    compressed: tok(compressedChars),
  };
  const used = parts.persona + parts.history + parts.tools + parts.compressed;
  const limit = convContextLimit(conv);
  return { used, limit, pct: used / limit, parts };
}

function updateCtxMeter() {
  const el = $('#ctx-meter');
  const conv = currentConv();
  if (!el || !conv) return;
  const { used, limit, pct, parts } = convUsage(conv);
  const p = Math.min(100, Math.round(pct * 100));
  const cls = pct >= 0.9 ? 'full' : pct >= 0.8 ? 'warn' : '';
  const limitK = (limit / 1000).toLocaleString() + 'K';
  const compressedRounds = (conv.ctx && conv.ctx.compressedRounds) || 0;
  const row = (label, v) => `<div class="ctx-row"><span>${label}</span><b>${v.toLocaleString()}</b></div>`;
  el.innerHTML = `
    <span class="ctx-label ${cls}">上下文 ${used.toLocaleString()} / ${limitK} tokens · ${p}%</span>
    <span class="ctx-bar ${cls}"><i style="width:${p}%"></i></span>
    <div class="ctx-pop">
      <div class="ctx-pop-title">上下文用量</div>
      <div class="ctx-pop-total">已用 ${used.toLocaleString()} / ${limitK} tokens · ${p}%</div>
      <span class="ctx-bar ${cls}"><i style="width:${p}%"></i></span>
      <div class="ctx-pop-rows">
        ${row('人设（系统提示）', parts.persona)}
        ${row('历史消息（含思考过程）', parts.history)}
        ${row('工具调用记录', parts.tools)}
        ${row('压缩摘要', parts.compressed)}
      </div>
      <div class="ctx-pop-foot">上限来源：${esc(ctxLimitSource(conv))}<br>已压缩 ${compressedRounds} 轮 · 用量达 80% 预警、90% 自动压缩早期内容</div>
    </div>`;
  // 预警（一次）
  if (pct >= 0.8 && pct < 0.9 && !conv.ctx.warned) {
    conv.ctx.warned = true; store.save();
    toast('上下文用量已达 80%，继续对话将自动压缩早期内容', 'info');
  }
}

/* 自动压缩：保留最近 10 轮（20 条），早期压为摘要标记 */
function compressIfNeeded(conv) {
  let { used, limit, pct } = convUsage(conv);
  if (pct < 0.9) return;
  const keep = 20;
  const msgs = conv.messages.filter(m => m.role !== 'compress');
  if (msgs.length <= keep) return; // 压缩失败路径
  const cut = msgs.length - keep;
  const removed = msgs.slice(0, cut);
  const removedChars = removed.reduce((n, m) => { const v = curVer(m); return n + (v.content || '').length + (v.thinking || '').length; }, 0);
  const beforeTokens = Math.ceil(removedChars / 1.6);
  const mark = {
    id: uid('cp'), role: 'compress', ts: Date.now(),
    compressedRounds: Math.ceil(cut / 2), beforeTokens,
    compressedChars: Math.ceil(removedChars * 0.2), content: '', thinking: '',
  };
  conv.ctx.compressedRounds += mark.compressedRounds;
  // 重建消息列表：压缩标记置首 + 保留消息
  const remaining = conv.messages.filter(m => !removed.includes(m) && m.role !== 'compress');
  conv.messages = [mark, ...remaining];
  conv.ctx.warned = false;
  store.save();
  toast(`上下文已达 90%，已自动压缩早期 ${mark.compressedRounds} 轮对话`, 'info');
  renderMsgCol();
}

/* ---------- 发送与流式生成 ---------- */
async function sendCurrent() {
  if (!checkSelf()) return;
  if (state.streaming) return;
  if (!state.backendOk) return;
  const ta = $('#composer-input');
  const text = ta.value.trim();
  if (!text) return;
  if (text.length > 20000) return toast('单条消息不超过 2 万字', 'error');

  // 校验模型端点可用
  const mode = state.chatMode;
  if (mode === 'employee' && !state.activeEmpId) { state.chatScreen = 'roster'; return renderChat(); }
  let conv = currentConv();
  if (!conv) {
    const id = uid('cv');
    store.data.conversations.push({
      id, mode, employeeId: mode === 'employee' ? state.activeEmpId : null,
      title: '', updatedAt: Date.now(), status: 'done', permMode: $('#perm-mode') ? $('#perm-mode').value : 'ask',
      model: $('#model-select') ? $('#model-select').value : defaultModelFor(mode, state.activeEmpId),
      messages: [], ctx: { warned: false, compressedRounds: 0 },
    });
    conv = store.data.conversations.find(c => c.id === id);
    state.activeConvId = id;
  }
  conv.model = $('#model-select').value;
  const epOk = store.data.endpoints.some(e => e.model === conv.model && e.status === 'enabled');
  if (!epOk) {
    return toast(mode === 'employee' ? '该员工的模型已停用，请在高级配置中更换' : '当前模型端点已停用，请切换模型', 'error');
  }

  // 达 90% 先尝试压缩；压缩无法释放且已达上限时拦截发送，保留已输入内容（PRD 3.5 异常表 / AC-47）
  if (convUsage(conv).pct >= 0.9) compressIfNeeded(conv);
  { const u0 = convUsage(conv); if (u0.used >= u0.limit) return toast('上下文已满，请开启新对话', 'error'); }

  ta.value = ''; autoGrow(ta);
  { const sp = $('#slash-panel'); if (sp) sp.classList.add('hidden'); }
  conv.messages.push({ id: uid('m'), role: 'user', content: text, ts: Date.now() });
  if (!conv.title) conv.title = text.slice(0, 20);
  conv.updatedAt = Date.now();
  conv.status = 'running';
  store.save();
  renderChatSidebar();
  renderMsgCol();

  // 选剧本（检查工具授权）
  const rule = matchScript(text);
  let script = rule.script;
  let allowed = true;
  if (rule.needTool) {
    let tools = [];
    if (mode === 'employee') {
      const emp = store.data.employees.find(e => e.id === state.activeEmpId);
      if (emp) tools = effectiveEmp(emp).eff.tools || [];
    } else {
      const gen = store.data.agents.find(a => a.id === 'ag-general');
      tools = gen ? gen.tools || [] : [];
    }
    allowed = tools.includes(rule.needTool);
    if (!allowed) script = SCRIPT_FETCH_DENIED;
  }

  const msg = {
    id: uid('m'), role: 'ai',
    versions: [newVersion(conv.model)],
    cur: 0,
  };
  conv.messages.push(msg);
  store.save();
  await runStream(conv, msg, script);
}

async function runStream(conv, msg, script) {
  const v = curVer(msg); // 流式输出始终写入当前（最新）版本
  state.streaming = true;
  state.abort = { stop: false, backendDown: false };
  const sendBtn = $('#send-btn');
  if (sendBtn) { sendBtn.textContent = '■'; sendBtn.classList.add('stop-btn'); sendBtn.title = '停止生成'; sendBtn.onclick = () => { state.abort.stop = true; }; }

  const redraw = () => {
    const col = $('#msg-col');
    if (!col) return;
    const nodes = $$('.msg, .compress-mark', col);
    const idx = conv.messages.indexOf(msg);
    if (idx < 0 || !nodes[idx]) { renderMsgCol(); return; }
    const fresh = msgNode(msg, conv);
    nodes[idx].replaceWith(fresh);
    updateCtxMeter();
    scrollToBottom();
  };
  const interruptedByBackend = () => state.abort.backendDown || !state.backendOk;

  // 阶段 0：等待首字
  await sleep(500);

  // 阶段 1：思考流
  for (let i = 0; i < script.thinking.length; i += 3) {
    if (state.abort.stop || interruptedByBackend()) break;
    v.thinking = script.thinking.slice(0, i + 3);
    redraw();
    await sleep(18);
  }
  if (!interruptedByBackend() && !state.abort.stop) { v.thinking = script.thinking; }
  v.thinkDone = true;
  redraw();

  // 阶段 2：工具调用
  if (!state.abort.stop && !interruptedByBackend()) {
    for (const toolDef of script.tools) {
      const t = { name: toolDef.name, args: toolDef.args, state: 'running', duration: 0, ok: false };
      v.tools.push(t); redraw();
      const step = 90;
      for (let d = 0; d < toolDef.duration; d += step) {
        if (state.abort.stop || interruptedByBackend()) break;
        t.duration = d + step; redraw(); await sleep(step);
      }
      if (state.abort.stop || interruptedByBackend()) { t.state = 'done'; t.ok = false; t.duration = t.duration || 120; break; }
      t.state = 'done'; t.ok = toolDef.ok; t.duration = toolDef.duration;
      redraw();
      await sleep(250);
    }
  }

  // 阶段 3：正文流
  v.contentStarted = true;
  if (!state.abort.stop && !interruptedByBackend()) {
    for (let i = 0; i < script.content.length; i += 5) {
      if (state.abort.stop || interruptedByBackend()) break;
      v.content = script.content.slice(0, i + 5);
      redraw();
      await sleep(16);
    }
  }
  if (!state.abort.stop && !interruptedByBackend()) v.content = script.content;

  // 收尾
  if (interruptedByBackend()) {
    v.state = 'failed';
    conv.status = 'interrupted'; conv.interruptReason = '生成异常';
    toast('响应中断，可重试', 'error');
  } else if (state.abort.stop) {
    v.state = 'stopped';
    conv.status = 'done';
  } else {
    v.state = 'done';
    v.followups = script.followups;
    conv.status = 'done';
  }
  conv.updatedAt = Date.now();

  // model.call 落库
  const outChars = (v.content || '').length + (v.thinking || '').length;
  const inChars = conv.messages.filter(m => m.role === 'user').slice(-1).reduce((n, m) => n + m.content.length, 0);
  store.data.usageLogs.push({
    ts: fmtTime(), endpoint: conv.model, model: conv.model, source: '对话',
    tokensIn: Math.ceil(inChars / 1.6), tokensOut: Math.ceil(outChars / 1.6),
    durationMs: Date.now() - v.startedAt, traceId: 'trace-' + Math.random().toString(16).slice(2, 10),
  });
  if (store.data.usageLogs.length > 200) store.data.usageLogs = store.data.usageLogs.slice(-200);
  store.save();

  state.streaming = false;
  state.abort = null;
  const sendBtn2 = $('#send-btn');
  if (sendBtn2) { sendBtn2.textContent = '↑'; sendBtn2.classList.remove('stop-btn'); sendBtn2.title = '发送'; sendBtn2.onclick = sendCurrent; }
  renderChatSidebar();
  renderMsgCol();
  applyBackendUI();
  // 生成后再检查一次压缩阈值
  const convNow = currentConv();
  if (convNow) compressIfNeeded(convNow);
}

function regenerate(conv, m) {
  if (state.streaming) return;
  if (!state.backendOk) return toast('后端连接已断开，正在重连…', 'error');
  // 找到该 AI 消息对应的用户消息，重新生成
  const idx = conv.messages.indexOf(m);
  let userText = '';
  for (let i = idx - 1; i >= 0; i--) { if (conv.messages[i].role === 'user') { userText = conv.messages[i].content; break; } }
  // 分叉：重新生成中间消息时，其后的消息一并移除
  conv.messages.splice(idx + 1);
  // 旧数据（无 versions）先包装为单版本
  if (!m.versions) {
    m.versions = [{ ts: m.ts, thinking: m.thinking || '', thinkDone: !!m.thinkDone, contentStarted: !!m.contentStarted, tools: m.tools || [], content: m.content || '', state: m.state || 'done', followups: m.followups || [], model: m.model, startedAt: m.startedAt || m.ts }];
    ['ts', 'thinking', 'thinkDone', 'contentStarted', 'tools', 'content', 'state', 'followups', 'model', 'startedAt'].forEach(k => delete m[k]);
  }
  m.versions.push(newVersion(conv.model));
  m.cur = m.versions.length - 1;
  conv.status = 'running';
  store.save();
  renderMsgCol();
  const rule = matchScript(userText);
  runStream(conv, m, rule.script);
}

/* ============================================================
   列表页通用组件：搜索框 / 表头排序 / 分页
   ============================================================ */
const ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

function toolbarSearchHtml(id, ph) {
  return `<span class="toolbar-search">${ICON_SEARCH}<input type="text" id="${id}" placeholder="${esc(ph)}" autocomplete="off"></span>`;
}
function cmpStr(a, b) { return String(a ?? '').localeCompare(String(b ?? ''), 'zh-Hans-CN'); }
/* 表头排序：getters 为 列key → 取值函数 */
function applySort(list, ls, getters) {
  const g = getters[ls.sortKey];
  if (!g) return list;
  return [...list].sort((x, y) => {
    const vx = g(x), vy = g(y);
    const r = (typeof vx === 'number' && typeof vy === 'number') ? vx - vy : cmpStr(vx, vy);
    return ls.sortDir === 'asc' ? r : -r;
  });
}
/* 卡片页排序预设：created_desc / created_asc / name_asc */
function sortByPreset(list, preset) {
  const arr = [...list];
  if (preset === 'name_asc') return arr.sort((a, b) => cmpStr(a.name, b.name));
  if (preset === 'created_asc') return arr.sort((a, b) => cmpStr(a.created, b.created));
  return arr.sort((a, b) => cmpStr(b.created, a.created));
}
function sortTh(label, key, ls, defDir) {
  const on = ls.sortKey === key;
  return `<th class="th-sort${on ? ' sorted' : ''}" data-sort="${key}" data-def="${defDir || 'asc'}">${label}<span class="sort-arrow">${on ? (ls.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span></th>`;
}
function bindSortTh(root, ls, rerender) {
  $$('.th-sort', root).forEach(th => th.onclick = () => {
    const k = th.dataset.sort;
    if (ls.sortKey === k) ls.sortDir = ls.sortDir === 'asc' ? 'desc' : 'asc';
    else { ls.sortKey = k; ls.sortDir = th.dataset.def || 'asc'; }
    ls.page = 1;
    rerender();
  });
}
function paginate(list, ls) {
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / ls.pageSize));
  if (ls.page > pages) ls.page = pages;
  const start = (ls.page - 1) * ls.pageSize;
  return { rows: list.slice(start, start + ls.pageSize), total, pages };
}
/* 页码序列：≤7 页全展示，否则首尾 + 当前页邻位 + 省略号 */
function pageNums(cur, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, 2, cur - 1, cur, cur + 1, pages - 1, pages]);
  const arr = [...set].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = []; let prev = 0;
  for (const n of arr) { if (n - prev > 1) out.push('…'); out.push(n); prev = n; }
  return out;
}
function pagerHtml(ls, total, pages, standalone) {
  return `<div class="pager${standalone ? ' list-pager' : ''}">
    <span class="pager-total">共 ${total} 条</span>
    <button class="pager-btn pg-prev" ${ls.page <= 1 ? 'disabled' : ''} title="上一页">‹</button>
    ${pageNums(ls.page, pages).map(n => n === '…' ? '<span class="pager-ellipsis">…</span>' : `<button class="pager-btn pg-num${n === ls.page ? ' cur' : ''}" data-p="${n}">${n}</button>`).join('')}
    <button class="pager-btn pg-next" ${ls.page >= pages ? 'disabled' : ''} title="下一页">›</button>
  </div>`;
}
function bindPager(root, ls, rerender) {
  $$('.pg-num', root).forEach(b => b.onclick = () => { ls.page = +b.dataset.p; rerender(); });
  const prev = $('.pg-prev', root), next = $('.pg-next', root);
  if (prev) prev.onclick = () => { if (ls.page > 1) { ls.page--; rerender(); } };
  if (next) next.onclick = () => { ls.page++; rerender(); };
}

/* ============================================================
   智能体中心
   ============================================================ */
function renderAgents() {
  const view = $('#view-agents');
  const agents = store.data.agents;
  // 已删除的智能体软删除于数据库，界面任何 Tab 均不呈现（PRD 3.7 规则 7）
  if (!['all', 'user', 'system'].includes(state.agentTab)) state.agentTab = 'all';
  const tab = state.agentTab;
  const counts = {
    all: agents.filter(a => !a.deleted).length,
    user: agents.filter(a => a.level === 'user' && !a.deleted).length,
    system: agents.filter(a => a.level === 'system' && !a.deleted).length,
  };
  const ls = state.agentsList;
  view.innerHTML = `<div class="center-page">
    <div class="page-head">
      <div class="page-title">智能体中心</div>
      <div class="spacer"></div>
      <button class="btn btn-primary btn-star" id="new-agent">＋ 新建智能体</button>
    </div>
    <div class="page-sub">智能体 = 能力模板（岗位说明书）；数字员工 = 从智能体派生的可对话实例。能力剖面修改后下一请求即生效。</div>
    <div class="tabs">
      ${[['all', '全部'], ['user', '用户级'], ['system', '系统级']].map(([k, label]) =>
        `<div class="tab ${tab === k ? 'active' : ''}" data-tab="${k}">${label}<span class="tab-count" data-count="${counts[k]}">${counts[k]}</span></div>`).join('')}
    </div>
    <div class="table-toolbar list-toolbar">
      ${toolbarSearchHtml('aq', '搜索名称 / 人设')}
      <select class="toolbar-filter" id="a-sort">
        <option value="created_desc">创建时间 · 新到旧</option>
        <option value="created_asc">创建时间 · 旧到新</option>
        <option value="name_asc">名称 · A 到 Z</option>
      </select>
    </div>
    <div id="agent-grid"></div>
    <div id="agent-pager"></div>
  </div>`;
  $('#new-agent').onclick = () => { if (checkSelf()) openAgentModal(null); };
  $$('.tab', view).forEach(t => t.onclick = () => { state.agentTab = t.dataset.tab; state.agentsList.page = 1; renderAgents(); });
  /* 工具栏只绑一次：输入/变更只重绘卡片区与分页条，搜索框不丢焦点 */
  const q = $('#aq'); q.value = ls.q;
  q.oninput = () => { ls.q = q.value.trim(); ls.page = 1; renderAgentCards(); };
  const sort = $('#a-sort'); sort.value = ls.sort;
  sort.onchange = () => { ls.sort = sort.value; ls.page = 1; renderAgentCards(); };
  renderAgentCards();
}

function renderAgentCards() {
  const ls = state.agentsList;
  const tab = state.agentTab;
  let list = store.data.agents.filter(a => !a.deleted);
  if (tab === 'user') list = list.filter(a => a.level === 'user');
  if (tab === 'system') list = list.filter(a => a.level === 'system');
  if (ls.q) list = list.filter(a => a.name.includes(ls.q) || (a.persona || '').includes(ls.q));
  list = sortByPreset(list, ls.sort);
  const { rows, total, pages } = paginate(list, ls);
  const grid = $('#agent-grid');
  grid.innerHTML = '';
  if (!rows.length) {
    grid.innerHTML = `<div class="empty-state"><div class="e-icon">🧬</div><div class="e-txt">${ls.q ? '无匹配智能体，请调整搜索条件' : '暂无智能体，点击右上角新建'}</div></div>`;
  } else {
    const cg = document.createElement('div'); cg.className = 'card-grid';
    rows.forEach(a => {
      const empN = store.data.employees.filter(e => e.agentId === a.id).length;
      const card = document.createElement('div');
      card.className = 'agent-card';
      const isSys = a.level === 'system';
      card.innerHTML = `
        <div class="agent-card-top">
          <div class="agent-card-name">${esc(a.name)}</div>
          ${isSys ? '<span class="badge badge-sys">系统</span>' : ''}
        </div>
        <div class="agent-card-time">创建于 ${esc(a.created)}</div>
        <div class="agent-card-persona">${esc(a.persona)}</div>
        <div class="agent-card-stats">
          <span>员工 <b data-count="${empN}">${empN}</b></span><span>工具 <b data-count="${(a.tools || []).length}">${(a.tools || []).length}</b></span>
          <span>知识集 · 不绑定</span>
          <span>审批 · ${approvalLabel(a.approval)}</span>
          <span>模型 · ${esc(a.model || '未配置')}</span>
        </div>
        <div class="agent-card-ops">
          ${isSys
            ? '<button class="btn btn-sm act-view">查看配置</button><button class="btn btn-sm act-derive">派生员工</button>'
            : '<button class="btn btn-sm act-edit">编 辑</button><button class="btn btn-sm act-derive">派生员工</button><button class="btn btn-sm act-del" style="color:var(--err)">删 除</button>'}
        </div>`;
      const viewBtn = $('.act-view', card); if (viewBtn) viewBtn.onclick = () => openAgentViewModal(a);
      const editBtn = $('.act-edit', card); if (editBtn) editBtn.onclick = () => { if (checkSelf()) openAgentModal(a); };
      const deriveBtn = $('.act-derive', card); if (deriveBtn) deriveBtn.onclick = () => { if (checkSelf()) openNewEmployeeModal(a.id); };
      const delBtn = $('.act-del', card); if (delBtn) delBtn.onclick = () => {
        if (!checkSelf()) return;
        if (empN > 0) return toast(`该智能体被 ${empN} 个员工引用，请先删除或转移相关员工`, 'error');
        confirmModal({
          title: '删除智能体',
          text: `智能体「${esc(a.name)}」删除后不可恢复，且不再可被引用。是否继续？`,
          danger: true, okText: '删除',
          onOk: () => { a.deleted = true; store.save(); toast('已删除', 'success'); renderAgents(); },
        });
      };
      cg.appendChild(card);
    });
    grid.appendChild(cg);
    if (window.Motion) Motion.reveal(cg.children, { step: 40 });
  }
  const pager = $('#agent-pager');
  pager.innerHTML = pagerHtml(ls, total, pages, true);
  bindPager(pager, ls, renderAgentCards);
}

/* ---------- 更多操作菜单（通用组件）：低频操作收进 ⋯，保持卡片干净 ---------- */
let _opsMenuEl = null;
function _opsMenuDocHandler(e) {
  if (!_opsMenuEl) return;
  if (_opsMenuEl.contains(e.target)) return;
  /* 点在触发按钮上交给 click 做 toggle，这里不关 */
  if (_opsMenuEl._anchor && _opsMenuEl._anchor.contains(e.target)) return;
  closeOpsMenu();
}
function closeOpsMenu() {
  if (_opsMenuEl) { _opsMenuEl.remove(); _opsMenuEl = null; }
  document.removeEventListener('mousedown', _opsMenuDocHandler, true);
  window.removeEventListener('resize', closeOpsMenu);
  window.removeEventListener('scroll', closeOpsMenu, true);
}
/* items: [{ label, danger?, onClick }]；danger 项自动红色并与其上项加分隔线 */
function openOpsMenu(anchor, items) {
  if (_opsMenuEl && _opsMenuEl._anchor === anchor) { closeOpsMenu(); return; }
  closeOpsMenu();
  const menu = document.createElement('div');
  menu.className = 'ops-menu';
  menu._anchor = anchor;
  items.forEach((it, i) => {
    if (it.danger && i > 0) {
      const sep = document.createElement('div');
      sep.className = 'ops-menu-sep';
      menu.appendChild(sep);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ops-menu-item' + (it.danger ? ' danger' : '');
    btn.textContent = it.label;
    btn.onclick = () => { closeOpsMenu(); it.onClick(); };
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  const r = anchor.getBoundingClientRect();
  /* 右对齐触发按钮并夹进视口；下方空间不足时向上展开 */
  menu.style.left = Math.max(8, Math.min(r.right - menu.offsetWidth, window.innerWidth - menu.offsetWidth - 8)) + 'px';
  const below = r.bottom + 6 + menu.offsetHeight <= window.innerHeight - 8;
  menu.style.top = (below ? r.bottom + 6 : r.top - menu.offsetHeight - 6) + 'px';
  _opsMenuEl = menu;
  document.addEventListener('mousedown', _opsMenuDocHandler, true);
  window.addEventListener('resize', closeOpsMenu);
  window.addEventListener('scroll', closeOpsMenu, true);
}

/* ---------- 可搜索单选选择器（通用组件，PRD 3.7 规则 4） ---------- */
function searchSelectHtml(id, options, value, placeholder) {
  const cur = options.find(o => o.value === value);
  return `<div class="sselect" id="${id}-wrap">
    <input type="hidden" id="${id}" value="${esc(value || '')}">
    <button type="button" class="sselect-btn"><span class="sselect-val${cur ? '' : ' placeholder'}">${cur ? esc(cur.label) : esc(placeholder || '请选择')}</span><span class="sselect-arrow">▾</span></button>
    <div class="sselect-panel hidden">
      <input type="text" class="sselect-search" data-nosnap data-noenter placeholder="搜索…">
      <div class="sselect-list"></div>
    </div>
  </div>`;
}

function bindSearchSelect(wrap, options) {
  const btn = $('.sselect-btn', wrap), panel = $('.sselect-panel', wrap),
    search = $('.sselect-search', wrap), list = $('.sselect-list', wrap),
    hidden = $('input[type="hidden"]', wrap), valEl = $('.sselect-val', wrap);
  const onDoc = e => { if (!wrap.contains(e.target)) closePanel(); };
  function closePanel() { panel.classList.add('hidden'); document.removeEventListener('mousedown', onDoc, true); }
  function renderList() {
    const q = search.value.trim().toLowerCase();
    const opts = options
      .filter(o => !q || (o.label + ' ' + (o.sub || '')).toLowerCase().includes(q))
      .sort((x, y) => (y.value === hidden.value) - (x.value === hidden.value)); // 当前选中置顶
    list.innerHTML = opts.length ? opts.map(o => `
      <div class="sselect-opt${o.value === hidden.value ? ' active' : ''}" data-v="${esc(o.value)}">
        <div class="sselect-opt-main">${esc(o.label)}${o.badge || ''}</div>
        ${o.sub ? `<div class="sselect-opt-sub">${esc(o.sub)}</div>` : ''}
      </div>`).join('') : '<div class="sselect-empty">无匹配项</div>';
    $$('.sselect-opt', list).forEach(el => el.onclick = () => {
      hidden.value = el.dataset.v;
      const o = options.find(x => x.value === el.dataset.v);
      valEl.textContent = o ? o.label : '';
      valEl.classList.remove('placeholder');
      wrap.classList.remove('err');
      closePanel();
    });
  }
  btn.onclick = () => {
    if (panel.classList.contains('hidden')) {
      panel.classList.remove('hidden'); search.value = ''; renderList(); search.focus();
      document.addEventListener('mousedown', onDoc, true);
    } else closePanel();
  };
  search.oninput = renderList;
  return { close: closePanel };
}

/* 默认模型选项：取自启用端点，附端点信息；当前值已失效时保留展示并标记 */
function modelSelectOptions(current) {
  const eps = store.data.endpoints.filter(e => e.status === 'enabled');
  const byModel = {};
  eps.forEach(e => { (byModel[e.model] = byModel[e.model] || []).push(e); });
  const opts = Object.keys(byModel).map(m => {
    const list = byModel[m];
    return { value: m, label: m, sub: list.length > 1 ? `${list.length} 个启用端点 · 按优先级路由` : `端点 · ${list[0].name}`, badge: '<span class="badge badge-safe">启用</span>' };
  });
  if (current && !opts.some(o => o.value === current)) {
    opts.unshift({ value: current, label: current, sub: '原端点已停用，保存前请重新选择', badge: '<span class="badge badge-warn">已停用</span>' });
  }
  return opts;
}

/* ---------- 工具选择器（搜索 / 仅看已选，平铺无分级，PRD 3.7 规则 6） ---------- */
function toolPickerHtml(selected) {
  return `<div class="tool-picker-bar">
      <input type="text" class="tool-search" data-nosnap data-noenter placeholder="搜索工具名称或描述">
      <label class="tool-only"><input type="checkbox" class="tool-only-check" data-nosnap> 仅看已选</label>
    </div>
    <div class="tool-picker-groups">
      ${TOOL_DEFS.map(t => `
        <label class="tool-check ${t.disabled ? 'disabled' : ''}" data-key="${esc((t.name + ' ' + t.desc).toLowerCase())}">
          <input type="checkbox" value="${t.name}" ${selected.includes(t.name) ? 'checked' : ''} ${t.disabled ? 'disabled' : ''}>
          <span><span class="t-name">${t.name}</span>
          <div class="t-desc">${t.desc}${t.disabled ? ' · ' + t.disabledReason : ''}</div></span>
        </label>`).join('')}
    </div>
    <div class="tool-empty hidden">无匹配工具</div>`;
}

function bindToolPicker(picker) {
  const search = $('.tool-search', picker), only = $('.tool-only-check', picker);
  const rows = $$('.tool-check', picker), empty = $('.tool-empty', picker);
  function apply() {
    const q = search.value.trim().toLowerCase();
    let visible = 0;
    rows.forEach(r => {
      const show = (!q || r.dataset.key.includes(q)) && (!only.checked || $('input', r).checked);
      r.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    empty.classList.toggle('hidden', visible > 0);
  }
  search.oninput = apply;
  only.onchange = apply;
  $$('.tool-check input', picker).forEach(cb => cb.addEventListener('change', () => { if (only.checked) apply(); }));
}

function agentFormHtml(a) {
  const isEdit = !!a;
  const modelOpts = modelSelectOptions(a ? a.model : null);
  const curModel = a ? a.model : (modelOpts.find(o => !o.badge.includes('已停用')) || {}).value || '';
  return `
    <div class="form-section">
      <div class="form-section-title">基础信息</div>
      <div class="field"><span class="field-label">名称 *</span><input type="text" id="af-name" value="${esc(a ? a.name : '')}" placeholder="如：运营巡检官"></div>
      <div class="field"><span class="field-label">人设（系统提示）*</span>
        <textarea id="af-persona" placeholder="你是…，负责…">${esc(a ? a.persona : '')}</textarea>
        <div class="field-bar">
          <button type="button" class="btn btn-sm" id="af-import-md">导入 MD</button>
          <input type="file" id="af-md-file" accept=".md,.markdown,.txt" class="hidden" data-nosnap>
          <span class="field-hint">支持从本地 .md 文件导入人设，导入后仍可编辑</span>
        </div>
      </div>
      <div class="field"><span class="field-label">默认模型 *</span>
        ${searchSelectHtml('af-model', modelOpts, curModel, '请选择模型')}
        <div class="field-hint">取自启用端点，可按模型名或端点搜索</div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-head${isEdit ? ' open' : ''}" id="af-adv-head">
        <span class="form-section-title">高级设置</span>
        <span class="form-section-sub">不配则使用全局默认</span>
        <span class="form-section-toggle"><span class="fst-text"></span><span class="fst-arrow">▾</span></span>
      </div>
      <div class="form-section-body${isEdit ? '' : ' hidden'}" id="af-adv-body">
        <div class="field"><span class="field-label">审批级别</span><select id="af-approval">
          <option value="auto" ${a && a.approval === 'auto' ? 'selected' : ''}>自动审批（工具调用直接执行）</option>
          <option value="ask" ${a && a.approval === 'ask' ? 'selected' : ''}>每次询问</option></select></div>
        <div style="display:flex;gap:12px">
          <div class="field" style="flex:1"><span class="field-label">轮次上限</span><input type="number" id="af-rounds" min="1" placeholder="空 = 全局默认" value="${a && a.rounds ? a.rounds : ''}"></div>
          <div class="field" style="flex:1"><span class="field-label">上下文大小</span><select id="af-context">
            ${[100, 200, 500].map(k => `<option value="${k}" ${(a ? a.context : 200) === k ? 'selected' : ''}>${k}K</option>`).join('')}</select></div>
        </div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section-title">能力授权</div>
      <div class="field"><span class="field-label">知识库</span>
        <select id="af-kb" disabled><option>暂不绑定</option></select>
      </div>
      <div class="field" style="margin-bottom:0"><span class="field-label">工具授权（默认不授权，按需勾选）</span>
        <div class="tool-picker" id="af-tools">${toolPickerHtml(a ? (a.tools || []) : [])}</div>
      </div>
    </div>`;
}

function openAgentModal(a) {
  const wrap = document.createElement('div');
  wrap.innerHTML = agentFormHtml(a);
  const foot = document.createElement('div');
  const cancel = document.createElement('button'); cancel.className = 'btn'; cancel.textContent = '取消';
  const ok = document.createElement('button'); ok.className = 'btn btn-primary'; ok.textContent = a ? '保存' : '新建';
  foot.append(cancel, ok);
  const { close, mask } = openModal({ title: a ? '编辑智能体' : '新建智能体', body: wrap, foot, wide: true, form: true, req: 'agent-form' });
  cancel.onclick = close;

  // 高级设置折叠 / 展开
  $('#af-adv-head', wrap).onclick = () => {
    $('#af-adv-head', wrap).classList.toggle('open');
    $('#af-adv-body', wrap).classList.toggle('hidden');
  };
  // 可搜索模型选择器
  const modelOpts = modelSelectOptions(a ? a.model : null);
  bindSearchSelect($('#af-model-wrap', wrap), modelOpts);
  // 工具选择器
  bindToolPicker($('#af-tools', wrap));
  // 人设导入 MD：textarea 为唯一编辑区，导入仅为填充手段
  $('#af-import-md', wrap).onclick = () => $('#af-md-file', wrap).click();
  $('#af-md-file', wrap).onchange = e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const fill = () => { $('#af-persona', wrap).value = String(reader.result || ''); toast('已导入，可继续编辑', 'success'); };
      if ($('#af-persona', wrap).value.trim()) {
        confirmModal({
          title: '导入将覆盖当前内容',
          text: `人设框中已有内容，导入「${esc(f.name)}」将覆盖当前内容。是否继续？`,
          danger: true, okText: '覆盖导入', onOk: fill,
        });
      } else fill();
    };
    reader.readAsText(f);
  };

  ok.onclick = () => {
    const name = $('#af-name', mask).value.trim();
    const persona = $('#af-persona', mask).value.trim();
    const model = $('#af-model', mask).value;
    let bad = false;
    [['af-name', name], ['af-persona', persona]].forEach(([id, v]) => {
      const el = $('#' + id, mask); el.classList.toggle('field-err', !v); if (!v) bad = true;
    });
    $('#af-model-wrap', mask).classList.toggle('err', !model); if (!model) bad = true;
    if (bad) return toast('请填写必填项（名称 / 人设 / 默认模型）', 'error');
    const tools = $$('#af-tools .tool-check input:checked', mask).map(i => i.value);
    const rounds = $('#af-rounds', mask).value ? parseInt($('#af-rounds', mask).value, 10) : null;
    const context = parseInt($('#af-context', mask).value, 10);
    const approval = $('#af-approval', mask).value;
    if (a) {
      Object.assign(a, { name, persona, model, approval, rounds, context, tools });
      toast('已保存，下一请求即生效', 'success');
    } else {
      store.data.agents.push({
        id: uid('ag'), name, persona, model, approval, rounds, context, tools,
        level: 'user', created: fmtTime(), deleted: false,
      });
      toast('已新建智能体', 'success');
    }
    store.save(); close(); renderAgents();
  };
}

function openAgentViewModal(a) {
  const empN = store.data.employees.filter(e => e.agentId === a.id).length;
  const rows = [
    ['名称', a.name + '（系统级）'], ['人设', a.persona], ['默认模型', a.model],
    ['审批级别', approvalLabel(a.approval)],
    ['轮次上限', roundsLabel(a.rounds)], ['上下文大小', contextLabel(a.context)],
    ['工具授权', (a.tools || []).join('、') || '未授权'], ['派生员工数', empN + ' 位'], ['创建时间', a.created],
  ];
  openModal({
    title: '查看智能体配置（系统级只读）',
    body: `<table class="data-table">${rows.map(([k, v]) => `<tr><td style="width:110px;color:var(--text-2)">${k}</td><td>${esc(v)}</td></tr>`).join('')}</table>
      <div class="field-hint" style="margin-top:10px">系统级智能体为初始化预置，仅可查看与派生员工，不可编辑或删除。</div>`,
    foot: null, wide: true, req: 'agents',
  });
}

/* ============================================================
   数字员工：新建 / 移动 / 高级配置
   ============================================================ */
function openNewEmployeeModal(presetAgentId, presetFolderId) {
  const agents = store.data.agents.filter(a => !a.deleted);
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="field"><span class="field-label">名称</span><input type="text" id="ne-name" value="新同事（AI）·${store.data.empSeq}"><div class="field-hint">默认按序号自动编号，可修改</div></div>
    <div class="field"><span class="field-label">引用智能体 *（创建后不可修改）</span>
      <select id="ne-agent">${agents.map(a => `<option value="${a.id}" ${presetAgentId === a.id ? 'selected' : ''}>${esc(a.name)}${a.level === 'system' ? '（系统）' : ''}</option>`).join('')}</select>
      <div class="field-hint">员工默认继承智能体的能力剖面，之后可在高级配置中按需覆盖</div>
    </div>
    <div class="field"><span class="field-label">所在文件夹</span>
      <select id="ne-folder">
        <option value="">未分组</option>
        ${store.data.folders.map(f => `<option value="${f.id}" ${presetFolderId === f.id ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}
      </select>
      <div class="field-hint">默认落入当前查看的分组，之后可用「移动」调整</div>
    </div>`;
  const foot = document.createElement('div');
  const cancel = document.createElement('button'); cancel.className = 'btn'; cancel.textContent = '取消';
  const ok = document.createElement('button'); ok.className = 'btn btn-primary'; ok.textContent = '新建';
  foot.append(cancel, ok);
  const { close, mask } = openModal({ title: '新建数字员工', body: wrap, foot, form: true, req: 'roster' });
  cancel.onclick = close;
  ok.onclick = () => {
    const name = $('#ne-name', mask).value.trim();
    const agentId = $('#ne-agent', mask).value;
    const folderId = $('#ne-folder', mask).value || null;
    if (!name) return toast('请填写名称', 'error');
    if (!agentId) return toast('请选择引用智能体', 'error');
    const emp = { id: uid('em'), name, agentId, folderId, overrides: {}, created: fmtTime() };
    store.data.employees.push(emp);
    store.data.empSeq++;
    store.save(); close();
    const folder = folderId && store.data.folders.find(f => f.id === folderId);
    toast(folder ? `已加入「${folder.name}」` : '已加入名册', 'success');
    state.activeEmpId = emp.id;
    renderChat();
  };
}

function openNewFolderModal() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="field"><span class="field-label">文件夹名称</span><input type="text" id="nf-name" placeholder="如：运营组"></div>`;
  const foot = document.createElement('div');
  const cancel = document.createElement('button'); cancel.className = 'btn'; cancel.textContent = '取消';
  const ok = document.createElement('button'); ok.className = 'btn btn-primary'; ok.textContent = '新建';
  foot.append(cancel, ok);
  const { close, mask } = openModal({ title: '新建文件夹', body: wrap, foot, form: true, req: 'roster' });
  cancel.onclick = close;
  ok.onclick = () => {
    const name = $('#nf-name', mask).value.trim();
    if (!name) return toast('请填写文件夹名称', 'error');
    store.data.folders.push({ id: uid('f'), name });
    store.save(); close(); toast('已新建文件夹', 'success'); renderChatMain();
  };
}

function openMoveEmpModal(empId) {
  const emp = store.data.employees.find(e => e.id === empId);
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="field"><span class="field-label">移动到文件夹</span>
    <select id="mv-folder">
      <option value="">未分组</option>
      ${store.data.folders.map(f => `<option value="${f.id}" ${emp.folderId === f.id ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}
    </select></div>`;
  const foot = document.createElement('div');
  const cancel = document.createElement('button'); cancel.className = 'btn'; cancel.textContent = '取消';
  const ok = document.createElement('button'); ok.className = 'btn btn-primary'; ok.textContent = '移动';
  foot.append(cancel, ok);
  const { close, mask } = openModal({ title: `移动「${emp.name}」`, body: wrap, foot, form: true, req: 'roster' });
  cancel.onclick = close;
  ok.onclick = () => {
    emp.folderId = $('#mv-folder', mask).value || null;
    store.save(); close(); toast('已移动，文件夹计数已更新', 'success'); renderChatMain();
  };
}

/* ---------- 高级配置抽屉 ---------- */
function openEmpConfigDrawer(empId) {
  const emp = store.data.employees.find(e => e.id === empId);
  const { eff, agent } = effectiveEmp(emp);
  const reqKey = ReqPanel.push('emp-config');
  const mask = document.createElement('div');
  mask.className = 'drawer-mask';
  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  document.body.append(mask, drawer);
  const closeAll = () => { ReqPanel.pop(reqKey); mask.remove(); drawer.remove(); };
  mask.onclick = closeAll;

  const fields = [
    { key: 'persona', label: '人设（系统提示）', type: 'textarea', fmt: v => v },
    { key: 'knowledge', label: '知识库', type: 'kb' },
    { key: 'model', label: '默认模型', type: 'model', fmt: v => v },
    { key: 'approval', label: '审批级别', type: 'approval', fmt: approvalLabel },
    { key: 'rounds', label: '轮次上限', type: 'number', fmt: roundsLabel },
    { key: 'context', label: '上下文大小', type: 'context', fmt: contextLabel },
    { key: 'tools', label: '工具与技能授权', type: 'tools', fmt: v => (v || []).join('、') || '未授权' },
  ];

  drawer.innerHTML = `
    <div class="drawer-head">
      <div><div class="modal-title">高级配置 · ${esc(emp.name)}</div>
      <div style="font-size:11.5px;color:var(--text-3);margin-top:2px">继承-覆盖模式：跟随 = 与智能体联动；自定义 = 本员工独立值</div></div>
      <button class="modal-close">×</button>
    </div>
    <div class="drawer-body">
      <div class="cfg-row">
        <div class="cfg-row-head"><span class="cfg-label">引用智能体</span><span class="cfg-mode"><span class="cfg-mode-tag cleared">创建时指定 · 不可修改</span></span></div>
        <div class="cfg-immutable">🧬 ${esc(agent ? agent.name : '已删除')}（${agent && agent.level === 'system' ? '系统级' : '用户级'}）</div>
      </div>
      <div id="cfg-fields"></div>
    </div>
    <div class="drawer-foot">
      <button class="btn btn-danger" id="cfg-reset">一键还原为智能体初始状态</button>
      <button class="btn btn-primary" id="cfg-done">完成</button>
    </div>`;
  $('.modal-close', drawer).onclick = closeAll;
  $('#cfg-done', drawer).onclick = () => { closeAll(); renderChat(); };
  const box = $('#cfg-fields', drawer);
  const bodyEl = $('.drawer-body', drawer);
  // 原地重绘字段区，保留滚动位置（避免关闭重开抽屉导致回到顶部）
  const renderFields = () => {
    const st = bodyEl.scrollTop;
    box.innerHTML = '';
    fields.forEach(f => box.appendChild(cfgRowNode(emp, agent, f, renderFields)));
    bodyEl.scrollTop = st;
  };

  $('#cfg-reset', drawer).onclick = () => confirmModal({
    title: '一键还原',
    text: '将放弃全部自定义配置，恢复为「跟随智能体」。是否继续？',
    danger: true, okText: '还原',
    onOk: () => { emp.overrides = {}; store.save(); renderFields(); toast('已还原为智能体初始状态', 'success'); },
  });

  renderFields();
}

function cfgRowNode(emp, agent, f, refresh) {
  const row = document.createElement('div');
  row.className = 'cfg-row';
  // 知识库本期占位行：跟随智能体 · 暂不绑定，不提供自定义（PRD 3.8-5 / AC-52）
  if (f.type === 'kb') {
    row.innerHTML = `<div class="cfg-row-head"><span class="cfg-label">${f.label}</span><span class="cfg-mode"><span class="cfg-mode-tag">跟随智能体</span></span></div>`;
    const kbBody = document.createElement('div');
    kbBody.innerHTML = `<div class="cfg-follow-val"><span class="fv-k">当前值</span>暂不绑定</div>`;
    row.appendChild(kbBody);
    return row;
  }
  const hasOverride = f.key in emp.overrides;
  const val = hasOverride ? emp.overrides[f.key] : (agent ? agent[f.key] : undefined);
  const modeTag = !hasOverride ? '<span class="cfg-mode-tag">跟随智能体</span>'
    : '<span class="cfg-mode-tag custom">自定义</span>';
  row.innerHTML = `<div class="cfg-row-head"><span class="cfg-label">${f.label}</span><span class="cfg-mode">${modeTag}</span></div>`;

  const body = document.createElement('div');
  if (!hasOverride) {
    body.innerHTML = `<div class="cfg-follow-val"><span class="fv-k">当前值</span>${esc(f.fmt(val))}</div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="btn btn-sm act-custom">自定义</button>
      </div>`;
    $('.act-custom', body).onclick = () => { emp.overrides[f.key] = cloneVal(val); store.save(); refresh(); };
  } else {
    const edit = document.createElement('div');
    edit.className = 'cfg-edit';
    edit.appendChild(cfgEditor(emp, f, val, refresh));
    const bar = document.createElement('div');
    bar.style.cssText = 'margin-top:8px;display:flex;gap:8px';
    bar.innerHTML = `<button class="btn btn-sm act-follow">恢复跟随</button>`;
    $('.act-follow', bar).onclick = () => { delete emp.overrides[f.key]; store.save(); refresh(); };
    body.append(edit, bar);
  }
  row.appendChild(body);
  return row;
}

function cloneVal(v) { return Array.isArray(v) ? [...v] : v; }

function cfgEditor(emp, f, val, refresh) {
  const wrap = document.createElement('div');
  const save = v => { emp.overrides[f.key] = v; store.save(); };
  if (f.type === 'textarea') {
    wrap.innerHTML = `<textarea>${esc(val || '')}</textarea>`;
    $('textarea', wrap).onchange = e => { save(e.target.value.trim()); toast('已保存自定义人设', 'success'); };
  } else if (f.type === 'model') {
    wrap.innerHTML = `<select>${enabledModels().map(m => `<option ${m === val ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select>`;
    $('select', wrap).onchange = e => { save(e.target.value); toast('已保存', 'success'); };
  } else if (f.type === 'approval') {
    wrap.innerHTML = `<select>
      <option value="auto" ${val === 'auto' ? 'selected' : ''}>自动审批（工具调用直接执行）</option>
      <option value="ask" ${val === 'ask' ? 'selected' : ''}>每次询问</option></select>`;
    $('select', wrap).onchange = e => { save(e.target.value); toast('已保存', 'success'); };
  } else if (f.type === 'number') {
    wrap.innerHTML = `<input type="number" min="1" placeholder="空 = 全局默认" value="${val ?? ''}">`;
    $('input', wrap).onchange = e => { save(e.target.value ? parseInt(e.target.value, 10) : null); toast('已保存', 'success'); };
  } else if (f.type === 'context') {
    wrap.innerHTML = `<select>${[4, 100, 200, 500].map(k => `<option value="${k}" ${k === (val || 200) ? 'selected' : ''}>${k}K</option>`).join('')}</select>
      <div class="field-hint">对话的上下文用量上限取该值</div>`;
    $('select', wrap).onchange = e => { save(parseInt(e.target.value, 10)); toast('已保存', 'success'); };
  } else if (f.type === 'tools') {
    const cur = val || [];
    wrap.innerHTML = TOOL_DEFS.map(t => `
      <label class="tool-check ${t.disabled ? 'disabled' : ''}">
        <input type="checkbox" value="${t.name}" ${cur.includes(t.name) ? 'checked' : ''} ${t.disabled ? 'disabled' : ''}>
        <span><span class="t-name">${t.name}</span>
        <div class="t-desc">${t.desc}${t.disabled ? ' · ' + t.disabledReason : ''}</div></span>
      </label>`).join('');
    $$('input[type=checkbox]', wrap).forEach(cb => cb.onchange = () => {
      save($$('input[type=checkbox]:checked', wrap).map(i => i.value));
      toast('已更新工具授权', 'success');
    });
  }
  return wrap;
}

/* ============================================================
   模型中心
   ============================================================ */
function renderModels() {
  const view = $('#view-models');
  const ls = state.modelsList;
  view.innerHTML = `<div class="center-page">
    <div class="page-head">
      <div class="page-title">模型中心</div>
      <div class="spacer"></div>
      <button class="btn btn-primary btn-star" id="new-ep">＋ 新建端点</button>
    </div>
    <div class="page-sub">填入地址 + 密钥即可接入任意 OpenAI 兼容端点，保存即热生效，无需重启。模型选择器立即可选新模型。</div>
    <div class="data-card toolbar-card">
      <div class="table-toolbar">
        ${toolbarSearchHtml('mq', '搜索名称 / URL / 模型名')}
        <select class="toolbar-filter" id="m-status">
          <option value="ALL">全部状态</option>
          <option value="enabled">启用</option>
          <option value="disabled">停用</option>
        </select>
      </div>
    </div>
    <div class="data-card">
      <div id="models-table"></div>
      <div id="models-pager"></div>
    </div>
  </div>`;
  $('#new-ep').onclick = () => { if (checkSelf()) openEndpointModal(null); };
  /* 工具栏只绑一次：输入/变更只重绘表格区与分页条，搜索框不丢焦点 */
  const q = $('#mq'); q.value = ls.q;
  q.oninput = () => { ls.q = q.value.trim(); ls.page = 1; renderModelRows(); };
  const st = $('#m-status'); st.value = ls.status;
  st.onchange = () => { ls.status = st.value; ls.page = 1; renderModelRows(); };
  renderModelRows();
}

function renderModelRows() {
  const ls = state.modelsList;
  const kw = ls.q.toLowerCase();
  let list = store.data.endpoints.filter(e =>
    (!kw || (e.name + ' ' + e.url + ' ' + e.model).toLowerCase().includes(kw)) &&
    (ls.status === 'ALL' || e.status === ls.status));
  list = applySort(list, ls, { name: e => e.name, priority: e => e.priority, model: e => e.model });
  const { rows, total, pages } = paginate(list, ls);
  const wrap = $('#models-table');
  wrap.innerHTML = `<table class="data-table">
    <thead><tr>${sortTh('名称 / URL', 'name', ls)}${sortTh('用途 · 优先级', 'priority', ls, 'desc')}${sortTh('模型名', 'model', ls)}<th>Key</th><th>状态</th><th>操作</th></tr></thead>
    <tbody id="ep-tbody"></tbody>
  </table>`;
  bindSortTh(wrap, ls, renderModelRows);
  const tb = $('#ep-tbody', wrap);
  if (!rows.length) {
    tb.innerHTML = `<tr><td colspan="6"><div class="empty-state" style="padding:30px"><div class="e-txt">${store.data.endpoints.length ? '无匹配端点，请调整搜索或筛选条件' : '暂无端点，点击右上角新建'}</div></div></td></tr>`;
  }
  rows.forEach(ep => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="cell-main">${esc(ep.name)}</div><div class="cell-sub">${esc(ep.url)}</div><div class="test-result hidden"></div></td>
      <td>${esc(ep.usage)} <span class="badge badge-sys">P${ep.priority}</span></td>
      <td style="font-family:ui-monospace,Menlo,monospace;font-size:12px">${esc(ep.model)}</td>
      <td style="font-family:ui-monospace,Menlo,monospace;font-size:12px">${esc(ep.key.slice(0, 3))}***</td>
      <td><button class="switch ${ep.status === 'enabled' ? 'on' : ''}" title="${ep.status === 'enabled' ? '点击停用' : '点击启用'}"></button></td>
      <td><div class="cell-ops">
        <button class="btn btn-sm act-test">测 试</button>
        <button class="btn btn-sm act-edit">编 辑</button>
        <button class="btn btn-sm act-del" style="color:var(--err)">删 除</button>
      </div></td>`;
    $('.switch', tr).onclick = () => {
      if (!checkSelf()) return;
      ep.status = ep.status === 'enabled' ? 'disabled' : 'enabled';
      store.save();
      toast(ep.status === 'enabled' ? '端点已启用' : '端点已停用，绑定该模型的对话将报错', 'info');
      renderModelRows();
    };
    $('.act-edit', tr).onclick = () => { if (checkSelf()) openEndpointModal(ep); };
    $('.act-del', tr).onclick = () => {
      if (!checkSelf()) return;
      confirmModal({
        title: '删除端点',
        text: `删除端点「${esc(ep.name)}」（${esc(ep.model)}）后，绑定该模型的智能体与员工发起对话时将报错并提示更换模型。是否继续？`,
        danger: true, okText: '删除',
        onOk: () => {
          store.data.endpoints = store.data.endpoints.filter(e => e.id !== ep.id);
          store.save(); toast('已删除端点', 'success'); renderModelRows();
        },
      });
    };
    $('.act-test', tr).onclick = async () => {
      if (!checkSelf()) return;
      const res = $('.test-result', tr);
      res.className = 'test-result';
      res.textContent = '测试中…';
      const r = await testEndpoint(ep);
      res.classList.remove('hidden');
      if (r.ok) {
        res.classList.add('ok');
        res.textContent = `✓ 延迟 ${r.latency}ms · 端点可达 · 模型应答正常`;
      } else {
        res.classList.add('err');
        res.textContent = `✕ ${r.reason}`;
      }
    };
    tb.appendChild(tr);
  });
  const pager = $('#models-pager');
  pager.innerHTML = pagerHtml(ls, total, pages);
  bindPager(pager, ls, renderModelRows);
}

function testEndpoint(ep) {
  return new Promise(res => setTimeout(() => {
    if (/bad/i.test(ep.url)) return res({ ok: false, reason: '端点不可达' });
    if (/wrong/i.test(ep.key)) return res({ ok: false, reason: '鉴权失败，请检查密钥' });
    if (/legacy/i.test(ep.model)) return res({ ok: false, reason: '模型不存在，请检查模型名' });
    if (!/\/v\d+/.test(ep.url)) return res({ ok: false, reason: 'BaseUrl 需填 API 根（含 /v1）' });
    res({ ok: true, latency: 600 + Math.floor(Math.random() * 900) });
  }, 900 + Math.random() * 600));
}

function openEndpointModal(ep) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="field"><span class="field-label">名称 *</span><input type="text" id="ef-name" value="${esc(ep ? ep.name : '')}" placeholder="如：主端点 · DeepSeek"></div>
    <div class="field"><span class="field-label">BaseUrl *（填 API 根，含 /v1）</span><input type="text" id="ef-url" value="${esc(ep ? ep.url : '')}" placeholder="https://api.example.com/v1"></div>
    <div class="field"><span class="field-label">密钥 *</span><input type="text" id="ef-key" value="${esc(ep ? ep.key : '')}" placeholder="sk-..."><div class="field-hint">界面仅显示前 3 位 + 掩码（sk-***）</div></div>
    <div style="display:flex;gap:12px">
      <div class="field" style="flex:1"><span class="field-label">模型名 *</span><input type="text" id="ef-model" value="${esc(ep ? ep.model : '')}" placeholder="deepseek-v4-pro"></div>
      <div class="field" style="flex:1"><span class="field-label">用途</span><input type="text" id="ef-usage" value="${esc(ep ? ep.usage : '对话')}"></div>
      <div class="field" style="width:110px"><span class="field-label">优先级</span><input type="number" id="ef-priority" value="${ep ? ep.priority : 100}"></div>
    </div>
    <div class="field-hint">保存即热生效，无需重启；保存后模型选择器立即可选该模型。</div>`;
  const foot = document.createElement('div');
  const cancel = document.createElement('button'); cancel.className = 'btn'; cancel.textContent = '取消';
  const ok = document.createElement('button'); ok.className = 'btn btn-primary'; ok.textContent = ep ? '保存' : '新建';
  foot.append(cancel, ok);
  const { close, mask } = openModal({ title: ep ? '编辑端点' : '新建端点', body: wrap, foot, wide: true, form: true, req: 'models' });
  cancel.onclick = close;
  ok.onclick = () => {
    const name = $('#ef-name', mask).value.trim(), url = $('#ef-url', mask).value.trim(),
      key = $('#ef-key', mask).value.trim(), model = $('#ef-model', mask).value.trim(),
      usage = $('#ef-usage', mask).value.trim() || '对话',
      priority = parseInt($('#ef-priority', mask).value, 10) || 100;
    if (!name || !url || !key || !model) return toast('请填写必填项（名称 / BaseUrl / 密钥 / 模型名）', 'error');
    if (ep) Object.assign(ep, { name, url, key, model, usage, priority });
    else store.data.endpoints.push({ id: uid('ep'), name, url, key, model, usage, priority, status: 'enabled', created: fmtTime() });
    store.save(); close();
    toast(ep ? '已保存，热生效' : '端点已新建并热生效，模型选择器立即可选', 'success');
    renderModels();
  };
}

/* ============================================================
   用户中心
   ============================================================ */
function renderUsers() {
  const view = $('#view-users');
  if (state.user.role !== 'admin') { view.innerHTML = '<div class="placeholder-page"><div class="p-title">无权限</div></div>'; return; }
  const ls = state.usersList;
  view.innerHTML = `<div class="center-page">
    <div class="page-head">
      <div class="page-title">用户中心</div>
      <div class="spacer"></div>
      <button class="btn btn-primary btn-star" id="new-member">＋ 新建成员</button>
    </div>
    <div class="page-sub">成员管理：新建、停用、启用。停用即时生效——被停用成员的下一次操作即失效并踢回登录页。</div>
    <div class="data-card toolbar-card">
      <div class="table-toolbar">
        ${toolbarSearchHtml('uq', '搜索用户名 / 姓名')}
        <select class="toolbar-filter" id="u-role">
          <option value="ALL">全部角色</option>
          <option value="admin">管理员</option>
          <option value="member">成员</option>
        </select>
        <select class="toolbar-filter" id="u-status">
          <option value="ALL">全部状态</option>
          <option value="active">启用</option>
          <option value="disabled">已停用</option>
        </select>
      </div>
    </div>
    <div class="data-card">
      <div id="users-table"></div>
      <div id="users-pager"></div>
    </div>
  </div>`;
  $('#new-member').onclick = () => { if (checkSelf()) openMemberModal(); };
  /* 工具栏只绑一次：输入/变更只重绘表格区与分页条，搜索框不丢焦点、中文输入法不断字 */
  const q = $('#uq'); q.value = ls.q;
  q.oninput = () => { ls.q = q.value.trim(); ls.page = 1; renderUserRows(); };
  const role = $('#u-role'); role.value = ls.role;
  role.onchange = () => { ls.role = role.value; ls.page = 1; renderUserRows(); };
  const st = $('#u-status'); st.value = ls.status;
  st.onchange = () => { ls.status = st.value; ls.page = 1; renderUserRows(); };
  renderUserRows();
}

function renderUserRows() {
  const ls = state.usersList;
  const kw = ls.q.toLowerCase();
  let list = store.data.users.filter(u =>
    (!kw || u.username.toLowerCase().includes(kw) || u.name.includes(ls.q)) &&
    (ls.role === 'ALL' || u.role === ls.role) &&
    (ls.status === 'ALL' || u.status === ls.status));
  list = applySort(list, ls, { username: u => u.username, name: u => u.name });
  const { rows, total, pages } = paginate(list, ls);
  const wrap = $('#users-table');
  wrap.innerHTML = `<table class="data-table">
    <thead><tr>${sortTh('用户名', 'username', ls)}${sortTh('姓名', 'name', ls)}<th>角色</th><th>状态</th><th>操作</th></tr></thead>
    <tbody id="user-tbody"></tbody>
  </table>`;
  bindSortTh(wrap, ls, renderUserRows);
  const tb = $('#user-tbody', wrap);
  if (!rows.length) {
    tb.innerHTML = `<tr><td colspan="5"><div class="empty-state" style="padding:30px"><div class="e-txt">无匹配成员，请调整搜索或筛选条件</div></div></td></tr>`;
  }
  rows.forEach(u => {
    const isSelf = u.username === state.user.username;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="cell-main">${esc(u.username)}</span> ${u.builtin ? '<span class="badge badge-sys">预置</span>' : ''} ${isSelf ? '<span class="badge badge-role-admin">当前</span>' : ''}</td>
      <td>${esc(u.name)}</td>
      <td><span class="badge ${u.role === 'admin' ? 'badge-role-admin' : 'badge-role-member'}">${u.role === 'admin' ? '管理员' : '成员'}</span></td>
      <td>${u.status === 'active' ? '<span class="badge badge-safe">启用</span>' : '<span class="badge badge-off">已停用</span>'}</td>
      <td><div class="cell-ops">
        ${isSelf || u.builtin
          ? '<span style="font-size:12px;color:var(--text-3)">—</span>'
          : `<button class="btn btn-sm act-toggle">${u.status === 'active' ? '停 用' : '启 用'}</button>`}
      </div></td>`;
    const btn = $('.act-toggle', tr);
    if (btn) btn.onclick = () => {
      if (!checkSelf()) return;
      if (u.status === 'active') {
        confirmModal({
          title: '停用成员',
          text: `停用后，成员「${esc(u.name)}（${esc(u.username)}）」的下一次操作将立即失效并踢回登录页，且无法再登录。是否继续？`,
          danger: true, okText: '停用',
          onOk: () => { u.status = 'disabled'; store.save(); toast('已停用，该成员下一次操作将失效', 'success'); renderUserRows(); },
        });
      } else {
        confirmModal({
          title: '启用成员',
          text: `启用后，成员「${esc(u.name)}（${esc(u.username)}）」将恢复登录和操作权限。是否继续？`,
          danger: false, okText: '启用',
          onOk: () => { u.status = 'active'; store.save(); toast('已启用', 'success'); renderUserRows(); },
        });
      }
    };
    tb.appendChild(tr);
  });
  const pager = $('#users-pager');
  pager.innerHTML = pagerHtml(ls, total, pages);
  bindPager(pager, ls, renderUserRows);
}

function openMemberModal() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="field"><span class="field-label">用户名 *（登录用，唯一）</span><input type="text" id="mf-username"></div>
    <div class="field"><span class="field-label">姓名 *</span><input type="text" id="mf-name"></div>
    <div class="field"><span class="field-label">初始密码 *</span><input type="text" id="mf-password" value="123456"></div>
    <div class="field"><span class="field-label">角色</span><select id="mf-role"><option value="member">成员（member）</option><option value="admin">管理员（admin）</option></select></div>`;
  const foot = document.createElement('div');
  const cancel = document.createElement('button'); cancel.className = 'btn'; cancel.textContent = '取消';
  const ok = document.createElement('button'); ok.className = 'btn btn-primary'; ok.textContent = '新建';
  foot.append(cancel, ok);
  const { close, mask } = openModal({ title: '新建成员', body: wrap, foot, form: true, req: 'users' });
  cancel.onclick = close;
  ok.onclick = () => {
    const username = $('#mf-username', mask).value.trim(), name = $('#mf-name', mask).value.trim(),
      password = $('#mf-password', mask).value, role = $('#mf-role', mask).value;
    if (!username || !name || !password) return toast('请填写必填项', 'error');
    if (store.data.users.some(u => u.username === username)) return toast('用户名已存在', 'error');
    store.data.users.push({ username, name, password, role, status: 'active', builtin: false });
    store.save(); close(); toast('已新建成员', 'success'); renderUsers();
  };
}

/* ============================================================
   初始化
   ============================================================ */
store.load();
document.documentElement.dataset.theme = state.theme;
/* 需求澄清面板：渲染目录 + 绑定关闭按钮 */
ReqPanel.init();
$('#req-close').onclick = () => { ReqPanel.close(); syncReqToggle(); };
renderLogin();
const sessionUser = localStorage.getItem(SESSION_KEY);
if (sessionUser) {
  const u = store.data.users.find(x => x.username === sessionUser && x.status === 'active');
  if (u) { state.user = u; enterShell(); }
}
/* 停用即时生效：轮询自检（覆盖另一窗口停用本账号的场景） */
setInterval(() => { if (state.user) checkSelf(); }, 3000);
