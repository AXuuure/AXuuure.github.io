// 站点默认分享图（/social-card.png）
// 供没有自定义 ogImage 的页面使用，避免 og:image 指向不存在的文件
// 注意：所用字体 SF Pro Rounded 只含拉丁字形，因此这里只用英文文案
import { siteConfig } from "@/site.config";
import { ogOptions } from "@/utils/og";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { html } from "satori-html";

// 默认分享图的版式：上方一行说明文案 + 大标题，底部署名
const markup = (title: string, tagline: string, author: string) =>
	html` <div tw="flex flex-col w-full h-full bg-[#f2f2f2] text-[#6b6b6b]">
		<div tw="flex flex-col flex-1 w-full p-10 justify-center">
			<p tw="text-3xl mb-6 text-[#8e8e8e] font-medium">${tagline}</p>
			<h1 tw="text-6xl font-semibold leading-snug text-[#224d67]">${title}</h1>
		</div>
		<div tw="flex items-end justify-between w-full p-10 border-t border-[#dbdbdb] text-3xl text-[#6b6b6b]">
			<p tw="text-3xl text-[#8e8e8e]">by ${author}</p>
		</div>
	</div>`;

// 构建时生成一张静态 PNG，随站点一起发布
export async function GET() {
	// 用 satori 把模板渲染成 SVG
	const svg = await satori(
		markup(siteConfig.title, "Blog · Notes · Experiments", siteConfig.author),
		ogOptions,
	);
	// 再把 SVG 转成 PNG
	const png = new Resvg(svg).render().asPng();
	// 返回 PNG 响应，长缓存（构建产物内容固定）
	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}
