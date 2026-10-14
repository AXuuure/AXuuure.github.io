# 内容分类体系重构（题材单层）设计 v2

- 日期：2026-10-13（2026-10-14 修订：撤销「体裁」层）
- 分支：`refactor/content-taxonomy`（从 `main` 的 `e64b8b2` 分出）
- 状态：v2 已定稿，实施计划已按 v2 重写

> **v2 变更说明**：v1 采用「题材 × 体裁」两层结构（第二层固定为 `concept` 知识概念 / `method` 方法论）。
> 经评审，用户判定**没有必要区分体裁，统一当作博客即可**，因此 v2 **删除体裁层**：
> 分类只保留「题材」一层，`src/content/post/<题材>/` 下的第二层起允许自由嵌套子目录。
> 已按 v1 落地的代码与内容需按本文件返工。

## 1. 背景与目标

站点原先把全部正式文章平铺在 `src/content/post/` 下，只有"集合"（`post` / `note`）和"标签"两个扁平维度。文章类型将继续扩展到专栏、随笔、方法论、知识概念等多种形态，平铺结构无法承载。

**目标**：建立**单层「题材（领域）」结构**，让文章有稳定的归属位置，并长出可导航的题材页（接近知识库的浏览体验）。

**不做**：体裁层（写作形态分类）、全站树状侧边栏、知识图谱、双向链接、搜索改造、旧 URL 重定向。

## 2. 决策摘要

| # | 决策 | 结论 |
|---|---|---|
| 1 | 层级骨架 | **单层：第一层为题材（领域）**；第二层起自由嵌套子目录 |
| 2 | ~~体裁层~~ | **已删除**（v1 的 `concept` / `method` 不再存在） |
| 3 | 题材清单 | 5 个：`agent` / `engineering` / `library` / `industry` / `meta` |
| 4 | 题材合并 | `tooling` + `knowledge` 合并为 `library`（资料库）：外部工具 + 我的方法 |
| 5 | 已删除 | `career`（暂不需要）、`frontend`（并入 `engineering`） |
| 6 | 思考 / 记录 | 收进随笔集合（不占题材） |
| 7 | `note` 集合 | **重命名为 `essay`（随笔）**，独立存在、扁平、不挂题材 |
| 8 | 专栏 | 保持为**横切标记**（frontmatter 字段），不进目录层级；补一个 `/series/` 汇总页 |
| 9 | `meta` 定位 | 网站自身的建设与迭代（含主题用法、语法演示） |
| 10 | 分类真相来源 | **目录路径是唯一真相**，不加 `topic` frontmatter 字段 |
| 11 | 断言 | 题材不在白名单时**构建期报错** |
| 12 | 全局导航 | 题材**不进** Header，统一收进 `/posts/` |
| 13 | 标签 | 降级为细粒度关键词，移除 `/posts/` 的标签云侧栏 |
| 14 | slug 语言 | 目录与文件名用英文 slug，导航上显示中文名 |
| 15 | 旧 URL | 不做重定向（站点刚上线、旧内容以示例文为主） |

## 3. 目录骨架与 URL 契约

```
src/content/
├── post/                          正式文章：第一层是题材，第二层起自由嵌套
│   ├── agent/                     智能体
│   │   ├── long-term-memory.md
│   │   └── memory-layering.md
│   ├── engineering/               软件工程
│   ├── library/                   资料库
│   ├── industry/                  产业思考
│   └── meta/                      本站与主题
│       ├── citrus-docs/           自由嵌套子目录：intro.md / theme.md / setup.md
│       ├── markdown-elements/     index.md / admonistions.md
│       └── headings.md  deepseek.md  …
│
├── essay/                         随笔（原 note）：思考、记录、碎想，扁平
│   └── why-i-blog.md
│
└── series/                        专栏元数据（横切，不进层级）
```

**URL 契约**

| 页面 | URL | 说明 |
|---|---|---|
| 博客中枢 | `/posts/` | 题材导航卡片 + 按年列表 + 分页 |
| 题材页 | `/posts/agent/` | 该题材下的全部文章，按日期倒序 |
| 文章页 | `/posts/agent/long-term-memory/` | 正文 + 面包屑 + 同题材文章 |
| 文章页（嵌套） | `/posts/meta/citrus-docs/intro/` | 子目录不影响页面规则，只是 URL 更深 |
| 随笔 | `/essays/`、`/essays/<id>/` | 扁平，不挂题材 |
| 专栏 | `/series/`、`/series/<id>/` | 汇总页（新增）+ 有序目录页（现有） |

## 4. 题材定义

