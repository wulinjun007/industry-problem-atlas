#!/usr/bin/env node
/* 行业问题地图 · 静态站生成器
 * 用法: node build.js
 * 读取 data/manifest.json + data/industries/*.json → 生成 index.html / method.html / industries/*.html */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const MAN = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/manifest.json'), 'utf8'));
const IND = MAN.industries;

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FREQ_SHORT = { '每日': '日', '每周': '周', '每月': '月', '每季': '季', '每年': '年', '偶发': '偶发' };

function loadData() {
  const out = [];
  for (const m of IND) {
    const f = path.join(ROOT, 'data/industries', m.num + '-' + m.id + '.json');
    if (!fs.existsSync(f)) { console.warn('MISS ' + f); continue; }
    out.push(JSON.parse(fs.readFileSync(f, 'utf8')));
  }
  return out.sort((a, b) => a.num.localeCompare(b.num));
}

/* ---------- 共享外壳 ---------- */
function shell(title, desc, body, opts) {
  opts = opts || {};
  const pre = opts.sub ? '../' : '';
  const navLinks = [
    ['index.html', '总览'],
    ['method.html', '方法论与完成标准']
  ];
  const nav = navLinks.map(([h, t]) => '<a href="' + pre + h + '"' + (opts.page === h ? ' class="on"' : '') + '>' + t + '</a>').join('');
  const drop = IND.map((m) => {
    const cur = opts.curNum === m.num;
    return '<a href="' + pre + 'industries/' + m.num + '-' + m.id + '.html"' + (cur ? ' class="cur"' : '') + '><b>' + m.num + '</b>' + esc(m.name) + '</a>';
  }).join('');
  return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>' + esc(title) + '</title>\n<meta name="description" content="' + esc(desc) + '">\n' +
    '<link rel="stylesheet" href="' + pre + 'assets/styles.css">\n</head>\n<body>\n' +
    '<header class="top"><div class="wrap tin">' +
    '<a class="brand" href="' + pre + 'index.html"><span class="mark">图</span><span class="bt"><strong>行业问题地图</strong><em>重庆 33618 · 18 新星产业 ATLAS</em></span></a>' +
    '<nav class="nv">' + nav + '<details class="drop"><summary>18 产业目录</summary><div class="dp">' + drop + '</div></details></nav>' +
    '</div></header>\n' + body +
    '<footer class="ft"><div class="wrap">' +
    '<div class="fb">行业问题地图 <span class="mono">INDUSTRY PROBLEM ATLAS</span></div>' +
    '<div class="ftags"><span class="tg tg-fact">事实 · 来自公开政策与产业资料</span><span class="tg tg-hypo">问题假设 · 待一线访谈验证</span><span class="tg tg-opp">网站机会 · 仅当网页确实降低成本</span></div>' +
    '<p>本站把重庆「33618」体系 18 个新星产业逐一拆成「行业问题地图」：产业链 → 角色 → 真实工作场景 → 触发事件 → 当前做法 → 决策参数 → 具体痛点 → 现有替代 → 哪些步骤值得数字化。产业名录与本地锚点以重庆市人民政府产业地图（2026-08 更新）等公开资料为准；所有痛点结论为有产业依据的问题假设，须经一线访谈验证后才能进入需求文档。本站不构成投资建议。</p>' +
    '<p class="mono dim">完成标准：一个不了解该行业的人，仅看这份文档，就能回答——谁在什么情况下遇到什么问题，现在怎么处理，为什么难，哪些步骤值得数字化。</p>' +
    '</div></footer>\n' +
    '<script src="' + pre + 'assets/app.js"></script>\n</body>\n</html>';
}

