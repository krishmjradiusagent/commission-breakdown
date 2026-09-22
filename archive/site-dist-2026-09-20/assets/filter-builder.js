/* Radius mobile — filter builder.
   Three steps in one bottom sheet: pick a field → set the condition → see who joins.
   Injects its own markup and styles so any screen can call it:
     window.openFilterBuilder(function(res){ res.label, res.n })            */
(function () {
  var FIELDS = [
    { g: 'Who they are', k: 'Tags', i: 'tag', c: ['is “farm-2026”', 'is “farm-2025”', 'is “luxury”', 'is not set'] },
    { g: 'Who they are', k: 'Area', i: 'map-pin', c: ['is Inland Empire'] },
    { g: 'Who they are', k: 'Consent', i: 'check-circle', c: ['is opted in'] },
    { g: 'Who they are', k: 'Stage', i: 'circle', c: ['is Leads', 'is Active'] },
    { g: 'What they own', k: 'Owns property', i: 'house-line', c: ['is yes'] },
    { g: 'What they own', k: 'Owned for', i: 'calendar-blank', c: ['more than 5 years', 'more than 10 years'] },
    { g: 'What they own', k: 'Price range', i: 'currency-dollar', c: ['above $750k', 'above $1M'] },
    { g: 'What they own', k: 'Properties saved', i: 'bookmark-simple', c: ['more than 1', 'more than 5'] },
    { g: 'Where they are with you', k: 'Last contacted', i: 'clock-counter-clockwise', c: ['more than 6 months ago', 'more than 12 months ago'] },
    { g: 'Where they are with you', k: 'Source', i: 'arrow-square-in', c: ['is Referral', 'is Open house'] }
  ];
  var ROWS = [
    ['LO', 'Lena Osei', 'Active', ''],
    ['DK', 'Dev Kapoor', 'Active', 'In another campaign'],
    ['RC', 'Ravi Chandra', 'Leads', ''],
    ['MT', 'Marcus Tan', 'Active', 'In another campaign'],
    ['SN', 'Sofia Nunes', 'Leads', ''],
    ['AH', 'Amara Hale', 'On hold', 'Opted out of email']
  ];
  var TOTAL = 1844, BOOK = 4109;

  var CSS = '' +
    '.rfb { position:absolute; left:0; right:0; bottom:0; z-index:23; display:flex; flex-direction:column; max-height:92%;' +
    ' background:var(--card); border:1px solid var(--border); border-bottom:0; border-radius:22px 22px 0 0;' +
    ' transform:translateY(103%); transition:transform 300ms cubic-bezier(.32,.72,0,1); box-shadow:0 -12px 40px rgba(0,0,0,.45); }' +
    '.rfb.on { transform:none; }' +
    '.rfb .fbgrab { width:38px; height:4px; margin:8px auto 8px; border-radius:999px; background:var(--muted-foreground); opacity:.4; }' +
    '.rfb .fbhd { display:flex; align-items:flex-start; gap:10px; padding:2px 16px 12px; border-bottom:1px solid var(--border); }' +
    '.rfb .fbhd .fbt { flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; }' +
    '.rfb .fbhd h2 { margin:0; font:700 17px/1.2 var(--font-hubot); letter-spacing:-.01em; }' +
    '.rfb .fbhd p { margin:0; font:400 13px/1.35 var(--font); color:var(--muted-foreground); }' +
    '.rfb .fbx { flex:none; position:relative; width:32px; height:32px; border:0; border-radius:999px; background:var(--muted); color:var(--muted-foreground); font-size:15px; cursor:pointer; }' +
    '.rfb .fbx::before { content:\'\'; position:absolute; left:50%; top:50%; width:44px; height:44px; transform:translate(-50%,-50%); }' +
    '.rfb .fbsteps { display:flex; gap:6px; padding:12px 16px 0; }' +
    '.rfb .fbsteps span { flex:1; height:3px; border-radius:999px; background:var(--muted); }' +
    '.rfb .fbsteps span.on { background:var(--primary); }' +
    '.rfb .fbstep { font:600 12px/1 var(--font); letter-spacing:.06em; text-transform:uppercase; color:var(--muted-foreground); padding:12px 16px 8px; }' +
    '.rfb .fbbody { flex:1; min-height:0; overflow-y:auto; padding:0 16px 12px; scrollbar-width:none; }' +
    '.rfb .fbbody::-webkit-scrollbar { display:none; }' +
    '.rfb .fbsrch { display:flex; align-items:center; gap:8px; height:38px; margin:0 0 10px; padding:0 11px; border-radius:var(--radius-md); background:var(--muted); }' +
    '.rfb .fbsrch i { font-size:16px; color:var(--muted-foreground); }' +
    '.rfb .fbsrch input { flex:1; min-width:0; border:0; background:transparent; color:var(--foreground); font:400 15px/1 var(--font); }' +
    '.rfb .fbsrch input:focus { outline:none; }' +
    '.rfb .fbsrch input::placeholder { color:var(--muted-foreground); }' +
    '.rfb .fbg { font:600 12px/1 var(--font); letter-spacing:.06em; text-transform:uppercase; color:var(--muted-foreground); padding:12px 0 4px; }' +
    '.rfb .fbrow { display:flex; align-items:center; gap:11px; width:100%; min-height:48px; padding:0 4px; border:0; border-top:1px solid var(--border);' +
    ' background:transparent; color:var(--foreground); font:500 15px/1.3 var(--font); text-align:left; cursor:pointer; font-family:var(--font); }' +
    '.rfb .fbrow > i:first-child { flex:none; width:22px; text-align:center; font-size:17px; color:var(--muted-foreground); }' +
    '.rfb .fbrow .fblab { flex:1; min-width:0; }' +
    '.rfb .fbrow .fbchev { flex:none; font-size:15px; color:var(--muted-foreground); }' +
    '.rfb .fbrow .fbused { flex:none; height:22px; padding:0 8px; border-radius:var(--radius-sm); background:var(--muted); color:var(--muted-foreground); font:600 11px/22px var(--font); }' +
    '.rfb .fbrow:active { background:var(--muted); }' +
    '.rfb .fbrow:focus-visible { outline:2px solid var(--ring); outline-offset:-2px; }' +
    '.rfb .fbchip { display:inline-flex; align-items:center; gap:7px; height:32px; margin-bottom:12px; padding:0 12px; border-radius:999px;' +
    ' background:rgba(90,95,242,.18); color:#c9ccff; font:600 13px/1 var(--font); }' +
    '.rfb .fbcount { display:flex; align-items:baseline; gap:9px; padding:4px 0 12px; }' +
    '.rfb .fbcount b { font:700 30px/1 var(--font-hubot); letter-spacing:-.03em; font-variant-numeric:tabular-nums; }' +
    '.rfb .fbcount span { font:500 13px/1.35 var(--font); color:var(--muted-foreground); font-variant-numeric:tabular-nums; }' +
    '.rfb .fbsub { display:flex; align-items:center; gap:8px; padding:12px 0 2px; border-top:1px solid var(--border);' +
    ' font:500 13px/1 var(--font); color:var(--muted-foreground); font-variant-numeric:tabular-nums; }' +
    '.rfb .fbsub .pv { margin-left:auto; height:22px; padding:0 8px; border-radius:var(--radius-sm); background:rgba(90,95,242,.18); color:#aab0ff; font:600 11px/22px var(--font); }' +
    '.rfb .pr2 { display:flex; align-items:center; gap:11px; padding:11px 0; border-top:1px solid var(--border); }' +
    '.rfb .pr2:first-of-type { border-top:0; }' +
    '.rfb .pr2 .ini { flex:none; width:32px; height:32px; border-radius:999px; background:var(--muted); color:var(--foreground);' +
    ' font:600 11px/1 var(--font); display:inline-flex; align-items:center; justify-content:center; }' +
    '.rfb .pr2 .pn { flex:1; min-width:0; font:600 15px/1.2 var(--font); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }' +
    '.rfb .pr2 .st { flex:none; height:22px; padding:0 8px; border-radius:var(--radius-sm); background:var(--muted); color:var(--muted-foreground); font:600 11px/22px var(--font); }' +
    '.rfb .pr2 .bl { flex:none; height:22px; padding:0 8px; border-radius:var(--radius-sm); background:rgba(234,88,12,.16); color:#f2a678; font:600 11px/22px var(--font); }' +
    '.rfb .fbnote { padding:12px 0 0; border-top:1px solid var(--border); font:400 12px/1.45 var(--font); color:var(--muted-foreground); }' +
    '.rfb .fbfoot { display:flex; align-items:center; gap:10px; padding:12px 16px calc(14px + env(safe-area-inset-bottom)); border-top:1px solid var(--border); background:var(--card); }' +
    '.rfb .fbfoot .fbb { flex:none; display:inline-flex; align-items:center; justify-content:center; gap:7px; height:44px; padding:0 16px;' +
    ' border:1px solid var(--input); border-radius:999px; background:transparent; color:var(--foreground); font:600 14px/1 var(--font); cursor:pointer; }' +
    '.rfb .fbfoot .fbb.pri { flex:1; background:var(--primary); border-color:transparent; color:#fff; }' +
    '.rfb .fbfoot .fbb[disabled] { opacity:.45; cursor:default; }' +
    '.rfb .fbfoot .fbb:focus-visible, .rfb .fbx:focus-visible, .rfb .fbsrch input:focus-visible { outline:2px solid var(--ring); outline-offset:2px; }' +
    '.rfb .fbfoot .fbb:active { transform:scale(.98); }' +
    '.rfbscrim { position:absolute; inset:0; z-index:22; background:rgba(0,0,0,.55); opacity:0; pointer-events:none; transition:opacity 240ms ease; }' +
    '.rfbscrim.on { opacity:1; pointer-events:auto; }' +
    '.rfb [hidden] { display:none !important; }' +
    '@media (prefers-reduced-motion: reduce) { .fb, .rfbscrim { transition:none; } }';

  var HTML = '' +
    '<div class="fbgrab" aria-hidden="true"></div>' +
    '<div class="fbhd">' +
      '<div class="fbt"><h2>Who joins</h2><p>The same filters you use in the CRM</p></div>' +
      '<button class="fbx" type="button" data-fb="close" aria-label="Close"><i class="ph ph-x" aria-hidden="true"></i></button>' +
    '</div>' +
    '<div class="fbsteps" aria-hidden="true"><span class="on"></span><span></span><span></span></div>' +
    '<div class="fbstep" id="fbStepLab">Step 1 · pick a field</div>' +
    '<div class="fbbody" id="fbBody"></div>' +
    '<div class="fbfoot">' +
      '<button class="fbb" type="button" data-fb="back" hidden>Back</button>' +
      '<button class="fbb" type="button" data-fb="cancel">Cancel</button>' +
      '<button class="fbb pri" type="button" data-fb="use" disabled>Use these 1,844</button>' +
    '</div>';

  var sheet, scrim, cb, step = 1, field = null, cond = null, query = '';

  function fmt(n) { return n.toLocaleString('en-US'); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function mount() {
    var screenEl = document.querySelector('.screen');
    if (!screenEl) { console.warn('[filterBuilder] no .screen to mount into'); return false; }
    if (!document.getElementById('fbStyle')) {
      var st = document.createElement('style');
      st.id = 'fbStyle';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    scrim = document.createElement('div');
    scrim.className = 'rfbscrim';
    sheet = document.createElement('div');
    sheet.className = 'rfb';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Build a filter');
    sheet.innerHTML = HTML;
    screenEl.appendChild(scrim);
    screenEl.appendChild(sheet);

    scrim.addEventListener('click', close);
    sheet.addEventListener('click', onClick);
    sheet.addEventListener('input', function (e) {
      if (e.target.id !== 'fbQ') return;
      query = e.target.value.trim().toLowerCase();
      renderFields(true);
    });
    return true;
  }

  function label() { return field && cond ? field.k + ' ' + cond : ''; }

  function setStep(n) {
    step = n;
    var lab = { 1: 'Step 1 · pick a field', 2: 'Step 2 · set the condition', 3: 'Step 3 · see who joins' }[n];
    sheet.querySelector('#fbStepLab').textContent = lab;
    [].forEach.call(sheet.querySelectorAll('.fbsteps span'), function (s, i) { s.classList.toggle('on', i < n); });
    sheet.querySelector('[data-fb="back"]').hidden = n === 1;
    sheet.querySelector('[data-fb="use"]').disabled = n !== 3;
    sheet.querySelector('#fbBody').scrollTop = 0;
    if (n === 1) renderFields();
    else if (n === 2) renderConds();
    else renderPreview();
  }

  function renderFields(keepFocus) {
    var body = sheet.querySelector('#fbBody');
    var h = '<div class="fbsrch"><i class="ph ph-magnifying-glass" aria-hidden="true"></i>' +
      '<input id="fbQ" type="search" placeholder="Search fields" aria-label="Search fields" autocomplete="off" value="' + esc(query) + '"></div>';
    var groups = [], seen = {};
    FIELDS.forEach(function (f) { if (!seen[f.g]) { seen[f.g] = 1; groups.push(f.g); } });
    var any = false;
    groups.forEach(function (g) {
      var hits = FIELDS.filter(function (f) { return f.g === g && f.k.toLowerCase().indexOf(query) > -1; });
      if (!hits.length) return;
      any = true;
      h += '<div class="fbg">' + esc(g) + '</div>';
      hits.forEach(function (f) {
        h += '<button class="fbrow" type="button" data-field="' + esc(f.k) + '">' +
          '<i class="ph ph-' + f.i + '" aria-hidden="true"></i>' +
          '<span class="fblab">' + esc(f.k) + '</span>' +
          '<i class="ph ph-caret-right fbchev" aria-hidden="true"></i></button>';
      });
    });
    if (!any) h += '<div class="fbg">No field matches “' + esc(query) + '”</div>';
    body.innerHTML = h;
    var q = body.querySelector('#fbQ');
    if (q && keepFocus) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }

  function renderConds() {
    var body = sheet.querySelector('#fbBody');
    var h = '<div class="fbchip"><i class="ph ph-funnel" aria-hidden="true"></i>' + esc(field.k) + '</div>';
    field.c.forEach(function (c) {
      h += '<button class="fbrow" type="button" data-cond="' + esc(c) + '">' +
        '<i class="ph ph-check-circle" aria-hidden="true"></i>' +
        '<span class="fblab">' + esc(c) + '</span>' +
        '<i class="ph ph-caret-right fbchev" aria-hidden="true"></i></button>';
    });
    body.innerHTML = h;
  }

  function renderPreview() {
    var body = sheet.querySelector('#fbBody');
    var h = '<div class="fbchip"><i class="ph ph-funnel" aria-hidden="true"></i>' + esc(label()) + '</div>' +
      '<div class="fbcount"><b>' + fmt(TOTAL) + '</b><span>of ' + fmt(BOOK) + ' clients · counted just now</span></div>' +
      '<div class="fbsub">Showing <b style="color:var(--foreground)">6</b> of ' + fmt(TOTAL) + '<span class="pv">Preview</span></div>';
    ROWS.forEach(function (r) {
      h += '<div class="pr2"><span class="ini" aria-hidden="true">' + r[0] + '</span>' +
        '<span class="pn">' + esc(r[1]) + '</span>' +
        (r[3] ? '<span class="bl">' + esc(r[3]) + '</span>' : '<span class="st">' + esc(r[2]) + '</span>') +
        '</div>';
    });
    h += '<div class="fbnote">Anyone who matches later joins automatically.</div>';
    body.innerHTML = h;
  }

  function onClick(e) {
    var f = e.target.closest('[data-field]');
    if (f) {
      var k = f.getAttribute('data-field');
      field = FIELDS.filter(function (x) { return x.k === k; })[0] || null;
      if (!field) { console.warn('[filterBuilder] unknown field ' + k); return; }
      cond = null;
      setStep(2);
      return;
    }
    var c = e.target.closest('[data-cond]');
    if (c) { cond = c.getAttribute('data-cond'); setStep(3); return; }
    var a = e.target.closest('[data-fb]');
    if (!a) return;
    var act = a.getAttribute('data-fb');
    if (act === 'close' || act === 'cancel') close();
    else if (act === 'back') setStep(step === 3 ? 2 : 1);
    else if (act === 'use') {
      var res = { label: label(), n: TOTAL, field: field.k, condition: cond };
      close();
      if (typeof cb === 'function') cb(res);
    }
  }

  function close() {
    if (!sheet) return;
    sheet.classList.remove('on');
    scrim.classList.remove('on');
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) { if (e.key === 'Escape') close(); }

  window.openFilterBuilder = function (done) {
    cb = done;
    if (!sheet && !mount()) return;
    step = 1; field = null; cond = null; query = '';
    setStep(1);
    sheet.hidden = false;
    requestAnimationFrame(function () { sheet.classList.add('on'); scrim.classList.add('on'); });
    document.addEventListener('keydown', onKey);
    var first = sheet.querySelector('.fbrow');
    if (first) first.focus();
  };
})();
