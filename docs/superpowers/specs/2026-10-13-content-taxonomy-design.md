# 内容分类体系重构（题材 × 体裁）设计

- 日期：2026-10-13（2026-10-14 修订题材清单）
- 分支：`refactor/content-taxonomy`（从 `main` 的 `e64b8b2` 分出）
- 状态：设计已定稿，待写实施计划

## 1. 背景与目标

站点当前把全部正式文章平铺在 `src/content/post/` 下，只有"集合"（`post` / `note`）和"标签"两个扁平维度。文章类型将扩展到专栏、随笔、方法论、知识概念、工作流程总结等多种形态，平铺结构无法承载。

**目标**：建立「题材（领域）× 体裁（写作形态）」的两层结构，让文章有稳定的归属位置，并长出可导航的层级页面（接近知识库的浏览体验）。

**不做**：全站树状侧边栏、知识图谱、双向链接、搜索改造、旧 URL 重定向。

## 2. 决策摘要

| # | 决策 | 结论 |
|---|---|---|
| 1 | 层级骨架 | **第一层题材（领域）、第二层体裁**（用户明确纠正过顺序） |
| 2 | 线索深度 | 前两层固定，**第 3 层起允许自由嵌套子目录** |
| 3 | 题材清单 | 5 个：`agent` / `engineering` / `library` / `industry` / `meta` |
| 4 | 体裁清单 | 2 个：`concept` / `method` |
| 5 | 题材合并 | `tooling` + `knowledge` 合并为 `library`（资料库）：外部工具 + 我的方法 |
| 6 | 已删除 | `career`（暂不需要）、`frontend`（并入 `engineering`） |
| 7 | `workflow` | 并入 `method`（工作流程总结本就是方法论的一种） |
| 8 | 思考 / 记录 | 不占体裁层，**收进随笔集合** |
| 9 | `note` 集合 | **重命名为 `essay`（随笔）**，独立存在、扁平、不挂题材 |
| 10 | 专栏 | 保持为**横切标记**（frontmatter 字段），不进目录层级；补一个 `/series/` 汇总页 |
| 11 | `meta` 定位 | 不是"演示文杂物间"，而是**网站自身的建设与迭代**（含主题用法、语法演示） |
| 12 | 分类真相来源 | **目录路径是唯一真相**，不加 `topic`/`kind` frontmatter 字段 |
| 13 | 断言 | 题材不在白名单、体裁非法、slug 撞名时**构建期报错** |
| 14 | 全局导航 | 题材**不进** Header，统一收进 `/posts/` |
| 15 | 标签 | 降级为细粒度关键词，移除 `/posts/` 的标签云侧栏 |
| 16 | 页面上限 | `/posts/<题材>/` 与 `/posts/<体裁>/` 同为单段路径，靠断言防撞名 |
| 17 | slug 语言 | 目录与文件名用英文 slug，导航上显示中文名 |
| 18 | 旧 URL | 不做重定向（站点刚上线、旧内容以示例文为主） |

## 3. 目录骨架与 URL 契约

```
src/content/
├── post/                          正式文章：题材 × 体裁
│   ├── agent/                     智能体
│   │   ├── concept/               知识概念
│   │   │   └── long-term-memory.md
│   │   └── method/                方法论
│   │       └── memory-layering.md
│   ├── engineering/               软件工程（后端、前端、系统设计、可靠性）
│   ├── library/                   资料库（外部工具 + 我的方法）
│   ├── industry/                  产业思考（行业与技术走向的判断、推演）
│   └── meta/                      本站与主题（网站建设与迭代、主题用法、语法演示）
│
├── essay/                         随笔（原 note）：思考、记录、碎想
│   └── why-i-blog.md
│
└── series/                        专栏元数据（横切，不进层级）
```

**URL 契约**

| 页面 | URL | 说明 |
|---|---|---|
| 博客中枢 | `/posts/` | 题材导航卡片 + 按年列表 + 分页 |
| 题材页 | `/posts/agent/` | 题材内按体裁分两组 |
| 体裁页 | `/posts/method/` | 跨题材的同一体裁 |
| 文章页 | `/posts/agent/concept/long-term-memory/` | 正文 + 面包屑 + 同题材文章 |
| 随笔 | `/essays/`、`/essays/<id>/` | 扁平，不挂题材 |
| 专栏 | `/series/`、`/series/<id>/` | 汇总页（新增）+ 有序目录页（现有） |

## 4. 分类定义

**题材（第一层）**