/* ---------- 首页 ---------- */
function buildIndex(data) {
  const total = (f) => data.reduce((n, d) => n + (d[f] || []).length, 0);
  const nScen = total('scenarios'), nRoles = total('roles'), nTools = total('tools'), nCases = total('cases');
  const clusterChips = MAN.clusters.map((c) => '<button class="chip" data-c="' + c + '">' + c + '</button>').join('');
  const cards = data.map((d) => {
    const m = IND.find((x) => x.num === d.num) || d;
    const search = esc([d.name, d.subfields.join(' '), d.core, d.keyQuestion, d.oneLiner, (d.typicalUsers || []).join(' ')].join(' '));
    const sev = d.scenarios.filter((s) => s.severity >= 4).length;
    return '<a class="icard" data-c="' + d.cluster + '" data-search="' + search.toLowerCase() + '" href="industries/' + d.num + '-' + d.id + '.html">' +
      '<div class="ic-top"><span class="mono ic-num">' + d.num + '</span><span class="ic-name">' + esc(d.name) + '</span><span class="ic-cl c-' + d.cluster + '">' + d.cluster + '</span></div>' +
      '<div class="ic-sub">' + d.subfields.map(esc).join(' · ') + '</div>' +
      '<p class="ic-q"><b>核心问题</b>' + esc(d.keyQuestion) + '</p>' +
      '<p class="ic-ol">' + esc(d.oneLiner) + '</p>' +
      '<div class="ic-stat mono">场景 ' + d.scenarios.length + ' · 角色 ' + d.roles.length + ' · 工具 ' + d.tools.length + ' · 高痛感 ' + sev + '</div>' +
      '</a>';
  }).join('\n');
  const body =
  '<main><section class="hero"><div class="wrap">' +
    '<p class="kick mono">重庆 33618 · 18 个「新星」产业集群 · 逐个拆成问题空间</p>' +
    '<h1>先拆问题，<br>再谈网站。</h1>' +
    '<p class="lede">把 18 个产业逐一还原成「谁在什么情况下遇到什么问题、现在怎么处理、为什么难、哪些步骤值得数字化」的问题地图。每张地图包含产业链、用户角色、' + nScen + ' 个真实工作场景及其触发事件、决策参数、痛点强弱与现有替代方案——所有痛点均标注证据强度，待一线访谈验证。</p>' +
    '<div class="stat mono"><div><b>18</b>产业</div><div><b>' + nScen + '</b>场景</div><div><b>' + nRoles + '</b>角色</div><div><b>' + nTools + '</b>现有工具</div><div><b>' + nCases + '</b>公开案例</div></div>' +
  '</div></section>' +
  '<section class="sec"><div class="wrap">' +
    '<div class="sec-h"><h2>18 张问题地图</h2><p>点开任一产业，按「产业链 → 角色 → 场景 → 痛点 → 网站可解性」阅读；场景卡片可按「网站可解 / 部分可解 / 必须线下」过滤。</p></div>' +
    '<div class="fbar"><div class="chips" id="cchip"><button class="chip on" data-c="全部">全部</button>' + clusterChips + '</div>' +
    '<input id="q" type="search" placeholder="搜产业名 / 细分 / 核心问题 / 用户角色…"></div>' +
    '<div class="igrid" id="igrid">' + cards + '</div>' +
  '</div></section>' +
  '<section class="sec alt" id="done"><div class="wrap">' +
    '<div class="sec-h"><h2>什么才算完成</h2><p>每个产业至少完成以下拆解——这是 P0 标准，不是可选项。</p></div>' +
    '<div class="p0">' +
      ['产业链', '5～10 类用户角色', '20～50 个真实场景', '场景触发事件', '当前工作方法', '决策参数', '具体痛点', '痛点频率', '错误成本', '现有产品 / 工具', '真实企业案例', '哪些适合网站解决', '哪些不适合网站解决'].map((t) => '<span>' + t + '</span>').join('') +
    '</div>' +
    '<p class="more"><a href="method.html">方法论与完成标准 →</a></p>' +
  '</div></section></main>';
  return shell('行业问题地图 · 重庆33618十八新星产业的问题空间拆解', '18个产业的问题地图：产业链、用户角色、真实场景、痛点与网站可解性', body, { page: 'index.html' });
}

