/* 行业问题地图 · 交互：首页过滤/搜索、场景过滤、目录高亮 */
(function () {
  var path = location.pathname.split('/').pop() || 'index.html';

  /* ---- 首页：集群过滤 + 搜索 ---- */
  var cchip = document.getElementById('cchip');
  var q = document.getElementById('q');
  if (cchip && q) {
    var curC = '全部';
    function apply() {
      var kw = q.value.trim().toLowerCase();
      document.querySelectorAll('.icard').forEach(function (c) {
        var okC = curC === '全部' || c.getAttribute('data-c') === curC;
        var okQ = !kw || c.getAttribute('data-search').indexOf(kw) !== -1;
        c.classList.toggle('hide', !(okC && okQ));
      });
    }
    cchip.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (!b) return;
      cchip.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      curC = b.getAttribute('data-c');
      apply();
    });
    q.addEventListener('input', apply);
  }

  /* ---- 产业页：场景过滤 ---- */
  var sfits = document.getElementById('sfits');
  var srole = document.getElementById('srole');
  if (sfits && srole) {
    var curF = '全部';
    function applyS() {
      var r = srole.value;
      document.querySelectorAll('.sc').forEach(function (c) {
        var okF = curF === '全部' || (curF === 'sev4' ? +c.getAttribute('data-sev') >= 4 : c.getAttribute('data-fit') === curF);
        var okR = r === '全部' || c.getAttribute('data-role') === r;
        c.classList.toggle('hide', !(okF && okR));
      });
    }
    sfits.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-fit]');
      if (!b) return;
      sfits.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      curF = b.getAttribute('data-fit');
      applyS();
    });
    srole.addEventListener('change', applyS);
  }

  /* ---- 产业页：目录滚动高亮 ---- */
  var toc = document.getElementById('toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = {};
    toc.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          toc.querySelectorAll('a').forEach(function (a) { a.classList.remove('cur'); });
          links[en.target.id].classList.add('cur');
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    Object.keys(links).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ---- 目录下拉：点外面收起 ---- */
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.drop[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });
})();