| slug | 中文名 | 界定 | 边界规则 |
|---|---|---|---|
| `agent` | 智能体 | LLM 应用、长期记忆机制、检索增强、上下文工程、评测 | 讲产业/走向判断 → `industry` |
| `engineering` | 软件工程 | 系统设计、分布式、消息队列、数据库、可靠性、安全与凭证、前后端实现 | 讲工具怎么用、效率怎么提 → `library` |
| `library` | 资料库 | 外部工具（编辑器、CLI、插件、自动化脚本、AI 辅助编码）+ 我的方法（笔记体系、写作、学习法） | 讲系统本身怎么设计 → `engineering` |
| `industry` | 产业思考 | 行业与技术走向的判断与推演、业务演化 | 讲机制和实现 → `agent`；个人化随想 → 随笔集合 `essay` |
| `meta` | 本站与主题 | 网站自身的建设与迭代、Astro/Citrus 主题用法、Markdown 语法演示 | 任何真实题材内容都不应放这里 |

**判定方式**：先问"它属于哪个问题域" → 定题材。题材都不匹配时，说明题材清单该扩充，而不是硬塞。
**展示顺序**：`TOPICS` 数组顺序即中枢页卡片顺序，`meta` 固定置末（避免主题自身内容稀释导航）。

## 5. 单一真相来源与构建期断言

`src/data/taxonomy.ts` 承载题材白名单、中文显示名、界定文案与解析函数。

```ts
// 题材定义：slug 与中文显示名一一对应；数组顺序即导航展示顺序
export const TOPICS = [{ slug: "agent", label: "智能体", description: "…" }, /* … */] as const;

// 从文章 id 解析题材；id 第一段固定是题材，形如 "meta/citrus-docs/intro"
export function parseTopic(id: string): TopicSlug {
	const [topic = ""] = id.split("/");
	assertValidTopic(topic);   // 不在白名单 → 构建期抛错
	return topic;
}
```

约束：

- 目录写错时**构建失败**，而不是静默产出孤儿页面；
- 题材 slug 与任何既有页面路径（`/posts/`、`/essays/`、`/series/`）不得撞名，由人工在扩充清单时保证（v2 已无体裁层，不再需要体裁互斥断言）。

## 6. 页面清单与改动

```
现状                          目标
──────────────────────────────────────────────────────────────
/posts/    年份列表+标签云    /posts/            顶部题材导航 + 保留年份列表与分页
                              /posts/agent/       ← 新增：题材页
/notes/    扁平列表           /essays/            改名与文案
/notes/xxx/                   /essays/xxx/
/posts/citrus-docs/intro/     /posts/meta/citrus-docs/intro/   URL 变深
```

- **全局导航**：`menuLinks`（Header 桌面端、Header 移动抽屉、Footer 三处共用）保持 4 项，仅「笔记」改为「随笔」指向 `/essays/`；题材不进导航。
- **`/posts/` 中枢页**：顶部 5 张题材卡片（题材名 + 篇数 + 界定句），只在第 1 页出现，分页后的页面不重复；下方保留现有按年分组列表与分页。
- **题材页**：新增静态路由 `/posts/<题材>/`，从 `getCollection` 聚合，单列表、按日期倒序，无需额外字段。
- **文章页**：`BlogPost.astro` 增加面包屑（博客 / 题材 / 标题）与"同题材其它文章"列表。
- **标签**：保留字段与 `/tags/` 页面，但从 `/posts/` 侧栏移除标签云，导航权交给题材体系。

## 7. 专栏（横切标记）

专栏表达的是**阅读顺序**，与题材正交，因此不进目录层级：

- 文章仍落在 `<题材>/…` 下，仅在 frontmatter 保留 `seriesId` 与 `orderInSeries`；
- `/series/<id>/` 继续作为有序目录页（现有 `SeriesLayout`）；
- 新增 `/series/` 汇总页，列出全部专栏；
- 一篇文章只占一个分类位置，专栏是叠加的阅读线，现有机制零改动。

## 8. 示例文章迁移（逐文件映射）

现有 19 篇 `post` 内容全部是主题自带演示文，统一归入 `meta` 题材（或按内容归入真实题材）。
下表的"现路径"是 **v1 落地后**的位置，v2 要求再上提一层（删掉 `concept/` / `method/` 这一段）。