/* ---------- 产业页 ---------- */
function sevDots(n) {
  let s = '<span class="dots" title="痛感 ' + n + '/5">';
  for (let i = 1; i <= 5; i++) s += '<i class="' + (i <= n ? 'f' : '') + '"></i>';
  return s + '</span>';
}
const fitCls = { '网站可解': 'fit-ok', '部分可解': 'fit-part', '必须线下': 'fit-no' };

function scenCard(s) {
  const row = (k, v) => v ? '<div class="fr"><span>' + k + '</span><p>' + esc(v) + '</p></div>' : '';
  return '<article class="sc" data-fit="' + s.webFit + '" data-role="' + esc(s.role) + '" data-sev="' + s.severity + '">' +
    '<header class="sc-h"><span class="mono sid">' + s.sid + '</span><h4>' + esc(s.title) + '</h4><span class="rolec">' + esc(s.role) + '</span></header>' +
    '<div class="sc-b">' +
      row('触发事件', s.trigger) + row('当前做法', s.current) + row('所需数据', s.inputs) + row('决策参数', s.params) +
      row('具体痛点', s.pain) + row('错误成本', s.cost) + row('现有替代', s.alt) +
    '</div>' +
    '<footer class="sc-f">' +
      '<span class="bg mono">' + FREQ_SHORT[s.freq] + '</span>' + sevDots(s.severity) +
      '<span class="bg fit ' + fitCls[s.webFit] + '">' + s.webFit + '</span>' +
      '<span class="bg conf c' + s.confidence + '">证据' + s.confidence + '</span>' +
    '</footer>' +
    '<div class="sc-k">' + s.keywords.map((k) => '<i>' + esc(k) + '</i>').join('') + '</div>' +
    '<div class="sc-w">' + (s.webFit === '必须线下' ? '⛔ ' : '🖥 ') + esc(s.webHow) + '</div>' +
    '</article>';
}