| slug | 中文名 | 界定 | 边界规则 |
|---|---|---|---|
| `agent` | 智能体 | LLM 应用、长期记忆机制、检索增强、上下文工程、评测 | 讲产业/走向判断 → `industry` |
| `engineering` | 软件工程 | 系统设计、分布式、消息队列、数据库、可靠性、安全与凭证、前后端实现 | 讲工具怎么用、效率怎么提 → `library` |
| `library` | 资料库 | 外部工具（编辑器、CLI、插件、自动化脚本、AI 辅助编码）+ 我的方法（笔记体系、写作、学习法） | 讲系统本身怎么设计 → `engineering` |
| `industry` | 产业思考 | 行业与技术走向的判断与推演、业务演化 | 讲机制和实现 → `agent`；个人化随想 → 随笔集合 `essay` |
| `meta` | 本站与主题 | 网站自身的建设与迭代、Astro/Citrus 主题用法、Markdown 语法演示 | 任何真实题材内容都不应放这里 |

**体裁（第二层）**

| slug | 中文名 | 界定 |
|---|---|---|
| `concept` | 知识概念 | 解释"是什么"，建立认知 |
| `method` | 方法论 | 给出一套可复用的做法（含工作流程总结、复盘） |

**判定顺序**：先问"这是哪种写作承诺" → 定体裁；再问"它属于哪个问题域" → 定题材。两者都不匹配时，说明题材清单该扩充，而不是硬塞。

## 5. 单一真相来源与构建期断言

新增 `src/data/taxonomy.ts`，承载题材/体裁白名单、中文显示名与解析函数。

```ts
// 题材定义：slug 与中文显示名一一对应，导航上显示中文名、URL 用 slug
export const TOPICS = [
  { slug: "agent", label: "智能体" },
  // … 其余题材同理
] as const;

// 从文章 id 解析题材与体裁；id 形如 "agent/concept/long-term-memory"
export function parseTaxonomy(id: string): { topic: string; kind: string } {
  const [topic, kind] = id.split("/"); // 前两段固定是题材与体裁
  // 题材不在白名单、或体裁不是 concept/method 时直接抛错，
  // 保证"目录写错 → 构建失败"，而不是静默产出孤儿页面
  assertValidTopic(topic);
  assertValidKind(kind);
  return { topic, kind };
}
```

约束：

- 题材 slug **不得**等于 `concept` 或 `method`，否则 `/posts/<题材>/` 与 `/posts/<体裁>/` 撞车；
- 该约束由构建期断言强制，不靠人工记忆。

## 6. 页面清单与改动

```
现状                          目标
──────────────────────────────────────────────────────────────
/posts/    年份列表+标签云    /posts/            顶部题材导航 + 保留年份列表与分页
                              /posts/agent/       ← 新增：题材页
                              /posts/method/      ← 新增：体裁页
/notes/    扁平列表           /essays/            改名与文案
/notes/xxx/                   /essays/xxx/
/posts/citrus-docs/intro/     /posts/meta/concept/citrus-docs/intro/   URL 变深
```

- **全局导航**：`menuLinks`（Header 桌面端、Header 移动抽屉、Footer 三处共用）保持 4 项，仅「笔记」改为「随笔」指向 `/essays/`；题材不进导航。
- **`/posts/` 中枢页**：顶部 5 张题材卡片（含篇数、按体裁的细分计数），只在第 1 页出现，分页后的页面不重复；下方保留现有按年分组列表与分页。
- **题材页 / 体裁页**：新增两级静态路由，从 `getCollection` 聚合，无需额外字段。
- **文章页**：`BlogPost.astro` 增加面包屑（博客 / 题材 / 体裁 / 标题）与"同题材其它文章"列表。
- **标签**：保留字段，但从 `/posts/` 侧栏移除标签云，导航权交给题材体系。

## 7. 专栏（横切标记）

专栏不是体裁，它表达的是**阅读顺序**，与"题材/体裁"正交，因此不进目录层级：

- 文章仍落在 `<题材>/<体裁>/` 下，仅在 frontmatter 保留 `seriesId` 与 `orderInSeries`；
- `/series/<id>/` 继续作为有序目录页（现有 `SeriesLayout`）；
- 新增 `/series/` 汇总页，列出全部专栏；
- 一篇文章只占一个分类位置，专栏是叠加的阅读线，现有机制零改动。

## 8. 示例文章迁移（逐文件映射）

现有 19 篇 `post` 内容全部是主题自带演示文，统一归入 `meta` 题材（或按内容归入真实题材）。

