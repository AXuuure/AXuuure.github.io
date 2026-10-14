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
