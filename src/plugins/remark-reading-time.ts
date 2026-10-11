import { toString as mdastToString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

// 把默认的英文阅读时长文案（如 "1 min read"）本地化为中文
export function remarkReadingTime() {
	// @ts-expect-error:next-line
	return (tree, { data }) => {
		// 提取整篇文档的纯文本内容
		const textOnPage = mdastToString(tree);
		// 计算阅读时长
		const readingTime = getReadingTime(textOnPage);
		// 向上取整分钟数，不足 1 分钟按 1 分钟计
		const minutes = Math.max(1, Math.round(readingTime.minutes));
		// 写入中文化的阅读时长文案，供 Masthead 组件读取展示
		data.astro.frontmatter.readingTime = `约 ${minutes} 分钟`;
	};
}