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
			// 详情页路径已随集合改名同步为 essays/<id>/
			link: `essays/${essay.id}/`,
		})),
	});
};
