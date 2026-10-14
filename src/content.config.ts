import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const baseSchema = z.object({
	title: z.string().max(60),
});

const post = defineCollection({
	loader: glob({ base: "./src/content/post", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			draft: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			// Series
			seriesId: z.string().optional(), // Поле для связи с серией
      		orderInSeries: z.number().optional(), // Опционально: для сортировки в серии
			// End
		}),
});

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

// Series
const series = defineCollection({
	loader: glob({ base: "./src/content/series", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		id: z.string(),
		title: z.string(),
		description: z.string(),
		featured: z.boolean().default(false), // Пометка для популярных серий
	}),
});
// End

// 站点注册的全部内容集合：正式文章、随笔、专栏元数据
export const collections = { post, essay, series };
