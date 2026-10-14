# 内容分类体系重构（题材单层）实施计划 v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把平铺的 `src/content/post/` 改造成「第一层题材、第二层起自由嵌套」的单层结构，并长出题材页、专栏汇总页与文章页面包屑。

**Architecture:** 目录路径是分类的唯一真相来源；`src/data/taxonomy.ts` 承载题材白名单、中文显示名、界定文案与 `parseTopic` 断言。所有分类页面通过 `parseTopic(post.id)` 从 `getCollection` 的结果就地聚合，不新增任何 frontmatter 字段。`note` 集合整体改名为 `essay`（随笔），保持扁平、不挂题材。专栏继续以横切 frontmatter（`seriesId` / `orderInSeries`）叠加，不进入目录层级。

**Tech Stack:** Astro 5.1.2（static output）· Astro Content Collections + Zod · Tailwind · Pagefind · @astrojs/rss

---

## 执行约定（先读这一段）

1. **本计划是 v2**，已删除 v1 的「体裁」层（`concept` 知识概念 / `method` 方法论）。
   v1 下的 Task 1（taxonomy.ts）、Task 2（内容迁移）、Task 5（题材页/体裁页路由）、Task 6（中枢页）**已经落地**，本 v2 的 Task 1–4 就是对这些产物的**返工**，执行前请先确认磁盘现状再动手。
2. **先确认、后提交**：每个 Task 末尾的 `git commit` 步骤，执行前必须先向用户汇报本 Task 的改动与验证结果，得到确认后再提交。**全程不执行 `git push`**；推送与合并回 `main` 由用户确认后手动完成。
3. **每行代码都要有中文注释**（用户硬性要求）。
4. **分支**：全部改动在 `refactor/content-taxonomy` 分支上。
5. **本仓库没有测试框架**（无 vitest/jest），验证手段为：`npx astro build` 构建期断言 + `curl` 探测路由 + 浏览器人工核对。
6. **dev server 重启坑**：本环境 Vite 文件监听不生效，改动代码后必须杀进程重启再验证：
   ```bash
   ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
   ```
   （`pkill -f` 在本环境不可用。）含方括号的路径在 shell 里必须加引号。
7. **路由共存已实测**：`/posts/[topic]/` 与既有 `/posts/[...page]/` 可共存，`/posts/2/` 在 dev 下返回 200。

## 目标结构（ASCII）

```
src/content/
├── post/                     正式文章：第一层是题材，第二层起自由嵌套
│   ├── agent/                  智能体
│   │   ├── long-term-memory.md
│   │   └── memory-layering.md
│   ├── engineering/            软件工程
│   │   ├── idempotency.md
│   │   └── idempotent-consumer.md
│   ├── library/                资料库
│   │   ├── transfonter.md
│   │   ├── remark-rehype.md
│   │   └── local-gitignore/index.md
│   ├── industry/               产业思考
│   │   └── agent-commoditization.md
│   └── meta/                   本站与主题（16 篇）
│       ├── citrus-docs/        intro.md / theme.md / setup.md
│       ├── markdown-elements/  index.md / admonistions.md
│       ├── hello-world/  cover-image/
│       └── headings.md  deepseek.md  …
├── essay/                    随笔（原 note，扁平、不挂题材）
└── series/                   专栏元数据（横切，不进层级）

路由：
/posts/                     中枢页（5 张题材卡片 + 按年列表 + 分页）
/posts/[topic]/             ← 题材页（5 个）
/posts/<题材>/<…>/          文章页（URL 变深，嵌套子目录只是更深的路径）
/essays/  /essays/<id>/     改名自 /notes/
/series/                    ← 新增：专栏汇总页
/posts/concept/  /posts/method/   ← v2 必须不存在（体裁层已删）
```

## 文件清单

| 动作 | 路径 | 职责 |
|---|---|---|
| 修改 | `src/data/taxonomy.ts` | 去掉 `KINDS` / `assertValidKind`，`parseTaxonomy` → `parseTopic` |
| 迁移 | `src/content/post/**` | 目录整体上提一层，删掉 `concept/` `method/` 段 |
| 删除 | `src/pages/posts/[taxonomy]/index.astro` | v1 的题材页+体裁页合一路由 |
| 新增 | `src/pages/posts/[topic]/index.astro` | v2 题材页（单列表） |
| 新增 | `src/components/blog/TopicCard.astro` | 题材卡片（题材名 + 篇数 + 界定句） |
| 新增 | `src/components/blog/Breadcrumb.astro` | 文章页分类面包屑（三层） |
| 新增 | `src/components/blog/SameTopicPosts.astro` | 文章页「同题材其它文章」 |
| 新增 | `src/pages/series/index.astro` | 专栏汇总页 |
| 修改 | `src/pages/posts/[...page].astro` | 中枢页：题材卡片 + 移除标签云 |
| 修改 | `src/content.config.ts` | 集合 `note` → `essay` |
| 修改 | `src/utils/date.ts` | 排序函数类型 `"note"` → `"essay"` |
| 修改 | `src/site.config.ts` | `menuLinks` 第四项 → 随笔 / `/essays/` |
| 修改 | `src/pages/index.astro` | 首页随笔区块与文案、hero 链接 |
| 修改 | `src/layouts/BlogPost.astro` | 挂载面包屑与同题材文章列表 |
| 改名 | `src/content/note/` → `src/content/essay/` | 随笔内容目录 |
| 改名 | `src/components/note/Note.astro` → `src/components/essay/Essay.astro` | 随笔卡片组件（prop `note`→`essay`） |
| 改名 | `src/pages/notes/*` → `src/pages/essays/*` | 随笔列表 / 详情 / RSS 路由 |

---

## Task 1: `taxonomy.ts` 撤销体裁层

**Files:**
- Modify: `src/data/taxonomy.ts`（v1 已创建，本 Task 重写）

- [ ] **Step 1: 重写文件**