function buildIndustry(d, idx) {
  const m = IND.find((x) => x.num === d.num) || d;
  const chainCol = (key, label, tip) =>
    '<div class="ch-col"><h4>' + label + '<small>' + tip + '</small></h4>' +
    d.chain[key].map((x) => '<div class="ch-seg"><b>' + esc(x.seg) + '</b><p>' + esc(x.what) + '</p><span class="pl">' + esc(x.players) + '</span>' + (x.note ? '<em>' + esc(x.note) + '</em>' : '') + '</div>').join('') +
    '</div>';
  const roleCards = d.roles.map((r) =>
    '<div class="rc"><b>' + esc(r.name) + '</b>' +
    [['是谁', r.who], ['被考核', r.kpi], ['用什么干活', r.dailyTools], ['最常见卡点', r.pains]].map(([k, v]) => '<div class="rc-r"><span>' + k + '</span><p>' + esc(v) + '</p></div>').join('') +
    '</div>').join('');
  const fits = ['网站可解', '部分可解', '必须线下'];
  const scenFilter =
    '<div class="sf"><div class="chips" id="sfits"><button class="chip on" data-fit="全部">全部 ' + d.scenarios.length + '</button>' +
    fits.map((f) => { const n = d.scenarios.filter((s) => s.webFit === f).length; return '<button class="chip" data-fit="' + f + '">' + f + ' ' + n + '</button>'; }).join('') +
    '<button class="chip" data-fit="sev4">痛感≥4 ' + d.scenarios.filter((s) => s.severity >= 4).length + '</button></div>' +
    '<select id="srole"><option value="全部">全部角色</option>' + d.roles.map((r) => '<option>' + esc(r.name) + '</option>').join('') + '</select></div>';
  const scen = d.scenarios.map(scenCard).join('\n');
  // heat
  const bySev = [...d.scenarios].sort((a, b) => b.severity - a.severity).slice(0, 5);
  const heat = '<div class="heat"><div class="h-top"><h4>最痛的 5 个场景</h4>' +
    bySev.map((s) => '<div class="h-row"><span class="mono">' + s.sid + '</span><p>' + esc(s.title) + '</p>' + sevDots(s.severity) + '<span class="bg mono">' + FREQ_SHORT[s.freq] + '</span></div>').join('') +
    '</div><div class="h-fit">' + fits.map((f) => {
      const n = d.scenarios.filter((s) => s.webFit === f).length;
      const pct = Math.round(n / d.scenarios.length * 100);
      return '<div class="h-bar"><span>' + f + '</span><div class="bar"><i class="' + fitCls[f] + '" style="width:' + pct + '%"></i></div><b class="mono">' + n + '</b></div>';
    }).join('') + '</div></div>';
  const tools = '<table class="tt"><thead><tr><th>产品 / 工具</th><th>类型</th><th>做什么</th><th>它没解决什么</th></tr></thead><tbody>' +
    d.tools.map((t) => '<tr><td><b>' + esc(t.name) + '</b></td><td>' + esc(t.type) + '</td><td>' + esc(t.what) + '</td><td>' + esc(t.gap) + '</td></tr>').join('') + '</tbody></table>';
  const cases = d.cases.map((c) => '<div class="cc"><b>' + esc(c.who) + '</b><p>' + esc(c.what) + '</p><em>→ 对本图含义：' + esc(c.lesson) + '</em></div>').join('');
  const fit2col =
    '<div class="f2"><div class="f2c ok"><h4>🖥 适合网站解决</h4><ul>' + d.webFitSummary.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' +
    '<div class="f2c no"><h4>🚧 必须线下 / 网站只能辅助</h4><ul>' + d.offlineSummary.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div></div>';
  const mvp =
    '<div class="mvp"><p class="mvp-loop">' + esc(d.mvp.loop) + '</p>' +
    '<div class="mvp-g"><div><h5>需要建设的数据表</h5><ul>' + d.mvp.tables.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' +
    '<div><h5>信任来源</h5><ul>' + d.mvp.trust.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' +
    '<div><h5>可做产品形态</h5><div class="formc">' + d.forms.map((x) => '<span>' + esc(x) + '</span>').join('') + '</div></div></div></div>';
  const interview =
    '<div class="iv"><div class="iv-l"><h5>访谈对象</h5><div class="formc">' + d.mvp.interviewees.map((x) => '<span>' + esc(x) + '</span>').join('') + '</div>' +
    '<h5>验证指标</h5><ul>' + d.mvp.metrics.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' +
    '<div class="iv-r"><h5>访谈问题清单（' + d.mvp.questions.length + '）</h5><ol>' + d.mvp.questions.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol></div></div>';
  const toc = [
    ['chain', '产业链地图'], ['roles', '用户角色地图'], ['scen', '真实工作场景 ' + d.scenarios.length], ['heat', '痛点热力'],
    ['tools', '现有产品/工具'], ['cases', '真实公开案例'], ['fit', '网站可解 vs 必须线下'], ['mvp', '产品形态与 MVP'], ['iv', '访谈与验证']
  ].map(([id, t]) => '<a href="#' + id + '">' + t + '</a>').join('');
  const prev = IND[idx - 1], next = IND[idx + 1];
  const pn =
    '<nav class="pn">' + (prev ? '<a href="' + prev.num + '-' + prev.id + '.html">← ' + prev.num + ' ' + esc(prev.name) + '</a>' : '<span></span>') +
    (next ? '<a href="' + next.num + '-' + next.id + '.html">' + next.num + ' ' + esc(next.name) + ' →</a>' : '<span></span>') + '</nav>';
  const body =
  '<main class="wrap ipage"><div class="igrid2"><aside class="toc"><div class="toc-num mono">' + d.num + '</div><nav id="toc">' + toc + '</nav></aside>' +
  '<div class="icont">' +
    '<header class="ih"><div class="ih-t"><span class="mono ih-num">' + d.num + '</span><h1>' + esc(d.name) + '</h1><span class="ic-cl c-' + d.cluster + '">' + d.cluster + '</span></div>' +
    '<p class="ih-q"><b>核心问题</b>' + esc(d.keyQuestion) + '</p>' +
    '<p class="ih-ol">' + esc(d.oneLiner) + '</p>' +
    '<div class="ih-meta"><div><span>细分方向</span>' + d.subfields.map((x) => '<i>' + esc(x) + '</i>').join('') + '</div>' +
    '<div><span>典型用户</span>' + (d.typicalUsers || []).map((x) => '<i>' + esc(x) + '</i>').join('') + '</div>' +
    '<div><span>重庆锚点</span>' + d.cqAngle.map((x) => '<i>' + esc(x) + '</i>').join('') + '</div></div>' +
    '<p class="ih-core"><b>产业核心</b>' + esc(d.core) + '</p></header>' +
    '<section class="isec" id="chain"><h2>产业链地图</h2><div class="ch">' + chainCol('upstream', '上游', '原料 / 部件 / 设备') + chainCol('midstream', '中游', '制造 / 集成 / 流通') + chainCol('downstream', '下游', '应用 / 服务 / 终端') + '</div></section>' +
    '<section class="isec" id="roles"><h2>用户角色地图 <small>谁在干活、被考核什么、卡在哪</small></h2><div class="rgrid">' + roleCards + '</div></section>' +
    '<section class="isec" id="scen"><h2>真实工作场景 <small>每张卡片：什么触发 → 现在怎么做 → 卡在哪 → 值不值得数字化</small></h2>' + scenFilter + '<div class="sgrid" id="sgrid">' + scen + '</div></section>' +
    '<section class="isec" id="heat"><h2>痛点热力 <small>同一张图内比较，先看最痛的</small></h2>' + heat + '</section>' +
    '<section class="isec" id="tools"><h2>现有产品 / 工具 <small>他们已经解决了什么、还剩什么</small></h2>' + tools + '</section>' +
    '<section class="isec" id="cases"><h2>真实公开案例 <small>公开广为人知的事实，用于校准判断</small></h2><div class="cgrid">' + cases + '</div></section>' +
    '<section class="isec" id="fit"><h2>哪些适合网站解决 <small>以及哪些必须线下——诚实比乐观重要</small></h2>' + fit2col + '</section>' +
    '<section class="isec" id="mvp"><h2>可做形态与 MVP 闭环 <small>用户来 → 用什么 → 留下什么 → 如何变好</small></h2>' + mvp + '</section>' +
    '<section class="isec" id="iv"><h2>访谈与验证 <small>痛点是假设，访谈才是裁决</small></h2>' + interview + '</section>' +
    pn +
  '</div></div></main>';
  return shell(d.num + ' ' + d.name + ' · 行业问题地图', d.name + '：' + d.keyQuestion, body, { sub: true, curNum: d.num });
}

