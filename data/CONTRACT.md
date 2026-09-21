# 行业问题地图 · 数据契约 v2

每个产业一个 JSON 文件：`data/industries/<num>-<id>.json`（如 `13-advanced-materials.json`）。
严格合法 JSON：UTF-8、无注释、无尾逗号、不含 NaN。

**写作铁律**

1. **具体压倒抽象**。禁写"提高效率""降低成本"这类空话；要写成"在 20+ 页 PDF datasheet 里手工比对 RDS(on) 与 Qg"。
2. **不联网**。用你自己的领域知识直接写。不编造：精确财务数字、论文标题、URL、不为人知的企业内幕。
3. 案例只写**公开广为人知的事实**（如"比亚迪半导体自供车规 IGBT"级别），不确定的细节宁可不写。
4. 每个字段 1～2 句话，中文为主，专业术语可带英文缩写。
5. 场景必须来自**真实工作流**（工程师/采购/销售/研究员每天真会遇到的事），不是营销想象。
6. 全站证据立场：所有痛点都是「有产业依据的问题假设，待一线访谈验证」，不是已验证结论。

**完成后自检（必做）**：写完文件运行

```bash
cd /Users/mac/.zcode/workspace/default/industry-atlas && node tools/validate.js <num>
```

按输出修复，直到 `PASS` 才算完成。

## 顶层字段

| 字段 | 类型 | 要求 |
|---|---|---|
| id | string | 与文件名一致，如 `advanced-materials` |
| num | string | 两位序号 `"13"` |
| name | string | 产业名（与任务给定完全一致） |
| cluster | string | 电子信息 / 智能装备 / 先进材料 / 生物医药 / 未来产业 |
| subfields | string[] | 3～6 个细分方向（任务会给官方口径，可补充） |
| core | string | 产业核心在做什么（一句话） |
| keyQuestion | string | 最值得深入研究的一个问题（一句话，可参考任务给定的官方口径） |
| oneLiner | string | 外行导语：这个产业赚什么钱、谁在干活、事卡在哪（1～2 句） |
| typicalUsers | string[] | 4～8 个典型用户 |
| chain | object | 产业链地图，见下 |
| roles | array | 5～9 类用户角色 |
| scenarios | array | **20～24 个真实场景**（本文件的核心资产） |
| tools | array | 6～10 个现有产品/工具 |
| cases | array | 3～5 个真实公开案例 |
| cqAngle | string[] | 2～4 条重庆本地产业锚点（公开事实；该产业重庆确无知名锚点则写全国性锚点并注明） |
| webFitSummary | string[] | 4～6 条：哪些环节适合网站解决 |
| offlineSummary | string[] | 4～6 条：哪些环节不适合网站解决、为什么 |
| forms | string[] | 3～5 条：可做产品形态（信息站/工具站/数据库/选型器/社区/对接平台…） |
| mvp | object | MVP 闭环，见下 |

## chain（产业链地图）

```json
{ "upstream":   [{ "seg": "环节名", "what": "这环节干什么", "players": "代表企业/机构", "note": "卡点或特征" }],
  "midstream":  [ 同上 ],
  "downstream": [ 同上 ] }
```

上/中/下游各 3～5 个环节。

## roles（用户角色地图，5～9 个）

```json
{ "name": "硬件工程师", "who": "在什么企业、负责什么", "kpi": "被考核什么", "dailyTools": "每天用什么干活", "pains": "最常见的卡点" }
```

## scenarios（真实场景，20～24 个）——核心资产

```json
{ "sid": "S01", "title": "一句话场景名", "role": "硬件工程师",
  "trigger": "触发事件：什么情况下会发生",
  "current": "当前做法：现在怎么一步步处理",
  "inputs": "所需输入数据：处理时手上要有什么",
  "params": "决策参数：依据什么判断/取舍",
  "pain": "具体痛点：卡在哪一步、为什么难",
  "freq": "每周", "severity": 4, "cost": "错误成本：做错的代价",
  "alt": "现有替代方案：现在用什么工具/方法凑合",
  "keywords": ["选型", "MOSFET", "datasheet"],
  "webFit": "网站可解", "webHow": "网站形态：若（部分）可解，网站具体做什么",
  "confidence": "中" }
```

- `role` 必须是 roles 里出现过的名字。
- `freq` 枚举：`每日 / 每周 / 每月 / 每季 / 每年 / 偶发`。
- `severity` 整数 1～5（痛感强弱）。
- `webFit` 枚举：`网站可解 / 部分可解 / 必须线下`。
- `confidence` 枚举：`高 / 中 / 低`（证据强度：高=公开资料充分且普遍；中=有产业依据的推断；低=待验证假设）。
- `keywords` 3～6 个（用户真会去搜的词）。
- `webFit=必须线下` 时 `webHow` 写 `"线下原因：<为什么>——网站只能做 <辅助>"`。
- 场景要覆盖不同角色、不同频段、不同 webFit，不要 20 个场景全是同一种。

## tools（现有产品/工具，6～10 个）

```json
{ "name": "立创商城", "type": "垂类平台", "what": "做什么的", "gap": "它没解决什么" }
```

## cases（真实公开案例，3～5 个）

```json
{ "who": "斯达半导", "what": "公开广为人知的事实（1～2 句）", "lesson": "对这份问题地图的含义" }
```

## mvp（MVP 闭环）

```json
{ "loop": "闭环描述：用户来→用什么→留下什么→如何变好",
  "tables": ["需要建设的数据表：如 器件参数库(型号/参数/封装/车规状态)"],
  "trust": ["信任来源：如 原厂 datasheet 原文引用+版本号"],
  "interviewees": ["访谈对象：如 整机厂硬件组长 3～5 人"],
  "questions": ["访谈问题：8～12 条真问题"],
  "metrics": ["验证指标：如 单次选型耗时从 X 降到 Y"] }
```

## 校验规则（tools/validate.js 会硬性检查）

- JSON 可解析；顶层字段齐全
- scenarios 20～24 个、sid 从 S01 连续、role 全部能在 roles 找到
- freq / severity / webFit / confidence 全部合法枚举
- keywords 每条 3～6 个；tools 6～10；cases 3～5；webFitSummary/offlineSummary 4～6；forms 3～5；questions 8～12
- chain 三段各 3～5；roles 5～9；typicalUsers 4～8；cqAngle 2～4
- 禁用空话词：`提高效率`、`降本增效`、`赋能`、`助力`（出现在任意字符串即 FAIL）
