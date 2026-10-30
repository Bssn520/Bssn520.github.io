(function () {
  var input = document.getElementById('search-input');
  var list = document.getElementById('search-results');
  var status = document.getElementById('search-status');
  var data = null;
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
  function run(q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    list.innerHTML = '';
    if (!terms.length) { status.textContent = ''; return; }
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
    status.textContent = '找到 ' + res.length + ' 篇';
    list.innerHTML = res.map(function (r) {
      var p = r.p, tags = [].concat(p.categories || [], p.tags || []);
      return '<li><span class="post-meta">' + esc(p.date) + (tags.length ? ' · ' + hl(tags.join(' / '), terms) : '') +
        '</span><h3><a class="post-link" href="' + esc(p.url) + '">' + hl(p.title, terms) + '</a></h3>' +
        '<p class="search-snippet">' + hl(snippet(p.content || '', terms), terms) + '</p></li>';
    }).join('');
  }
  var q = new URLSearchParams(location.search).get('q') || '';
  input.value = q;
  fetch(window.SEARCH_JSON).then(function (r) { return r.json(); }).then(function (j) {
    data = j; run(input.value);
    input.addEventListener('input', function () {
      run(input.value);
      var u = new URL(location.href); if (input.value) u.searchParams.set('q', input.value); else u.searchParams.delete('q');
      history.replaceState(null, '', u);
    });
  });
  document.querySelector('.search-form').addEventListener('submit', function (e) { e.preventDefault(); });
})();