/* ---------- 方法论页 ---------- */
function buildMethod() {
  const p0 = [['产业链', '上游/中游/下游环节、每环节干什么、代表玩家、卡点（chain）'],
    ['5～10 类用户角色', '是谁、被考核什么、用什么干活、最常见卡点（roles）'],
    ['20～50 个真实场景', '来自真实工作流，不是营销想象（scenarios）'],
    ['场景触发事件', '什么情况下会发生（trigger）'],
    ['当前工作方法', '现在怎么一步步处理（current）'],
    ['所需输入数据', '处理时手上要有什么（inputs）'],
    ['决策参数', '依据什么判断取舍（params）'],
    ['主要风险 / 错误成本', '做错的代价（cost）'],
    ['具体痛点与强弱', '卡在哪一步、痛感 1~5（pain / severity）'],
    ['发生频率', '日/周/月/季/年/偶发（freq）'],
    ['现有替代方案', '现在用什么凑合（alt / tools）'],
    ['搜索关键词', '用户真会去搜的词（keywords）'],
    ['真实产品 / 企业', '现有玩家与空白（tools）'],
    ['真实公开案例', '公开广为人知的事实（cases）'],
    ['哪些适合网站解决', 'webFitSummary + 每场景 webFit'],
    ['哪些必须线下', 'offlineSummary + 线下原因（webHow）'],
    ['可做产品形态 / MVP 闭环', 'forms / mvp'],
    ['需要建设的数据表', 'mvp.tables'],
    ['信任来源', 'mvp.trust'],
    ['访谈对象与问题', 'mvp.interviewees / questions'],
    ['验证指标', 'mvp.metrics']];
  const body =
  '<main class="wrap mpage">' +
  '<header class="mh"><p class="kick mono">方法论</p><h1>先拆问题，再谈网站</h1>' +
  '<p class="lede">本站不是 18 份「漂亮 PRD」，而是 18 份行业操作手册。每份文档固定做到下面的深度，完成标准只有一条：<b>一个不了解该行业的人，仅看这份文档，就能回答——谁在什么情况下遇到什么问题，现在怎么处理，为什么难，哪些步骤值得数字化。</b></p></header>' +
  '<section class="isec"><h2>每张地图的固定深度（21 项）</h2>' +
  '<table class="tt"><thead><tr><th>拆解项</th><th>对应字段</th></tr></thead><tbody>' +
  p0.map(([a, b]) => '<tr><td><b>' + a + '</b></td><td class="mono">' + esc(b) + '</td></tr>').join('') + '</tbody></table></section>' +
  '<section class="isec"><h2>证据分层 <small>每个场景都标注，不许把假设写成事实</small></h2>' +
  '<div class="conf-g">' +
  '<div class="cf c高"><b>证据 高</b><p>公开资料充分且普遍（政策、上市公司公告、广为人知的产业事实）。</p></div>' +
  '<div class="cf c中"><b>证据 中</b><p>有产业依据的推断：流程合理、数字与细节待核实。</p></div>' +
  '<div class="cf c低"><b>证据 低</b><p>待验证假设：只有访谈一线后才能确认或推翻。</p></div></div></section>' +
  '<section class="isec"><h2>网站可解性的三种判定</h2><ul class="pl-list">' +
  '<li><b>网站可解</b>——问题本质是「信息不对称 / 分散 / 难比较」，网页聚合 + 结构化就能显著降低成本。</li>' +
  '<li><b>部分可解</b>——信息部分在线化，但决策还依赖线下资源（样品、实验、关系、资质）。</li>' +
  '<li><b>必须线下</b>——问题的瓶颈是物理世界（产线、临床、审批、现场服务），网站只能做辅助（查资料、备资料、找线索）。</li></ul></section>' +
  '<section class="isec"><h2>数据从哪来、怎么守边界</h2><ul class="pl-list">' +
  '<li>产业名录与本地锚点：重庆市人民政府「重庆产业地图」（2026-08 更新）及公开政策文件、上市公司公告。</li>' +
  '<li>场景与痛点：按真实工作流程推导的<b>问题假设</b>，不编造精确数字、论文、URL 与企业内幕。</li>' +
  '<li>任何痛点进入产品需求前，必须完成 mvp 列出的访谈与验证指标。</li>' +
  '<li>本站不替代官方文件，不构成投资建议；引用数据以官方最新披露为准。</li></ul></section>' +
  '<section class="isec"><h2>机器校验</h2><p>18 份 JSON 均通过 <span class="mono">node tools/validate.js</span> 硬校验：场景数量、sid 连续性、角色引用、枚举合法性、关键词数量、空话词（「提高效率」「赋能」等）一律拦截。</p></section>' +
  '</main>';
  return shell('方法论与完成标准 · 行业问题地图', '每份行业操作手册的固定深度、证据分层与网站可解性判定', body, { page: 'method.html' });
}

/* ---------- 写盘 ---------- */
const data = loadData();
console.log('已读取 ' + data.length + '/18 个产业 JSON');
fs.mkdirSync(path.join(ROOT, 'industries'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'index.html'), buildIndex(data));
fs.writeFileSync(path.join(ROOT, 'method.html'), buildMethod());
data.forEach((d, i) => fs.writeFileSync(path.join(ROOT, 'industries', d.num + '-' + d.id + '.html'), buildIndustry(d, i)));
console.log('生成 index.html, method.html, industries/' + data.length + ' 页');