```ts
// 分类体系的唯一真相来源：题材白名单，以及从文章 id 解析题材的函数。
// 约定：目录路径即分类真相，文章 id 形如 "meta/citrus-docs/intro"——
// 第一段固定是题材，第二段起允许自由嵌套（如 citrus-docs/ 这类同主题子目录）。
// v2 说明：已删除 v1 的「体裁」层（concept / method），分类只保留题材一层。

// 题材定义：数组顺序即中枢页卡片与导航的展示顺序，meta（本站与主题）固定置末
export const TOPICS = [
	{
		slug: "agent",
		label: "智能体",
		description: "LLM 应用、长期记忆机制、检索增强、上下文工程、评测。",
	},
	{
		slug: "engineering",
		label: "软件工程",
		description: "系统设计、分布式、消息队列、数据库、可靠性、安全与凭证、前后端实现。",
	},
	{
		slug: "library",
		label: "资料库",
		description: "外部工具（编辑器、CLI、插件、自动化脚本、AI 辅助编码）与我的方法（笔记体系、写作、学习法）。",
	},
	{
		slug: "industry",
		label: "产业思考",
		description: "行业与技术走向的判断与推演、业务演化。",
	},
	{
		slug: "meta",
		label: "本站与主题",
		description: "网站自身的建设与迭代、Astro/Citrus 主题用法、Markdown 语法演示。",
	},
] as const;

// 从定义数组派生的联合字面量类型，供 props 与断言收窄类型使用
export type TopicSlug = (typeof TOPICS)[number]["slug"];

// 运行时判断用的纯字符串数组：题材白名单
const TOPIC_SLUGS: readonly string[] = TOPICS.map((topic) => topic.slug);

// 断言：题材 slug 必须在白名单内。
// 用 asserts 签名让 TS 在调用后把实参收窄为 TopicSlug，同时把「目录写错」变成构建期错误。
export function assertValidTopic(topic: string): asserts topic is TopicSlug {
	if (!TOPIC_SLUGS.includes(topic)) {
		throw new Error(
			`非法的题材目录 "${topic}"：允许的题材仅有 ${TOPIC_SLUGS.join(" / ")}。` +
				`文章必须放在 src/content/post/<题材>/… 下。`,
		);
	}
}

// 从文章 id 解析题材；id 第一段固定是题材
export function parseTopic(id: string): TopicSlug {
	const [topic = ""] = id.split("/");
	// 非法目录直接抛错，保证构建失败而不是静默产出孤儿页面
	assertValidTopic(topic);
	return topic;
}

// 通过题材 slug 取其中文显示名（断言已保证 slug 合法，回退分支仅作类型收尾）
export function getTopicLabel(slug: string): string {
	return TOPICS.find((topic) => topic.slug === slug)?.label ?? slug;
}

// 通过题材 slug 取界定文案，供题材页与题材卡片展示一句说明
export function getTopicDescription(slug: string): string {
	return TOPICS.find((topic) => topic.slug === slug)?.description ?? "";
}
```

- [ ] **Step 2: 确认体裁相关符号已被彻底移除**

Run: `grep -rn "KINDS\|assertValidKind\|parseTaxonomy\|KindSlug\|getKindLabel" src/ | grep -v "taxonomy.ts" || echo "无残留"`
Expected: 打印 `无残留`。若仍有命中，说明还有页面在引用 v1 的体裁 API，必须在本 Task 一并清掉（这些页面在 Task 3、Task 4 会被重写，若此时命中属正常，等到 Task 3/4 完成后再复查）。

- [ ] **Step 3: 类型检查**

Run: `npx astro check 2>&1 | tail -20`
Expected: `taxonomy.ts` 本身无报错。（v1 遗留的页面此刻引用了不存在的 `KINDS` 等符号会报错，属预期，Task 3/4 修完后应清零。既有历史错误 `src/pages/og-image/[...slug].[ext].ts` 的 `Buffer`/`BodyInit` 不计入。）

- [ ] **Step 4: Commit（先向用户确认）**

```bash
git add src/data/taxonomy.ts
git commit -m "refactor: taxonomy 撤销体裁层，仅保留题材白名单"
```

---

## Task 2: 内容目录整体上提一层（删掉 concept / method 段）

**Files:**
- Move: `src/content/post/**` —— 把 `concept/` `method/` 从路径中删掉

- [ ] **Step 1: 先把已在 v1 落地的两层目录上提**

```bash
# meta 题材：concept/ 与 method/ 同时上提，citrus-docs/ 这类同主题子目录保留
git mv src/content/post/meta/concept/citrus-docs src/content/post/meta/citrus-docs
git mv src/content/post/meta/method/citrus-docs/setup.md src/content/post/meta/citrus-docs/setup.md
git mv src/content/post/meta/concept/markdown-elements src/content/post/meta/markdown-elements
git mv src/content/post/meta/concept/hello-world src/content/post/meta/hello-world
git mv src/content/post/meta/concept/cover-image src/content/post/meta/cover-image
git mv src/content/post/meta/concept/deepseek.md src/content/post/meta/deepseek.md
git mv src/content/post/meta/concept/headings.md src/content/post/meta/headings.md
git mv src/content/post/meta/concept/long-title.md src/content/post/meta/long-title.md
git mv src/content/post/meta/concept/social-image.md src/content/post/meta/social-image.md
git mv src/content/post/meta/concept/webmentions.md src/content/post/meta/webmentions.md
git mv src/content/post/meta/concept/unique-tags.md src/content/post/meta/unique-tags.md
git mv src/content/post/meta/concept/post-without-tags.md src/content/post/meta/post-without-tags.md
git mv src/content/post/meta/concept/missing-content.md src/content/post/meta/missing-content.md
git mv src/content/post/meta/concept/draft-post.md src/content/post/meta/draft-post.md
rmdir src/content/post/meta/concept src/content/post/meta/method

# library 题材
git mv src/content/post/library/concept/transfonter.md src/content/post/library/transfonter.md
git mv src/content/post/library/concept/remark-rehype.md src/content/post/library/remark-rehype.md
git mv src/content/post/library/method/local-gitignore src/content/post/library/local-gitignore
rmdir src/content/post/library/concept src/content/post/library/method
```

- [ ] **Step 2: 把示范文档（预览用，非正式内容）也上提**

