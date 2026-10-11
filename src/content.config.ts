// 从 astro:content 引入集合定义工具
import { defineCollection } from 'astro:content';
// 从 astro/zod 引入 zod 校验库（Astro 7 起推荐此导入方式）
import { z } from 'astro/zod';
// 从 astro/loaders 引入 glob 加载器，用于按通配符批量加载内容文件
import { glob } from 'astro/loaders';

// 定义 blog 集合：读取 src/content/blog 目录下的所有 Markdown
const blog = defineCollection({
  // 指定数据源：匹配该目录下的所有 .md 文件
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  // 用 zod 定义并校验每篇文章 frontmatter 的字段
  schema: z.object({
    // 标题：必填字符串
    title: z.string(),
    // 摘要：必填字符串，用于列表与 SEO 描述
    description: z.string(),
    // 发布日期：字符串会被自动转换成 Date 对象
    pubDate: z.coerce.date(),
    // 标签：字符串数组，未填写时默认为空数组
    tags: z.array(z.string()).default([]),
  }),
});

// 导出全部集合定义，供站点其它地方引用
export const collections = { blog };