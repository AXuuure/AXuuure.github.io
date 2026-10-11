// @ts-check
// 从 astro/config 引入配置定义工具
import { defineConfig } from 'astro/config';

// 导出站点配置对象
export default defineConfig({
  // 站点正式访问地址：用户站点部署后即为此地址
  site: 'https://axuuure.github.io',
  // 压缩构建输出的 HTML，减小文件体积
  compressHTML: true,
});