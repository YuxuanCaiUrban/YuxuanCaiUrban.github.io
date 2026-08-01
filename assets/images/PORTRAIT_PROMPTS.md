# About 页照片改造提示词

把 `me.jpg`(海边礁石上的黑白背影)改成与站点风格一致的版本。

---

## 0. 先看清楚现状

| 项目 | 情况 |
|---|---|
| 源图 | `C:\Users\caiyu\OneDrive\个人网站\me.jpg` — 1024×768,**横向 4:3**,高对比黑白 |
| 站上照片位 | `.about-photo`,**竖向 3:4**,列宽 300px |
| 当前状态 | **空的**,里面是占位文字 `[ portrait ]` 和 TODO 注释 |

**所以生成时直接出 3:4 竖版**(比如 1024×1365),不要出 4:3 再裁——人物在画面偏左,横裁竖会把人切掉。

**一个有利条件**:这张照片里脸部不可辨识,人物基本是剪影。所以风格化**不涉及"保持人像相似度"**这个最难的问题,模型不会把你的脸画歪。

---

## 1. 机制(和配图那份一致)

- 模型:**`gemini-3-pro-image`**(Nano Banana Pro),在 [Google AI Studio](https://aistudio.google.com) 跑
- **上传 `me.jpg` 作为参考图**,这是图生图不是文生图 —— 提示词里必须明确"保留原图的构图与人物姿态"
- 比例参数:`image_config.aspect_ratio = "3:4"`
- 没有负面提示词,想去掉什么就正面描述你要什么
- 多生成几版挑一版

---

## 2. 三个方向(推荐 A)

### A. 像素画转换 ★推荐

和首页的像素城市直接呼应。人物是剪影,像素化后反而更有力量。

> Convert the attached photograph into a 16-bit pixel-art illustration, keeping
> the original composition and the figure's pose exactly as they are: a lone
> person in a long coat standing on dark rocks at the shoreline, looking down,
> sea and horizon behind them.
>
> Render it as chunky pixel art on a coarse grid — roughly 160 pixels across —
> with hard-edged blocks, no anti-aliasing and no gradients. Keep the stark
> high-contrast reading of the original: a near-white sky and sea, the rocks and
> the figure in deep near-black. Work in a restrained palette of about eight
> tones running from off-white through cool grey to near-black, with a single
> accent — a faint magenta-pink (#ff4d9d) catching the water's edge and a thin
> cyan (#3ee6ff) line along the horizon. The figure stays a solid dark
> silhouette with no facial detail.
>
> Vertical 3:4 composition: more sky above the figure than the original has, the
> rocks filling the lower third. Quiet and contemplative, not neon or busy.

---

### B. 双色调照片(最保守)

保持它是一张**照片**,只把色调映射到站点配色。学术站点上最稳妥。

> Keep the attached photograph exactly as it is — same composition, same figure,
> same grain and texture, still unmistakably a photograph. Do not stylise or
> redraw it.
>
> Re-grade it as a duotone: map the shadows to a deep navy-purple (#171232) and
> the highlights to a soft warm off-white, with the midtones passing through a
> muted violet. Add a faint magenta (#ff4d9d) tint in the brightest part of the
> sky where it meets the horizon. Keep the stark blown-out contrast of the
> original.
>
> Recompose to a vertical 3:4 frame by extending the sky above the figure,
> keeping the person and the rocks in the lower two-thirds.

---

### C. 夜景重打光(改动最大)

把白天海边变成夜色,和首页城市同一个世界。

> Using the attached photograph as the composition reference, keep the figure's
> pose and the rock formation exactly, but re-light the scene as night.
>
> The sky becomes a deep navy-to-purple gradient with a scatter of stars; the sea
> turns near-black with neon reflections rippling across it in magenta (#ff4d9d)
> and cyan (#3ee6ff). A distant city skyline glows faintly on the horizon line.
> The figure remains a solid dark silhouette, rim-lit along one shoulder in cyan.
> Illustrated 16-bit pixel-art treatment, hard-edged, no gradients within the
> blocks.
>
> Vertical 3:4 composition. Contemplative rather than dramatic — this is a person
> alone at the edge of a city, not an action scene.

---

## 3. 我的建议

**A 或 B,不建议 C。**

- **A** 和首页最协调,而且这张照片的剪影特质天然适合像素化
- **B** 最安全:学术站点上,一张真实照片比插画更可信
- **C** 改动太大,会把一张有个人意味的照片变成一张通用的赛博朋克插画,反而失去它原本的味道

---

## 4. 一个需要你自己判断的问题

这张照片里**认不出你是谁**——人物很小、背对镜头、脸在阴影里。

作为艺术照它很好,但作为学术主页的"个人照片",通常读者是期待能看到你的脸的(尤其是招聘委员会、会议上想认出你的人)。

两个选择:
- **保留这张**,把它当作氛围图 —— 那就按上面的提示词改造
- **另外放一张正脸照**,这张移到别处(比如首页或页脚)当氛围

这是你的取舍,我只是提醒一下。

---

## 5. 生成之后

把成品放到 `assets/images/`,告诉我文件名,我把 About 页那个占位符换成真实图片(现在还是 `[ portrait ]` 文字)。一行的事。
