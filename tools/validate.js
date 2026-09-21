#!/usr/bin/env node
/* 行业问题地图 · JSON 校验器
 * 用法: node tools/validate.js [num]   // 不带参数校验全部
 * 退出码: 0=全部PASS, 1=有FAIL */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'industries');
const FREQ = ['每日', '每周', '每月', '每季', '每年', '偶发'];
const WEBFIT = ['网站可解', '部分可解', '必须线下'];
const CONF = ['高', '中', '低'];
const CLUSTER = ['电子信息', '智能装备', '先进材料', '生物医药', '未来产业'];
const BAN = ['提高效率', '降本增效', '赋能', '助力'];
const len = (v, a, b) => Array.isArray(v) && v.length >= a && v.length <= b;
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const objArr = (v, n) => Array.isArray(v) && v.every((x) => x && typeof x === 'object' && !Array.isArray(x));
const strArr = (v, n) => Array.isArray(v) && v.every((s) => isStr(s));

function checkFile(f) {
  const errs = [];
  const E = (m) => errs.push(m);
  let d;
  try {
    d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  } catch (e) {
    return [f + ': JSON 解析失败 → ' + e.message];
  }
  const tag = '[' + f + '] ';
  // top-level
  for (const k of ['id','num','name','cluster','subfields','core','keyQuestion','oneLiner','typicalUsers','chain','roles','scenarios','tools','cases','cqAngle','webFitSummary','offlineSummary','forms','mvp'])
    if (!(k in d)) E(tag + '缺少顶层字段 ' + k);
  if (errs.length) return errs;
  if (!isStr(d.id) || d.id !== f.replace(/\.json$/, '').replace(/^\d+-/, '')) E(tag + 'id 与文件名不一致');
  if (!/^\d{2}$/.test(d.num)) E(tag + 'num 必须是两位序号');
  if (!CLUSTER.includes(d.cluster)) E(tag + 'cluster 非法: ' + d.cluster);
  if (!len(d.subfields, 3, 6) || !strArr(d.subfields, 3)) E(tag + 'subfields 需 3~6 个字符串');
  for (const k of ['core', 'keyQuestion', 'oneLiner']) if (!isStr(d[k])) E(tag + k + ' 不能为空');
  if (!len(d.typicalUsers, 4, 8) || !strArr(d.typicalUsers, 4)) E(tag + 'typicalUsers 需 4~8 个');
  // chain
  for (const seg of ['upstream', 'midstream', 'downstream']) {
    const arr = d.chain[seg];
    if (!len(arr, 3, 5)) { E(tag + 'chain.' + seg + ' 需 3~5 个环节'); continue; }
    arr.forEach((x, i) => ['seg', 'what', 'players', 'note'].forEach((k) => { if (!isStr(x[k])) E(tag + 'chain.' + seg + '[' + i + '].' + k + ' 缺失'); }));
  }
  // roles
  if (!len(d.roles, 5, 9)) E(tag + 'roles 需 5~9 个');
  const roleNames = new Set();
  d.roles.forEach((r, i) => {
    if (!isStr(r.name)) { E(tag + 'roles[' + i + '].name 缺失'); return; }
    if (roleNames.has(r.name)) E(tag + '角色名重复: ' + r.name);
    roleNames.add(r.name);
    ['who', 'kpi', 'dailyTools', 'pains'].forEach((k) => { if (!isStr(r[k])) E(tag + 'roles[' + i + '].' + k + ' 缺失'); });
  });
  // scenarios
  if (!len(d.scenarios, 20, 24)) E(tag + 'scenarios 需 20~24 个，当前 ' + (d.scenarios || []).length);
  const sids = new Set();
  (d.scenarios || []).forEach((s, i) => {
    const t = tag + 'scenarios[' + i + '] ';
    if (s.sid !== 'S' + String(i + 1).padStart(2, '0')) E(t + 'sid 应为 S' + String(i + 1).padStart(2, '0') + '，实际 ' + s.sid);
    if (sids.has(s.sid)) E(t + 'sid 重复');
    sids.add(s.sid);
    for (const k of ['title', 'trigger', 'current', 'inputs', 'params', 'pain', 'cost', 'alt', 'webHow'])
      if (!isStr(s[k])) E(t + k + ' 缺失');
    if (!roleNames.has(s.role)) E(t + 'role "' + s.role + '" 不在 roles 中');
    if (!FREQ.includes(s.freq)) E(t + 'freq 非法: ' + s.freq);
    if (!Number.isInteger(s.severity) || s.severity < 1 || s.severity > 5) E(t + 'severity 需 1~5 整数');
    if (!WEBFIT.includes(s.webFit)) E(t + 'webFit 非法: ' + s.webFit);
    if (!CONF.includes(s.confidence)) E(t + 'confidence 非法: ' + s.confidence);
    if (!len(s.keywords, 3, 6) || !strArr(s.keywords, 3)) E(t + 'keywords 需 3~6 个');
    if (s.webFit === '必须线下' && isStr(s.webHow) && !s.webHow.startsWith('线下原因'))
      E(t + 'webFit=必须线下 时 webHow 需以 "线下原因：" 开头');
  });
  const fits = new Set((d.scenarios || []).map((s) => s.webFit));
  if (fits.size < 3) E(tag + 'webFit 三种取值都应出现（当前只有: ' + [...fits].join('/') + '）');
  // tools/cases/summaries/forms/mvp
  if (!len(d.tools, 6, 10) || !objArr(d.tools, 6)) E(tag + 'tools 需 6~10 个');
  else d.tools.forEach((x, i) => ['name', 'type', 'what', 'gap'].forEach((k) => { if (!isStr(x[k])) E(tag + 'tools[' + i + '].' + k + ' 缺失'); }));
  if (!len(d.cases, 3, 5) || !objArr(d.cases, 3)) E(tag + 'cases 需 3~5 个');
  else d.cases.forEach((x, i) => ['who', 'what', 'lesson'].forEach((k) => { if (!isStr(x[k])) E(tag + 'cases[' + i + '].' + k + ' 缺失'); }));
  if (!len(d.cqAngle, 2, 4) || !strArr(d.cqAngle, 2)) E(tag + 'cqAngle 需 2~4 条');
  if (!len(d.webFitSummary, 4, 6) || !strArr(d.webFitSummary, 4)) E(tag + 'webFitSummary 需 4~6 条');
  if (!len(d.offlineSummary, 4, 6) || !strArr(d.offlineSummary, 4)) E(tag + 'offlineSummary 需 4~6 条');
  if (!len(d.forms, 3, 5) || !strArr(d.forms, 3)) E(tag + 'forms 需 3~5 条');
  const m = d.mvp || {};
  for (const k of ['loop', 'tables', 'trust', 'interviewees', 'questions', 'metrics'])
    if (!(k in m)) E(tag + 'mvp.' + k + ' 缺失');
  if (isStr(m.loop) && (!len(m.tables, 2, 8) || !strArr(m.tables, 2))) E(tag + 'mvp.tables 需 2~8 条');
  if (!len(m.trust || [], 2, 6) || !strArr(m.trust, 2)) E(tag + 'mvp.trust 需 2~6 条');
  if (!len(m.interviewees || [], 2, 6) || !strArr(m.interviewees, 2)) E(tag + 'mvp.interviewees 需 2~6 条');
  if (!len(m.questions || [], 8, 12) || !strArr(m.questions, 8)) E(tag + 'mvp.questions 需 8~12 条');
  if (!len(m.metrics || [], 2, 6) || !strArr(m.metrics, 2)) E(tag + 'mvp.metrics 需 2~6 条');
  // banned words
  const ban = (s, where) => { if (typeof s === 'string') BAN.forEach((w) => { if (s.includes(w)) E(tag + where + ' 含空话词 "' + w + '"'); }); };
  const walk = (v, where) => {
    if (typeof v === 'string') ban(v, where);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, where + '[' + i + ']'));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, where + '.' + k));
  };
  walk(d, 'root');
  return errs;
}

const files = process.argv[2]
  ? fs.readdirSync(DIR).filter((f) => f.startsWith(process.argv[2] + '-'))
  : fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
if (!files.length) { console.log('没有找到 JSON 文件' + (process.argv[2] ? '（序号 ' + process.argv[2] + '）' : '')); process.exit(1); }
let bad = 0;
for (const f of files) {
  const errs = checkFile(f);
  if (errs.length) { bad++; errs.forEach((e) => console.log('FAIL ' + e)); }
  else {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    console.log('PASS ' + f + '  场景' + d.scenarios.length + ' 角色' + d.roles.length + ' 工具' + d.tools.length);
  }
}
console.log(bad ? '\n' + bad + '/' + files.length + ' 个文件未通过' : '\n全部 ' + files.length + ' 个文件 PASS');
process.exit(bad ? 1 : 0);