```bash
git mv src/content/post/agent/concept/long-term-memory.md src/content/post/agent/long-term-memory.md 2>/dev/null || \
  mv src/content/post/agent/concept/long-term-memory.md src/content/post/agent/long-term-memory.md
git mv src/content/post/agent/method/memory-layering.md src/content/post/agent/memory-layering.md 2>/dev/null || \
  mv src/content/post/agent/method/memory-layering.md src/content/post/agent/memory-layering.md
git mv src/content/post/engineering/concept/idempotency.md src/content/post/engineering/idempotency.md 2>/dev/null || \
  mv src/content/post/engineering/concept/idempotency.md src/content/post/engineering/idempotency.md
git mv src/content/post/engineering/method/idempotent-consumer.md src/content/post/engineering/idempotent-consumer.md 2>/dev/null || \
  mv src/content/post/engineering/method/idempotent-consumer.md src/content/post/engineering/idempotent-consumer.md
git mv src/content/post/industry/concept/agent-commoditization.md src/content/post/industry/agent-commoditization.md 2>/dev/null || \
  mv src/content/post/industry/concept/agent-commoditization.md src/content/post/industry/agent-commoditization.md
rmdir src/content/post/agent/concept src/content/post/agent/method \
      src/content/post/engineering/concept src/content/post/engineering/method \
      src/content/post/industry/concept
```

- [ ] **Step 3: 校验目录形状与篇数**

Run:
```bash
find src/content/post -type d | sort
echo "--- md 计数 ---"
find src/content/post -name "*.md" | wc -l
echo "--- 是否还有 concept/method 段 ---"
find src/content/post -type d -name "concept" -o -type d -name "method" | wc -l
```
Expected: md 计数 **24**（19 迁移 + 5 示范）；最后一条输出 **0**（目录里不再有 `concept` / `method`）。

- [ ] **Step 4: 构建验证（此时页面还在用 v1 API，构建会报错属预期）**

Run: `npx astro build 2>&1 | tail -5`
Expected: 此时可能因 Task 3/4 尚未完成而报错（页面仍引用 v1 的体裁 API）。**若报错，记录错误信息但不必修**，Task 3、Task 4 完成后重跑。若构建直接成功，也属正常（说明页面尚未引用体裁符号）。

- [ ] **Step 5: Commit（先向用户确认）**

```bash
git add -A src/content/post
git commit -m "refactor: 内容目录上提一层，撤销 concept/method 体裁层"
```

---

## Task 3: 题材页路由：删掉体裁页与分组

**Files:**
- Delete: `src/pages/posts/[taxonomy]/index.astro`（v1 产物）
- Create: `src/pages/posts/[topic]/index.astro`

- [ ] **Step 1: 删除 v1 的合一路由（它没有目录冲突，因此不会影响 `/posts/2/`）**

```bash
rm -rf "src/pages/posts/[taxonomy]"
```

- [ ] **Step 2: 新建 v2 题材页路由**

```astro
---
// /posts/<题材>/ ：单个题材页，列出该题材下的全部文章（按发布日期倒序）。
// v2 说明：已删除 v1 的「体裁页」分支与「按体裁分两组」逻辑，题材内只有一个列表。
// 题材 slug 由 taxonomy.ts 断言保证合法，非法目录会在构建期抛错。
import PostPreview from "@/components/blog/PostPreview.astro";
import PageLayout from "@/layouts/Base.astro";
import { getAllPosts } from "@/data/post";
import { collectionDateSort } from "@/utils/date";
import { TOPICS, getTopicDescription, getTopicLabel, parseTopic } from "@/data/taxonomy";
import type { GetStaticPaths } from "astro";

export const getStaticPaths = (async () => {
	// 每个题材生成一个页面（共 5 个）
	return TOPICS.map((topic) => ({
		params: { topic: topic.slug },
		// 断言已保证 slug 合法，这里显式收窄成 string 便于 props 解构
		props: { slug: topic.slug as string },
	}));
}) satisfies GetStaticPaths;

interface Props {
	// 当前题材 slug
	slug: string;
}

const { slug } = Astro.props;

// 取全部已发布文章（生产构建会自动剔除草稿）
const allPosts = await getAllPosts();

// 当前题材下的文章，按发布日期倒序
const pagePosts = allPosts.filter((post) => parseTopic(post.id) === slug).sort(collectionDateSort);

// 页面标题与界定文案，均取自 taxonomy.ts 的单一真相来源
const title = getTopicLabel(slug);
const topicDescription = getTopicDescription(slug);

const meta = {
	description: `${title}题材下的全部文章。${topicDescription}`,
	title,
};
---

<PageLayout meta={meta}>
	<!-- 面包屑：博客 / 题材 / 当前题材 -->
	<nav aria-label="面包屑" class="mb-4 flex flex-wrap items-center gap-x-1 text-sm text-lighter">
		<a class="hover:text-accent-two" href="/posts/">博客</a>
		<span aria-hidden="true">/</span>
		<span>题材</span>
		<span aria-hidden="true">/</span>
		<span class="text-textColor">{title}</span>
	</nav>

	<h1 class="title mb-4">{title}</h1>

	{topicDescription && <p class="prose mb-8 max-w-none text-light">{topicDescription}</p>}

	<ul class="space-y-4">
		{
			pagePosts.map((post) => (
				<li>
					<PostPreview post={post} />
				</li>
			))
		}
	</ul>

	<!-- 空题材兜底：该题材下没有文章时不报错、不产出空白页 -->
	{pagePosts.length === 0 && <p class="text-lighter">这个题材下还没有文章。</p>}
</PageLayout>
```

- [ ] **Step 3: 重启 dev server 并探测**

```bash
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
npx astro dev --port 4321 > /tmp/astro-dev-taxonomy.log 2>&1 &
sleep 12
# 5 个题材页都应 200
for p in agent engineering library industry meta; do
  printf "/posts/%s/ -> " "$p"; curl -s -o /dev/null -w "%{http_code}\n" --retry 5 --retry-delay 1 --retry-all-errors "http://localhost:4321/posts/$p/"
done
# 分页未被抢占
for p in "" 2 3 4 5; do
  printf "/posts/%s/ -> " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321/posts/$p/"
done
# 体裁页必须消失（404）
for p in concept method; do
  printf "/posts/%s/ -> " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321/posts/$p/"
done
```
Expected: 5 个题材页全 `200`；6 个分页路径全 `200`；`concept` 与 `method` 均 **404**（v2 验收标准 8）。

- [ ] **Step 4: 抽查题材页内容**

```bash
curl -s http://localhost:4321/posts/agent/ | grep -oE "智能体|长期记忆|方法论|知识概念" | sort | uniq -c
```
Expected: 出现「智能体」与「长期记忆」；**不应**再出现「方法论」「知识概念」这两个 v1 的分组标题。

- [ ] **Step 5: 构建验证**

```bash
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
npx astro build 2>&1 | tail -5
ls dist/posts/ | sort
```
Expected: 构建成功；`dist/posts/` 下只有 5 个题材目录 + 数字分页目录 + 文章目录，**不存在** `concept/` 与 `method/`。

