import type { CollectionEntry } from "astro:content";
import { siteConfig } from "@/site.config";

export function getFormattedDate(
	date: Date | undefined,
	options?: Intl.DateTimeFormatOptions,
): string {
	if (date === undefined) {
		return "Invalid Date";
	}

	return new Intl.DateTimeFormat(siteConfig.date.locale, {
		...(siteConfig.date.options as Intl.DateTimeFormatOptions),
		...options,
	}).format(date);
}

// 按发布日期倒序：正式文章与随笔共用同一套排序规则
export function collectionDateSort(
	a: CollectionEntry<"post" | "essay">,
	b: CollectionEntry<"post" | "essay">,
) {
	return b.data.publishDate.getTime() - a.data.publishDate.getTime();
}
