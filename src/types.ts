// 站点级配置的类型定义
export interface SiteConfig {
	// 作者署名：出现在 meta 与页脚
	author: string;
	// 日期格式化的本地化参数
	date: {
		locale: string | string[] | undefined;
		options: Intl.DateTimeFormatOptions;
	};
	// 站点描述：用于 meta description 与 webmanifest
	description: string;
	// HTML lang 属性
	lang: string;
	// Open Graph 语言标记
	ogLocale: string;
	// 站点标题
	title: string;
}

// 分页组件使用的链接描述
export interface PaginationLink {
	// 屏幕阅读器专用文案
	srLabel?: string;
	// 链接显示文案
	text?: string;
	// 链接地址
	url: string;
}

// 页面级 meta 信息
export interface SiteMeta {
	articleDate?: string | undefined;
	description?: string;
	ogImage?: string | undefined;
	title: string;
}

// 支持的提示框（admonition）类型
export type AdmonitionType = "tip" | "note" | "important" | "caution" | "warning";

// 标签徽章的展示属性
export interface Badge {
	variant?:
		| "default"
		| "accent"
		| "accent-base"
		| "accent-one"
		| "accent-two"
		| "muted"
		| "outline";
	showHash?: boolean;
	title: string;
}