- [ ] **Step 6: Commit（先向用户确认）**

```bash
git add -A "src/pages/posts"
git commit -m "refactor: 题材页改为单列表路由，删除体裁页"
```

---

## Task 4: 题材卡片与中枢页去掉体裁细分

**Files:**
- Modify: `src/components/blog/TopicCard.astro`
- Modify: `src/pages/posts/[...page].astro`

- [ ] **Step 1: 重写题材卡片**

```astro
---
// 题材卡片：中枢页顶部的题材导航入口，展示题材中文名、篇数与一句界定
interface Props {
	// 题材 slug，用于拼接跳转链接
	slug: string;
	// 题材中文显示名
	label: string;
	// 题材界定文案
	description: string;
	// 该题材下的文章总数
	total: number;
}

const { slug, label, description, total } = Astro.props;
---

<!-- 整卡可点击：卡片即题材页入口 -->
<a
	data-astro-prefetch
	href={`/posts/${slug}/`}
	class="group flex flex-col gap-1 rounded-lg border border-special-lighter bg-color-75 px-4 py-3 transition-colors hover:bg-color-100"
>
	<span class="flex items-baseline justify-between gap-2">
		<span class="font-semibold text-accent-two group-hover:underline">{label}</span>
		<span class="text-sm text-lighter">{total} 篇</span>
	</span>
	<!-- 界定句：说明该题材收什么内容，避免 library 这类宽题材变成杂物间 -->
	<span class="line-clamp-2 text-sm text-lighter">{description}</span>
</a>
```

