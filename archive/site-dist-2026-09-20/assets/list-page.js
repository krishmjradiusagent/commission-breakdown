/* Shared filter behaviour for the Radius mobile list pages. */
(function () {
  var rows = [].slice.call(document.querySelectorAll('[data-row]'));
  var filters = {};

  function matches(row) {
    return Object.keys(filters).every(function (k) {
      var v = filters[k];
      if (!v || v === 'all') return true;
      return (row.getAttribute('data-' + k) || '').split(' ').indexOf(v) > -1;
    });
  }

  function apply() {
    rows.forEach(function (r) { r.hidden = !matches(r); });
    [].forEach.call(document.querySelectorAll('.grp'), function (g) {
      var vis = [].slice.call(g.querySelectorAll('[data-row]')).filter(function (r) { return !r.hidden; });
      g.hidden = vis.length === 0;
      var n = g.querySelector('.sec-head .n');
      if (n) n.textContent = vis.length;
      vis.forEach(function (r, i) { r.style.borderTopWidth = i === 0 ? '0' : '1px'; });
    });
    var total = rows.filter(function (r) { return !r.hidden && !r.classList.contains('done'); }).length;
    var c = document.getElementById('count');
    if (c) c.textContent = total;
    var e = document.getElementById('empty');
    if (e) e.hidden = total > 0;
  }

  [].forEach.call(document.querySelectorAll('[data-filter]'), function (bar) {
    var key = bar.getAttribute('data-filter');
    var segmented = bar.classList.contains('sh-tabs');
    var sel = bar.querySelector(segmented ? '[aria-selected="true"]' : '[aria-pressed="true"]');
    filters[key] = sel ? sel.getAttribute('data-val') : 'all';

    bar.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      var val = b.getAttribute('data-val');
      if (!segmented && filters[key] === val && val !== 'all') val = 'all';
      filters[key] = val;
      [].forEach.call(bar.querySelectorAll('button'), function (x) {
        var on = x.getAttribute('data-val') === val;
        x.setAttribute(segmented ? 'aria-selected' : 'aria-pressed', on ? 'true' : 'false');
      });
      apply();
    });

    if (segmented) {
      bar.addEventListener('keydown', function (ev) {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        var btns = [].slice.call(bar.querySelectorAll('button'));
        var i = btns.indexOf(document.activeElement);
        if (i < 0) return;
        ev.preventDefault();
        var nx = btns[(i + (ev.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
        nx.focus(); nx.click();
      });
    }
  });

  var h = (location.hash || '').replace('#', '');
  if (h) {
    var t = document.querySelector('.sh-tabs button[data-val="' + h + '"]');
    if (t) t.click();
  }

  document.addEventListener('click', function (ev) {
    var c = ev.target.closest('.tk-check');
    if (!c) return;
    var on = c.getAttribute('aria-checked') === 'true';
    c.setAttribute('aria-checked', on ? 'false' : 'true');
    c.setAttribute('aria-label', on ? 'Mark task complete' : 'Mark task incomplete');
    c.closest('.tk-row').classList.toggle('done', !on);
  });

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('.sec-toggle');
    if (!t) return;
    var g = t.closest('.grp');
    var open = g.getAttribute('data-collapsed') === 'true';
    g.setAttribute('data-collapsed', open ? 'false' : 'true');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', function (ev) {
    var s = ev.target.closest('.sign-btn');
    if (!s) return;
    var row = s.closest('.dc-row');
    var done = row.classList.toggle('signed');
    s.innerHTML = done ? '<i class="ph ph-check"></i>Signed' : '<i class="ph ph-pen-nib"></i>Sign';
  });

  apply();
})();