| 现路径（v1） | 目标路径（v2） | 目标 URL |
|---|---|---|
| `post/meta/concept/citrus-docs/intro.md` | `post/meta/citrus-docs/intro.md` | `/posts/meta/citrus-docs/intro/` |
| `post/meta/concept/citrus-docs/theme.md` | `post/meta/citrus-docs/theme.md` | 同上规律 |
| `post/meta/method/citrus-docs/setup.md` | `post/meta/citrus-docs/setup.md` | 同上规律 |
| `post/meta/concept/markdown-elements/index.md` | `post/meta/markdown-elements/index.md` | 同上规律 |
| `post/meta/concept/markdown-elements/admonistions.md` | `post/meta/markdown-elements/admonistions.md` | 同上规律 |
| `post/meta/concept/hello-world/index.md` | `post/meta/hello-world/index.md` | 同上规律 |
| `post/meta/concept/cover-image/index.md` | `post/meta/cover-image/index.md` | 同上规律 |
| `post/meta/concept/headings.md` | `post/meta/headings.md` | 同上规律 |
| `post/meta/concept/long-title.md` | `post/meta/long-title.md` | 同上规律 |
| `post/meta/concept/social-image.md` | `post/meta/social-image.md` | 同上规律 |
| `post/meta/concept/webmentions.md` | `post/meta/webmentions.md` | 同上规律 |
| `post/meta/concept/unique-tags.md` | `post/meta/unique-tags.md` | 同上规律 |
| `post/meta/concept/post-without-tags.md` | `post/meta/post-without-tags.md` | 同上规律 |
| `post/meta/concept/missing-content.md` | `post/meta/missing-content.md` | 同上规律 |
| `post/meta/concept/draft-post.md` | `post/meta/draft-post.md` | 同上规律（`draft: true` 保留） |
| `post/meta/concept/deepseek.md` | `post/meta/deepseek.md` | AI 助手演示文（自我介绍与代码示例） |
| `post/library/concept/transfonter.md` | `post/library/transfonter.md` | 字体子集工具，归资料库 |
| `post/library/concept/remark-rehype.md` | `post/library/remark-rehype.md` | 归资料库 |
| `post/library/method/local-gitignore/index.md` | `post/library/local-gitignore/index.md` | 归资料库 |

迁移后题材分布：`meta` 16 篇、`library` 3 篇；`agent` / `engineering` / `industry` 在 v2 落地时**各有 1–2 篇用于预览的示范文档**（非正式内容，正式内容待补）。

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
4. **第一层必须是合法题材**，第二层起可自由嵌套子目录，用于不宜单篇成目录的内容（如 `citrus-docs/`）。

## 10. 风险

| 风险 | 影响 | 处理 |
|---|---|---|
| URL 全部变深，旧链接 404 | 低（站点新、内容以示例为主） | 不做重定向，明确接受 |
| `note` → `essay` 改名牵动 8 处 | 中，易漏改 | 按第 8 节清单逐项改，`astro build` 兜底 |
| 题材写错目录 | 中，会静默产出孤儿页面 | 第 5 节构建期断言 |
| 硬编码站内链接 | 中，易漏 | 实施时全量 grep `/posts/` 与 `/notes/` |
| `library` 界定宽，容易变成新杂物间 | 中 | 题材卡片按固定顺序排列，题材页与卡片写明一句界定 |
| `meta` 题材稀释导航 | 低 | `TOPICS` 中 `meta` 置末 |
| 第二层起自由嵌套无约束，可能长出随意目录 | 低 | 嵌套子目录仅用于"同一主题的多篇"，不用于替代题材 |

## 11. 验收标准

1. `npx astro build` 通过，页面数与新增路由相符，无孤立页面；
2. `/posts/` 显示 5 张题材卡片（题材名 + 篇数 + 界定句），`/posts/meta/`、`/posts/library/`、`/posts/agent/` 可访问且内容聚合正确；
3. 题材下无文章时对应题材页须优雅处理（不报错、不产出空页面、显示兜底文案、卡片计数为 0）；
4. 逐篇抽查迁移后的文章 URL，返回 200；
5. `/essays/` 与 `/essays/<id>/` 正常，站点内不再出现 `/notes/` 链接；
6. 故意把一篇文章放进非法题材目录时，构建报错（断言生效）；
7. 面包屑与"同题材其它文章"在文章页正确渲染；
8. 站点内**不存在** `/posts/concept/` 与 `/posts/method/` 这两个页面（体裁层已删除）；
9. 明暗主题、ClientRouter 导航、悬浮播放器、Giscus 评论均无回归。

## 12. 实施顺序概览

1. **返工：撤销体裁层** —— 内容目录整体上提一层；`taxonomy.ts` 去掉体裁；题材页路由去掉体裁页与分组；题材卡片去掉细分计数；
2. 新增 `src/data/taxonomy.ts` 的题材白名单 + 断言（与第 1 步合并）；
3. `note` → `essay` 全量改名（集合、路由、组件、类型、导航、文案、硬编码链接）；
4. 9 篇演示文补 `demo` 标签；
5. `/posts/` 中枢页题材卡片 + 移除标签云；
6. 文章页加面包屑与同题材文章；
7. 新增 `/series/` 汇总页；
8. 全站回归验证。