| 现路径 | 目标路径 | 目标 URL |
|---|---|---|
| `post/citrus-docs/intro.md` | `post/meta/concept/citrus-docs/intro.md` | `/posts/meta/concept/citrus-docs/intro/` |
| `post/citrus-docs/theme.md` | `post/meta/concept/citrus-docs/theme.md` | 同上规律 |
| `post/citrus-docs/setup.md` | `post/meta/method/citrus-docs/setup.md` | 同上规律 |
| `post/markdown-elements/index.md` | `post/meta/concept/markdown-elements/index.md` | 同上规律 |
| `post/markdown-elements/admonistions.md` | `post/meta/concept/markdown-elements/admonistions.md` | 同上规律 |
| `post/hello-world/index.md` | `post/meta/concept/hello-world/index.md` | 同上规律 |
| `post/cover-image/index.md` | `post/meta/concept/cover-image/index.md` | 同上规律 |
| `post/headings.md` | `post/meta/concept/headings.md` | 同上规律 |
| `post/long-title.md` | `post/meta/concept/long-title.md` | 同上规律 |
| `post/social-image.md` | `post/meta/concept/social-image.md` | 同上规律 |
| `post/webmentions.md` | `post/meta/concept/webmentions.md` | 同上规律 |
| `post/unique-tags.md` | `post/meta/concept/unique-tags.md` | 同上规律 |
| `post/post-without-tags.md` | `post/meta/concept/post-without-tags.md` | 同上规律 |
| `post/missing-content.md` | `post/meta/concept/missing-content.md` | 同上规律 |
| `post/draft-post.md` | `post/meta/concept/draft-post.md` | 同上规律（`draft: true` 保留） |
| `post/deepseek.md` | `post/meta/concept/deepseek.md` | AI 助手演示文（自我介绍与代码示例），与「主题自带演示文」同类 |
| `post/transfonter.md` | `post/library/concept/transfonter.md` | 字体子集工具，归资料库 |
| `post/remark-rehype.md` | `post/library/concept/remark-rehype.md` | 归资料库 |
| `post/local-gitignore/index.md` | `post/library/method/local-gitignore/index.md` | 归资料库 |

迁移后题材分布：`meta` 16 篇、`library` 3 篇，其余 3 个题材（`agent`/`engineering`/`industry`）为空。

其中 9 篇纯语法/样式演示文（`headings`、`long-title`、`cover-image`、`social-image`、`webmentions`、`unique-tags`、`post-without-tags`、`missing-content`、`draft-post`）额外打 `demo` 标签，用于与题材内真正的"站务文章"区分，目录位置不变。

随笔集合：

| 现路径 | 目标路径 |
|---|---|
| `note/welcome.md` | `essay/welcome.md` |
| `note/wake-up.md` | `essay/wake-up.md` |
| `note/resume-f-method.md` | `essay/resume-f-method.md` |

## 9. 命名与写作约定

1. 目录一律英文 slug，导航显示中文名；
2. 文件名用 kebab-case 英文（或拼音），不用中文；文件名即 URL 最后一段；
3. 纯文字用 `xxx.md`；需要放图片的用 `xxx/index.md`（两种并存，与现有内容一致）；
4. 第 3 层起可自由嵌套子目录，用于不宜单篇成目录的内容（如 `citrus-docs/`）。

## 10. 风险

| 风险 | 影响 | 处理 |
|---|---|---|
| URL 全部变深，旧链接 404 | 低（站点新、内容以示例为主） | 不做重定向，明确接受 |
| `note` → `essay` 改名牵动 8 处 | 中，易漏改 | 按第 8 节清单逐项改，`astro build` 兜底 |
| 题材/体裁 slug 撞名 | 中，会静默覆盖页面 | 第 5 节构建期断言 |
| 硬编码站内链接 | 中，易漏 | 实施时全量 grep `/posts/` 与 `/notes/` |
| `library` 界定宽，容易变成新杂物间 | 中 | 题材卡片按固定顺序排列，并在题材页写明一句界定 |
| `meta` 题材稀释导航 | 低 | 题材卡片按固定顺序排列，`meta` 置末 |

## 11. 验收标准

1. `npx astro build` 通过，页面数与新增路由相符，无孤立页面；
2. `/posts/` 显示 5 张题材卡片，`/posts/meta/`、`/posts/library/`、`/posts/method/`（体裁页）可访问且内容聚合正确；
3. 初始迁移后 `agent`/`engineering`/`industry` 题材下**暂无文章**，对应题材页须优雅处理（不报错、不产出空页面，卡片计数为 0 或隐藏该题材）；
4. 逐篇抽查迁移后的文章 URL，返回 200；
5. `/essays/` 与 `/essays/<id>/` 正常，站点内不再出现 `/notes/` 链接；
6. 故意把一篇文章放进非法目录时，构建报错（断言生效）；
7. 面包屑与"同题材其它文章"在文章页正确渲染；
8. 明暗主题、ClientRouter 导航、悬浮播放器、Giscus 评论均无回归。

## 12. 实施顺序概览

供后续实施计划展开，粗粒度如下：

1. 新增 `src/data/taxonomy.ts`（白名单 + 解析 + 断言）；
2. `note` → `essay` 全量改名（集合、路由、组件、类型、导航、文案、硬编码链接）；
3. 迁移 19 篇 `post` 示例文到 `meta`/`library` 归类位置；
4. 新增题材页与体裁页路由；
5. 改造 `/posts/` 为中枢页（题材卡片 + 移除标签云）；
6. 文章页加面包屑与同题材文章；
7. 新增 `/series/` 汇总页；
8. 全站回归验证。
