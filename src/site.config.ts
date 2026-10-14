import type { SiteConfig } from "@/types";

// 站点基础信息：标题、作者、语言与本地化设置
export const siteConfig: SiteConfig = {
	// 作者署名：对外统一使用 AXuuure，不暴露真实姓名（用于 meta 与页脚）
	author: "AXuuure",
	// 日期格式化参数：locale 设为中文，输出如「2026年10月11日」
	date: {
		locale: "zh-CN",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
	// 默认描述：用于 meta description 与 webmanifest
	description: "AXuuure Space —— 记录博客、作品与交互实验的个人空间",
	// HTML lang 属性：见 src/layouts/Base.astro 与 astro.config.ts
	lang: "zh-CN",
	// Open Graph 语言标记：见 src/components/BaseHead.astro
	ogLocale: "zh_CN",
	// 站点标题：用于 meta title 与 webmanifest name
	title: "AXuuure’s Space",
};

// 导航菜单：Header 与 Footer 共用同一份配置
export const menuLinks: { path: string; title: string }[] = [
	{
		path: "/",
		title: "首页",
	},
	{
		path: "/about/",
		title: "关于",
	},
	{
		path: "/posts/",
		title: "博客",
	},
	{
		// 随笔板块：原「笔记」改名，路径与集合名同步
		path: "/essays/",
		title: "随笔",
	},
];

// Giscus 评论与点赞配置（基于 GitHub Discussions，零后端）
// 说明：repoId 与 categoryId 需要到 https://giscus.app 按仓库信息生成后回填，留空时评论区不渲染
export const giscusConfig = {
	// 承载评论 Discussion 的仓库
	repo: "AXuuure/AXuuure.github.io",
	// 仓库 ID：在 giscus.app 填入仓库名后自动生成
	repoId: "R_kgDOVE2TaA",
	// Discussion 分类名：需与下面的分类 ID 对应
	category: "Announcements",
	// 分类 ID：在 giscus.app 填入分类名后自动生成
	categoryId: "DIC_kwDOVE2TaM4DIGXB",
	// 页面与 Discussion 的映射方式：按路径名匹配
	mapping: "pathname",
	// 是否开启 emoji 反应（即点赞）
	reactionsEnabled: "1",
	// 评论输入框位置：顶部
	inputPosition: "top",
	// 初始主题：先跟随系统，加载后由脚本同步站点的明暗主题
	theme: "preferred_color_scheme",
	// 组件界面语言
	lang: "zh-CN",
};