- [ ] **Step 2: 改中枢页 [src/pages/posts/[...page].astro](file:///Users/xuhuajian/Documents/trae/myBlog/src/pages/posts/[...page].astro)**

frontmatter 中的 import 与统计块：

```astro
import { TOPICS, parseTopic } from "@/data/taxonomy";
```

```ts
// 题材卡片数据：每个题材的篇数与界定句（仅第 1 页渲染）
const allPosts = await getAllPosts();
const topicStats = TOPICS.map((topic) => ({
	slug: topic.slug,
	label: topic.label,
	description: topic.description,
	// 属于该题材的文章数；v2 已删除按体裁的细分计数
	total: allPosts.filter((post) => parseTopic(post.id) === topic.slug).length,
}));
```

把原来传三个 prop 的卡片调用：

```astro
					{topicStats.map((topic) => (
						<TopicCard
							slug={topic.slug}
							label={topic.label}
							total={topic.total}
							kindCounts={topic.kindCounts}
						/>
					))}
```

改为：

```astro
					{topicStats.map((topic) => (
						<TopicCard
							slug={topic.slug}
							label={topic.label}
							description={topic.description}
							total={topic.total}
						/>
					))}
```

（其余部分——`getStaticPaths`、`paginationProps`、按年分组的 `<section>`、`page.currentPage === 1` 判断、已移除的标签云 `<aside>`——保持现状不动。）

- [ ] **Step 3: 类型检查 + 重启 dev 核对**

```bash
npx astro check 2>&1 | tail -20
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
npx astro dev --port 4321 > /tmp/astro-dev-taxonomy.log 2>&1 &
sleep 12
curl -s http://localhost:4321/posts/ | grep -c "本站与主题"     # 期望 ≥1
curl -s http://localhost:4321/posts/ | grep -c "知识概念"       # 期望 0（体裁细分文案已删）
curl -s http://localhost:4321/posts/ | grep -c "方法论"         # 期望 0
curl -s http://localhost:4321/posts/ | grep -c "标签"           # 期望 0（标签云侧栏仍为移除状态）
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/posts/2/
curl -s http://localhost:4321/posts/2/ | grep -c "本站与主题"   # 期望 0（卡片只在第 1 页）
```
Expected: 分别满足注释中的期望值。

- [ ] **Step 4: 构建验证**

```bash
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
npx astro build 2>&1 | tail -5
```
Expected: 构建成功，且 `astro check` 中不再出现 `KINDS` / `parseTaxonomy` 相关错误。

- [ ] **Step 5: Commit（先向用户确认）**

```bash
git add src/components/blog/TopicCard.astro "src/pages/posts/[...page].astro"
git commit -m "refactor: 题材卡片去掉体裁细分，只展示题材名与篇数"
```

---

## Task 5: 9 篇语法演示文补 `demo` 标签

9 篇纯语法/样式演示文额外打 `demo` 标签，用于与题材内真正的站务文章区分，目录位置不变（注意 v2 已上提一层，路径无 `concept/` 段）。

**Files:**
- Modify: `src/content/post/meta/headings.md`
- Modify: `src/content/post/meta/long-title.md`
- Modify: `src/content/post/meta/cover-image/index.md`
- Modify: `src/content/post/meta/social-image.md`
- Modify: `src/content/post/meta/webmentions.md`
- Modify: `src/content/post/meta/unique-tags.md`
- Modify: `src/content/post/meta/post-without-tags.md`
- Modify: `src/content/post/meta/missing-content.md`
- Modify: `src/content/post/meta/draft-post.md`

- [ ] **Step 1: 逐文件追加 `demo`**

| 文件 | 改前 | 改后 |
|---|---|---|
| `meta/headings.md` | `tags: ["markdown", "headings", "example", "toc"]` | `tags: ["markdown", "headings", "example", "toc", "demo"]` |
| `meta/long-title.md` | `tags: ["test"]` | `tags: ["test", "demo"]` |
| `meta/cover-image/index.md` | `tags: ["test", "image"]` | `tags: ["test", "image", "demo"]` |
| `meta/social-image.md` | `tags: ["example", "blog", "image"]` | `tags: ["example", "blog", "image", "demo"]` |
| `meta/webmentions.md` | `tags: ["webmentions", "astro", "social"]` | `tags: ["webmentions", "astro", "social", "demo"]` |
| `meta/unique-tags.md` | `tags: ["blog", "blog", "Blog", "test", "bloG", "Test", "BLOG"]` | `tags: ["blog", "blog", "Blog", "test", "bloG", "Test", "BLOG", "demo"]` |
| `meta/post-without-tags.md` | 无 `tags` 字段 | 新增一行 `tags: ["demo"]`（放在 `draft: false` 之后） |
| `meta/missing-content.md` | `tags: ["test", "toc"]` | `tags: ["test", "toc", "demo"]` |
| `meta/draft-post.md` | `tags: ["test"]` | `tags: ["test", "demo"]` |

`meta/post-without-tags.md` 当前没有 `tags` 字段，需在 `draft: false` 之后新增一行，改后完整 frontmatter 为：

```yaml
title: "A post without tags"
description: "This post is for testing the functionality"
publishDate: "11 March 2024"
draft: false
tags: ["demo"]       # ← 新增：标记为演示文
```

其余 8 篇用 Edit 在 `tags` 数组末尾追加 `"demo"`（例：`meta/missing-content.md` 改前 `tags: ["test", "toc"]`，改后 `tags: ["test", "toc", "demo"]`；其余按上表同理）。

- [ ] **Step 2: 校验 9 个文件都含 `demo`**

Run: `grep -rl "\"demo\"\|'demo'" src/content/post/meta | sort`
Expected: 恰好输出上述 9 个文件路径。

- [ ] **Step 3: 构建验证**

Run: `npx astro build 2>&1 | tail -5`
Expected: 构建成功。

- [ ] **Step 4: Commit（先向用户确认）**

```bash
git add src/content/post/meta
git commit -m "chore: 为 9 篇语法演示文补 demo 标签"
```

---

## Task 6: `note` 集合整体改名为 `essay`（随笔）

牵动 8 处：内容目录、集合定义、组件、类型、三个页面路由、导航、首页文案、硬编码链接。

**Files:**
- Move: `src/content/note/` → `src/content/essay/`
- Move: `src/components/note/Note.astro` → `src/components/essay/Essay.astro`
- Move: `src/pages/notes/` → `src/pages/essays/`
- Modify: `src/content.config.ts`
- Modify: `src/utils/date.ts`
- Modify: `src/site.config.ts`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: 目录与文件改名**

```bash
git mv src/content/note src/content/essay
mkdir -p src/components/essay
git mv src/components/note/Note.astro src/components/essay/Essay.astro
rmdir src/components/note
mkdir -p src/pages/essays
git mv "src/pages/notes/[...page].astro" "src/pages/essays/[...page].astro"
git mv "src/pages/notes/[...slug].astro" "src/pages/essays/[...slug].astro"
git mv src/pages/notes/rss.xml.ts src/pages/essays/rss.xml.ts
rmdir src/pages/notes
```

- [ ] **Step 2: 改集合定义 [src/content.config.ts](file:///Users/xuhuajian/Documents/trae/myBlog/src/content.config.ts)**

把 `note` 集合整段替换为：

```ts
// 随笔集合（原 note）：扁平存放、不挂题材，承载思考、记录、碎想
const essay = defineCollection({
	// 内容来源目录：src/content/essay/**
	loader: glob({ base: "./src/content/essay", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		// 描述可选：随笔常常只是短句，不强制写摘要
		description: z.string().optional(),
		// 发布时间：要求带时区的 ISO 8601 字符串
		publishDate: z
			.string()
			.datetime({ offset: true })
			.transform((val) => new Date(val)),
	}),
});
```

并把文件末行：

```ts
export const collections = { post, note, series };
```

改为：

```ts
// 站点注册的全部内容集合：正式文章、随笔、专栏元数据
export const collections = { post, essay, series };
```

- [ ] **Step 3: 改排序函数类型 [src/utils/date.ts](file:///Users/xuhuajian/Documents/trae/myBlog/src/utils/date.ts)**

把 `collectionDateSort` 的两行参数类型：

```ts
export function collectionDateSort(
	a: CollectionEntry<"post" | "note">,
	b: CollectionEntry<"post" | "note">,
) {
```

改为：

```ts
// 按发布日期倒序：正式文章与随笔共用同一套排序规则
export function collectionDateSort(
	a: CollectionEntry<"post" | "essay">,
	b: CollectionEntry<"post" | "essay">,
) {
```

- [ ] **Step 4: 改导航 [src/site.config.ts](file:///Users/xuhuajian/Documents/trae/myBlog/src/site.config.ts)**

把 `menuLinks` 第四项：

```ts
	{
		path: "/notes/",
		title: "笔记",
	},
```

改为（顺序与项数保持 4 项不变，题材不进导航）：

```ts
	{
		// 随笔板块：原「笔记」改名，路径与集合名同步
		path: "/essays/",
		title: "随笔",
	},
```

- [ ] **Step 5: 改随笔卡片组件 [src/components/essay/Essay.astro](file:///Users/xuhuajian/Documents/trae/myBlog/src/components/essay/Essay.astro)**

把 props 类型与解构：

```astro
type Props<Tag extends HTMLTag> = Polymorphic<{ as: Tag }> & {
	note: CollectionEntry<"note">;
	isPreview?: boolean | undefined;
};

const { as: Tag = "div", note, isPreview = false } = Astro.props;
const { Content } = await render(note);
```

改为：

```astro
type Props<Tag extends HTMLTag> = Polymorphic<{ as: Tag }> & {
	// 随笔条目：集合已由 note 改名为 essay
	essay: CollectionEntry<"essay">;
	isPreview?: boolean | undefined;
};

const { as: Tag = "div", essay, isPreview = false } = Astro.props;
const { Content } = await render(essay);
```

并把预览态链接 `/notes/${note.id}/` 改为 `/essays/${essay.id}/`，组件内其余 `note.` 引用全部改为 `essay.`。

- [ ] **Step 6: 改随笔列表 [src/pages/essays/[...page].astro](file:///Users/xuhuajian/Documents/trae/myBlog/src/pages/essays/[...page].astro)**

关键改动：

```astro
---
import { type CollectionEntry, getCollection } from "astro:content";
import Pagination from "@/components/Paginator.astro";
import Essay from "@/components/essay/Essay.astro";
import PageLayout from "@/layouts/Base.astro";
import { collectionDateSort } from "@/utils/date";
import type { GetStaticPaths, Page } from "astro";
import { Icon } from "astro-icon/components";

export const getStaticPaths = (async ({ paginate }) => {
	// 每页展示的随笔条数
	const MAX_ESSAYS_PER_PAGE = 5;
	// 取随笔集合的全部条目
	const allEssays = await getCollection("essay");
	return paginate(allEssays.sort(collectionDateSort), { pageSize: MAX_ESSAYS_PER_PAGE });
}) satisfies GetStaticPaths;

interface Props {
	// 分页后的当前页数据
	page: Page<CollectionEntry<"essay">>;
}

const { page } = Astro.props;

const meta = {
	description: "我的随笔集合：思考、记录与碎想",
	title: "随笔",
};
```

正文部分：`<h1>` 内文案「笔记」改为「随笔」，RSS 链接 `/notes/rss.xml` 改为 `/essays/rss.xml`，遍历 `page.data.map((note) => … <Note note={note} … />)` 改为 `page.data.map((essay) => … <Essay essay={essay} … />)`。

- [ ] **Step 7: 改随笔详情 [src/pages/essays/[...slug].astro](file:///Users/xuhuajian/Documents/trae/myBlog/src/pages/essays/[...slug].astro)**

关键改动：

```astro
---
import { getCollection } from "astro:content";
import Essay from "@/components/essay/Essay.astro";
import PageLayout from "@/layouts/Base.astro";
import type { GetStaticPaths, InferGetStaticPropsType } from "astro";

export const getStaticPaths = (async () => {
	// 取随笔集合的全部条目，逐条生成详情页
	const allEssays = await getCollection("essay");
	return allEssays.map((essay) => ({
		params: { slug: essay.id },
		props: { essay },
	}));
}) satisfies GetStaticPaths;

export type Props = InferGetStaticPropsType<typeof getStaticPaths>;

const { essay } = Astro.props;

const meta = {
	description: essay.data.description || `发布于 ${essay.data.publishDate.toLocaleDateString()} 的随笔`,
	title: essay.data.title,
};
---
```

正文：`<Note as="h1" note={note} />` 改为 `<Essay as="h1" essay={essay} />`。

- [ ] **Step 8: 改随笔 RSS [src/pages/essays/rss.xml.ts](file:///Users/xuhuajian/Documents/trae/myBlog/src/pages/essays/rss.xml.ts)**

```ts
import { getCollection } from "astro:content";
import { siteConfig } from "@/site.config";
import rss from "@astrojs/rss";

export const GET = async () => {
	// 随笔集合的全部条目（随笔无 draft 字段）
	const essays = await getCollection("essay");

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: essays.map((essay) => ({
			title: essay.data.title,
			pubDate: essay.data.publishDate,
			// 详情页路径已由 /notes/ 改为 /essays/
			link: `essays/${essay.id}/`,
		})),
	});
};
```

- [ ] **Step 9: 改首页 [src/pages/index.astro](file:///Users/xuhuajian/Documents/trae/myBlog/src/pages/index.astro)**

改动 5 处：

```astro
import Essay from "@/components/essay/Essay.astro";   // 替换 import Note
```

```astro
// Essays（随笔）
const MAX_ESSAYS = 2;
const allEssays = await getCollection("essay");
const latestEssays = allEssays.sort(collectionDateSort).slice(0, MAX_ESSAYS);
```

hero 区「随手一读」按钮的链接改为 `/essays/wake-up/`；随笔区块标题与「查看全部」链接由 `/notes/` 改为 `/essays/`、文案「笔记」改为「随笔」；区块内的 `<Note note={note} as="h4" isPreview />` 改为 `<Essay essay={essay} as="h4" isPreview />`。

- [ ] **Step 10: 全量排查残留**

Run:
```bash
grep -rn "/notes/\|CollectionEntry<\"note\">\|getCollection(\"note\")\|components/note" src/ || echo "无 /notes/ 残留"
npx astro build 2>&1 | tail -5
```
Expected: 第一条只剩 Markdown 正文里的英文单词与图标名等无关命中，**不应**再有 `/notes/` 链接、`getCollection("note")`、`components/note` 引用；构建成功，产物出现 `/essays/index.html`、`/essays/wake-up/index.html`、`/essays/rss.xml`。

- [ ] **Step 11: Commit（先向用户确认）**

```bash
git add -A
git commit -m "refactor: note 集合整体改名为 essay（随笔）"
```

---

## Task 7: 文章页新增分类面包屑与「同题材其它文章」

**Files:**
- Create: `src/components/blog/Breadcrumb.astro`
- Create: `src/components/blog/SameTopicPosts.astro`
- Modify: `src/layouts/BlogPost.astro`

- [ ] **Step 1: 写面包屑组件（v2 三层：博客 / 题材 / 标题）**

```astro
---
// 文章页顶部的分类面包屑：博客 / 题材 / 标题
// v2 说明：已删除 v1 的「体裁」这一段。
interface Props {
	// 题材 slug 与中文名
	topicSlug: string;
	topicLabel: string;
	// 当前文章标题
	title: string;
}

const { topicSlug, topicLabel, title } = Astro.props;
---

<nav aria-label="面包屑" class="mx-2 mb-2 flex flex-wrap items-center gap-x-1 text-sm text-lighter">
	<a class="hover:text-accent-two" href="/posts/">博客</a>
	<span aria-hidden="true">/</span>
	<a class="hover:text-accent-two" href={`/posts/${topicSlug}/`}>{topicLabel}</a>
	<span aria-hidden="true">/</span>
	<span class="text-textColor">{title}</span>
</nav>
```

- [ ] **Step 2: 写「同题材其它文章」组件**

```astro
---
// 文章页底部的「同题材其它文章」列表
import PostPreview from "@/components/blog/PostPreview.astro";
import type { CollectionEntry } from "astro:content";

interface Props {
	// 同题材的其它文章（已按发布日期倒序）
	posts: CollectionEntry<"post">[];
	// 题材中文名，用于小标题
	topicLabel: string;
}

const { posts, topicLabel } = Astro.props;
---

{
	posts.length > 0 && (
		<aside class="mt-10 border-t border-special-lighter pt-6" aria-label={`同题材文章：${topicLabel}`}>
			<h2 class="title mb-4 text-lg">「{topicLabel}」下的其它文章</h2>
			<ul class="space-y-3">
				{posts.map((post) => (
					<li>
						<PostPreview post={post} />
					</li>
				))}
			</ul>
		</aside>
	)
}
```

- [ ] **Step 3: 改 [src/layouts/BlogPost.astro](file:///Users/xuhuajian/Documents/trae/myBlog/src/layouts/BlogPost.astro)**

在 frontmatter 顶部既有 import 之后补充：

```ts
import Breadcrumb from "@/components/blog/Breadcrumb.astro";
import SameTopicPosts from "@/components/blog/SameTopicPosts.astro";
import { getAllPosts } from "@/data/post";
import { collectionDateSort } from "@/utils/date";
import { getTopicLabel, parseTopic } from "@/data/taxonomy";
```

在既有解构行之后补充：

```ts
// 从文章 id 解析题材；非法目录会在此处抛错
const topic = parseTopic(post.id);
// 取同题材的其它文章，排除当前篇，按日期倒序
const sameTopicPosts = (await getAllPosts())
	.filter((item) => item.id !== post.id && parseTopic(item.id) === topic)
	.sort(collectionDateSort);
```

在 `<Masthead content={post} />` **之前**插入面包屑：

```astro
	<!-- 分类面包屑：说明当前文章在题材体系中的位置 -->
	<Breadcrumb topicSlug={topic} topicLabel={getTopicLabel(topic)} title={title} />
```

在 `</article>` 之后的 `<div class="mt-6 flex …">` **闭合标签之后**、`<button id="to-top-button">` **之前**插入：

```astro
	<!-- 同题材其它文章：放在 article 之外，避免被 data-pagefind-body 收进本页搜索索引 -->
	<SameTopicPosts posts={sameTopicPosts} topicLabel={getTopicLabel(topic)} />
```

- [ ] **Step 4: 重启 dev 抽查文章页（含嵌套子目录的深 URL）**

```bash
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
npx astro dev --port 4321 > /tmp/astro-dev-taxonomy.log 2>&1 &
sleep 12
curl -s http://localhost:4321/posts/agent/long-term-memory/ | grep -c "面包屑"    # 期望 ≥1
curl -s http://localhost:4321/posts/agent/long-term-memory/ | grep -c "下的其它文章"  # 期望 ≥1
curl -s http://localhost:4321/posts/meta/citrus-docs/intro/ | grep -c "面包屑"    # 期望 ≥1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/posts/meta/citrus-docs/intro/  # 期望 200
curl -s http://localhost:4321/posts/library/transfonter/ | grep -c "下的其它文章"  # 期望 ≥1
```
Expected: 前三行 ≥1；HTTP 200；最后一行 ≥1。（若某篇文章是其题材下唯一一篇，则不出现同题材列表，属预期。）

- [ ] **Step 5: 构建验证**

```bash
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
npx astro build 2>&1 | tail -5
```
Expected: 构建成功。

- [ ] **Step 6: Commit（先向用户确认）**

```bash
git add src/components/blog/Breadcrumb.astro src/components/blog/SameTopicPosts.astro src/layouts/BlogPost.astro
git commit -m "feat: 文章页新增分类面包屑与同题材文章列表"
```

---

## Task 8: 新增专栏汇总页 `/series/`

**Files:**
- Create: `src/pages/series/index.astro`

- [ ] **Step 1: 写汇总页**

```astro
---
import { getCollection } from "astro:content";
import PageLayout from "@/layouts/Base.astro";
import { getAllPosts } from "@/data/post";

// 全部专栏元数据
const allSeries = await getCollection("series");
// 已发布文章，用于统计每个专栏下的篇数
const allPosts = await getAllPosts();

// 汇总每个专栏的展示信息与篇数
const seriesList = allSeries.map((series) => ({
	id: series.id,
	title: series.data.title,
	description: series.data.description,
	count: allPosts.filter((post) => post.data.seriesId === series.id).length,
}));

const meta = {
	description: "本站的全部专栏：按阅读顺序组织起来的系列文章",
	title: "专栏",
};
---

<PageLayout meta={meta}>
	<!-- 面包屑：与题材页保持同一形式 -->
	<nav aria-label="面包屑" class="mb-4 flex flex-wrap items-center gap-x-1 text-sm text-lighter">
		<a class="hover:text-accent-two" href="/posts/">博客</a>
		<span aria-hidden="true">/</span>
		<span class="text-textColor">专栏</span>
	</nav>

	<h1 class="title mb-6">专栏</h1>

	<ul class="space-y-6">
		{
			seriesList.map((series) => (
				<li>
					<h2 class="title text-lg">
						<a class="text-accent-two sm:hover:underline" href={`/series/${series.id}/`}>
							{series.title}
						</a>
					</h2>
					<p class="mt-1 line-clamp-2">{series.description}</p>
					<p class="mt-1 text-sm text-lighter">{series.count} 篇</p>
				</li>
			))
		}
	</ul>

	{seriesList.length === 0 && <p class="text-lighter">还没有专栏。</p>}
</PageLayout>
```

- [ ] **Step 2: 重启 dev 并核对**

```bash
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
npx astro dev --port 4321 > /tmp/astro-dev-taxonomy.log 2>&1 &
sleep 12
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/series/
curl -s http://localhost:4321/series/ | grep -c "Citrus Docs"        # 期望 ≥1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/series/citrus-docs/
```
Expected: 全部 200；汇总页出现专栏标题。

- [ ] **Step 3: 构建验证**

```bash
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
npx astro build 2>&1 | tail -5
ls dist/series/index.html
```
Expected: 构建成功；`dist/series/index.html` 存在。

- [ ] **Step 4: Commit（先向用户确认）**

```bash
git add src/pages/series/index.astro
git commit -m "feat: 新增专栏汇总页 /series/"
```

---

## Task 9: 全站回归验证

**Files:** 无改动（纯验证）

- [ ] **Step 1: 完整构建 + Pagefind 索引 + 路由差值核对**

```bash
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
npx astro build 2>&1 | tail -15
npx pagefind --site dist 2>&1 | tail -10
```
Expected: 构建成功；Pagefind 正常生成索引。

路由差值核对（验收标准 1）：本计划相对「v1 落地后」的状态，净变化为 **体裁页 2 个消失**（题材页仍 5 个、专栏汇总页尚未新增），因此 `page(s) built` 应比 v1 落地时**少 2**。
（v1 落地时为 76 页 → 期望 **74**，已实测为 74。注意 `/og-image/<slug>.png` 与 `/tags/<tag>/` 也随文章数变化，若期间增删文章需相应换算。）
**推荐测法**：临时移出 `src/pages/posts/[topic]/index.astro`（Task 8 完成后连同 `src/pages/series/index.astro`）各构建一次，确认这两个文件合计贡献 **6** 页（5 题材 + 1 专栏汇总）。

- [ ] **Step 2: 断言生效性测试（验收标准 6）**

```bash
mkdir -p src/content/post/legacy
mv src/content/post/meta/headings.md src/content/post/legacy/headings.md
npx astro build 2>&1 | grep -i "非法的题材目录"; echo "退出码: $?"
mv src/content/post/legacy/headings.md src/content/post/meta/headings.md
rmdir src/content/post/legacy
npx astro build 2>&1 | tail -3
```
Expected: 中间输出包含 `非法的题材目录 "legacy"`，证明构建期断言生效；恢复后构建成功。

- [ ] **Step 3: 逐项对照验收标准（spec v2 第 11 节）**

```bash
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
npx astro dev --port 4321 > /tmp/astro-dev-taxonomy.log 2>&1 &
sleep 12
# 1) 中枢页 5 张题材卡片
curl -s http://localhost:4321/posts/ | grep -c "本站与主题"
# 2) 题材页可访问
for u in /posts/meta/ /posts/library/ /posts/agent/; do
  printf "%s -> " "$u"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321$u"
done
# 3) 空题材优雅处理：临时移出某个题材的全部文章 + 构建核对
mkdir -p /tmp/taxonomy-empty-test
mv src/content/post/industry/agent-commoditization.md /tmp/taxonomy-empty-test/
mv src/content/post/agent/long-term-memory.md /tmp/taxonomy-empty-test/
mv src/content/post/agent/memory-layering.md /tmp/taxonomy-empty-test/
npx astro build > /tmp/build-empty.log 2>&1; echo "构建退出码: $?"
ls dist/posts/agent/index.html                                   # 期望：存在
grep -c "这个题材下还没有文章" dist/posts/agent/index.html         # 期望 1
mv /tmp/taxonomy-empty-test/agent-commoditization.md src/content/post/industry/
mv /tmp/taxonomy-empty-test/long-term-memory.md src/content/post/agent/
mv /tmp/taxonomy-empty-test/memory-layering.md src/content/post/agent/
# 4) 迁移后文章 URL 抽查（含嵌套子目录）
for u in /posts/meta/citrus-docs/intro/ /posts/meta/citrus-docs/setup/ \
         /posts/meta/markdown-elements/admonistions/ /posts/meta/deepseek/ \
         /posts/library/transfonter/ /posts/library/remark-rehype/ \
         /posts/library/local-gitignore/ /posts/agent/long-term-memory/; do
  printf "%s -> " "$u"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321$u"
done
# 5) 随笔页正常，且站内已无 /notes/ 链接
curl -s -o /dev/null -w "/essays/ %{http_code}\n" http://localhost:4321/essays/
curl -s http://localhost:4321/ | grep -c "/notes/"
# 6) 体裁层彻底消失（验收标准 8）
for u in /posts/concept/ /posts/method/; do
  printf "%s -> " "$u"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321$u"
done
# 7) 面包屑 + 同题材
curl -s http://localhost:4321/posts/meta/deepseek/ | grep -c "面包屑"
curl -s http://localhost:4321/posts/meta/deepseek/ | grep -c "下的其它文章"
# 8) 专栏汇总页
curl -s -o /dev/null -w "/series/ %{http_code}\n" http://localhost:4321/series/
```
Expected：
- (1) ≥1；
- (2) 3 个 URL 全 `200`；
- (3) 构建退出码 0，`dist/posts/agent/index.html` 存在，兜底文案命中 1 次，随后文章已移回；
- (4) 8 个 URL 全 `200`；
- (5) `/essays/` 为 `200`，首页无 `/notes/` 链接（输出 `0`）；
- (6) `concept` 与 `method` 均 **404**；
- (7) 两个计数各 ≥1；
- (8) `/series/` 为 `200`。

- [ ] **Step 4: 人工回归（验收标准 9）**

浏览器打开 `http://localhost:4321/`，依次核对：

| 检查项 | 期望 |
|---|---|
| 明暗主题切换 | 点击按钮后 `html[data-theme]` 变化，配色随之切换 |
| ClientRouter 导航 | 站内跳转不闪白，URL 为 SPA 式替换 |
| 悬浮音乐播放器 | 拖拽正常；翻页后位置保留、音乐不中断 |
| Giscus 评论 | 文章页评论区正常渲染 |
| 移动端抽屉导航 | 汉堡按钮可用，「随笔」项指向 `/essays/` |
| 分页 | `/posts/` 与后续分页页均正常，题材卡片只在第 1 页 |

- [ ] **Step 5: 收尾**

```bash
ps -eo pid,command | grep "[a]stro dev" | awk '{print $1}' | xargs -r kill
git status --short
```
Expected: 工作区干净（所有改动已提交）。

- [ ] **Step 6: 向用户汇报并确认后续**

汇报本次重构完成的全部提交与验收结果，并询问是否：推送 `refactor/content-taxonomy` 到远端、合并回 `main`。

**不要自行 push 或合并。**

---

## 附录：示范文档处置（需用户决策）

`agent` / `engineering` / `industry` 三个题材目前由 **5 篇预览用示范文档**填充：

```
agent/long-term-memory.md  agent/memory-layering.md
engineering/idempotency.md  engineering/idempotent-consumer.md
industry/agent-commoditization.md
```

它们只用于预览分类效果与验证空题材兜底，**不是正式内容**。落地前需确认保留还是删除：
- 保留 → 按正式文章维护，去掉正文顶部的「示范文档」提示行；
- 删除 → `git rm` 这 5 个文件，三个题材回到空态（题材页显示兜底文案，卡片计数为 0）。

## 附录：风险与缓解（对应 spec v2 第 10 节）

| 风险 | 缓解措施（落点） |
|---|---|
| URL 全部变深，旧链接 404 | 明确接受；不加重定向 |
| `note` → `essay` 改名牵动 8 处易漏 | Task 6 Step 10 全量 grep + `astro build` 兜底 |
| 题材写错目录 | Task 1 断言 + Task 9 Step 2 实测 |
| 硬编码站内链接遗漏 | `PostPreview` / `SeriesPanel` 均用 `post.id` 拼接，随迁移自动生效；Task 6 Step 10 grep `/notes/` |
| `library` 界定宽泛 | 卡片与题材页均展示 `description` 界定句 |
| `meta` 稀释导航 | `TOPICS` 中 `meta` 置末，题材不进 Header |
| v1 残留的体裁符号未清干净 | Task 1 Step 2 grep `KINDS\|assertValidKind\|parseTaxonomy\|getKindLabel`，Task 3 Step 3 断言 `/posts/concept/` 与 `/posts/method/` 返回 404 |
| 第二层起自由嵌套无约束 | 约定嵌套子目录仅用于"同一主题的多篇"，不用于替代题材 |
