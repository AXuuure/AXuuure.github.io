// OG 分享图的公共 satori 配置
// 字体通过 vite 的 rawFonts 插件以二进制模块方式引入（见 astro.config.ts）
import SFProRoundedBold from "@/assets/fonts/SF-Pro-Rounded-Bold.latin.base.ttf";
import SFProRoundedMedium from "@/assets/fonts/SF-Pro-Rounded-Medium.latin.base.ttf";
import SFProRoundedRegular from "@/assets/fonts/SF-Pro-Rounded-Regular.latin.base.ttf";
import SFProRoundedSemibold from "@/assets/fonts/SF-Pro-Rounded-Semibold.latin.base.ttf";
import type { SatoriOptions } from "satori";

// 注入 SF Pro Rounded 的四个常用字重，画布固定 1200x630（社交平台通用分享比例）
export const ogOptions: SatoriOptions = {
	fonts: [
		{
			// 常规字重
			data: Buffer.from(SFProRoundedRegular),
			name: "SF Pro Rounded",
			style: "normal",
			weight: 400,
		},
		{
			// 中等字重
			data: Buffer.from(SFProRoundedMedium),
			name: "SF Pro Rounded",
			style: "normal",
			weight: 500,
		},
		{
			// 半粗字重
			data: Buffer.from(SFProRoundedSemibold),
			name: "SF Pro Rounded",
			style: "normal",
			weight: 600,
		},
		{
			// 粗体字重
			data: Buffer.from(SFProRoundedBold),
			name: "SF Pro Rounded",
			style: "normal",
			weight: 700,
		},
	],
	// 画布高度
	height: 630,
	// 画布宽度
	width: 1200,
};
