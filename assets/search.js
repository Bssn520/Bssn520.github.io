(function () {
  var modal = document.getElementById('search-modal');
  var toggle = document.getElementById('search-toggle');
  if (!modal) return;
  var input = document.getElementById('search-input');
  var list = document.getElementById('search-results');
  var status = document.getElementById('search-status');
  var data = null, loading = null, lastFocus = null;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function hl(text, terms) {
    var out = esc(text);
    terms.forEach(function (t) { out = out.replace(new RegExp('(' + reEsc(esc(t)) + ')', 'gi'), '<mark>$1</mark>'); });
    return out;
  }
  function snippet(content, terms) {
    var low = content.toLowerCase(), pos = -1;
    for (var i = 0; i < terms.length && pos < 0; i++) pos = low.indexOf(terms[i]);
    if (pos < 0) return content.slice(0, 120) + (content.length > 120 ? '…' : '');
    var start = Math.max(0, pos - 40), end = Math.min(content.length, pos + 100);
    return (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '');
  }
  function load() {
    if (!loading) loading = fetch(window.SEARCH_JSON).then(function (r) { return r.json(); }).then(function (j) { data = j; });
    return loading;
  }
  function run() {
    var terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    list.innerHTML = '';
    if (!terms.length) { status.textContent = '输入关键词，支持多个词空格分隔'; return; }
    if (!data) { status.textContent = '加载中…'; return; }
    var res = [];
    data.forEach(function (p) {
      var title = (p.title || '').toLowerCase();
      var meta = [].concat(p.tags || [], p.categories || []).join(' ').toLowerCase();
      var body = (p.content || '').toLowerCase();
      var all = title + ' ' + meta + ' ' + body, score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (all.indexOf(t) < 0) return;
        if (title.indexOf(t) >= 0) score += 100;
        if (meta.indexOf(t) >= 0) score += 10;
        if (body.indexOf(t) >= 0) score += 1;
      }
      res.push({ p: p, s: score });
    });
    res.sort(function (a, b) { return b.s - a.s || (a.p.date < b.p.date ? 1 : -1); });
    status.textContent = res.length ? '找到 ' + res.length + ' 篇' : '没有找到相关文章';
    list.innerHTML = res.map(function (r) {
      var p = r.p, tags = [].concat(p.categories || [], p.tags || []);
      return '<li><a href="' + esc(p.url) + '"><span class="search-meta">' + esc(p.date) +
        (tags.length ? ' · ' + hl(tags.join(' / '), terms) : '') + '</span>' +
        '<span class="search-title">' + hl(p.title, terms) + '</span>' +
        '<span class="search-snippet">' + hl(snippet(p.content || '', terms), terms) + '</span></a></li>';
    }).join('');
  }
  function open() {
    if (!modal.hidden) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add('search-open');
    input.focus(); input.select();
    load().then(run); run();
  }
  function close() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.documentElement.classList.remove('search-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.openSearch = open;
  if (toggle) toggle.addEventListener('click', open);
  input.addEventListener('input', run);
  modal.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
  modal.addEventListener('keydown', function (e) {
    if (e.target.matches('kbd[data-close]') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); close(); }
  });
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    if (e.key === 'Escape') { close(); return; }
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); modal.hidden ? open() : close(); return; }
    if (e.key === '/' && !typing && modal.hidden) { e.preventDefault(); open(); }
  });
  var q = new URLSearchParams(location.search).get('q');
  if (q) { input.value = q; open(); }
})();
