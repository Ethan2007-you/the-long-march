# 长征 · 不朽征途

武汉大学 2026 年零杯网页设计大赛主题三「长征万里，薪火千秋」。这是一个以展览阅读为主的独立网页项目。源代码与排版为本版重新编写。

## 运行

- 本地打开成品：解压完整压缩包后，双击「打开长征展览.html」，也可直接打开 dist/index.html。展览页面和图片无需命令行、npm 或联网；外部史料链接需要联网。
- 源码开发：在项目目录运行 `npm ci`、`npm run dev`。
- 生产构建：`npm run build`。在静态 HTTP 服务上提供 dist 即可。
- 目标浏览器 Chrome 129 及以上。布局适应 1920、1440、720 像素及手机窄屏。移动端和减少动态效果模式使用静态首屏。

## 依赖和用途

| 库 | 用途 |
| --- | --- |
| React / React DOM | 页面与少量交互状态 |
| TypeScript / Vite | 类型检查、开发服务器和静态构建 |
| Tailwind CSS / Vite 插件 | 基础样式与工具类，展陈布局由项目 CSS 定义 |
| Framer Motion | 阅读进度、地图说明切换及减少动态偏好检测 |
| GSAP / ScrollTrigger | 入场、视差、标题揭示、路线和时间轴绘制 |
| Lucide React | 导航、地图、媒体控制图标 |

## 史料与素材

路线章正文依据各站史料编写，对应来源记录在 src/exhibit-notes.ts。地图使用 [Natural Earth 公有领域河流数据](https://www.naturalearthdata.com/about/terms-of-use/) 和关键地点近似经纬度。地形阴影和等高线基于 Mapzen Terrain Tiles 的高程数据，已重投影并随站离线分发。高程数据包括 SRTM 等来源，见 [Mapzen 署名说明](https://www.mapzen.com/rights/)。红线按历史先后连接节点，省略实际绕行。地图不用于测绘。

- 首屏以雪山情境画和配套动态镜头展陈。
- 重要历史以十幅情境插画呈现，标题跳转到征途路线中对应的史料讲解。档案照片与现址照片保留来源说明。
- 档案及现址照片的署名、来源和许可位于图片说明。遵义会议会址照片由 Xiquinho Silva 拍摄，采用 CC BY 4.0，本站进行了缩放、WebP 编码和显示裁切。
- 毛泽东照片为 1937 年埃德加·斯诺拍摄，文件页标注 CC0。周恩来照片为 1937 年 12 月，作者不详，文件页标注 PD-China。长征时期红军影像作者不详，文件页标注 PD-China。

## 参赛填写

队伍名、队长和成员由参赛者填入完整版本。匿名版本按选手手册去除身份信息。此工程包用于本地展示和继续编辑。

## 标题字体与配乐

- 首页「长」采用志莽行书，「征」采用 [流江毛草](https://github.com/google/fonts/tree/main/ofl/liujianmaocao)，章节和展图标题采用 [志莽行书](https://github.com/google/fonts/tree/main/ofl/zhimangxing)。本地 WOFF2 只包含展览标题字形，授权在 `public/fonts`。
- 配乐 [Helios](https://www.scottbuckley.com.au/library/helios/) 由 Scott Buckley 作曲，采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。随包提供转码后的 MP3，默认静音，点击导航栏的配乐按钮播放。
