# 夜巡引导者立绘 — 用你的照片生成像素版

PM2.5 研究故事（`projects/pm25-mental-health.html`）和首页夜巡字幕框里的那个戴礼帽的人物，
现在是 `assets/night-guide.js` / `assets/nightwalk.js` 里手画的 48×64 像素图。
如果想让它更像你本人，可以用 Gemini 图生图做一张，放进来替换；手画版自动变成兜底。

---

## 0. 文件约定

| 项目 | 要求 |
|---|---|
| 路径 | `assets/images/stories/guide-sprite.png` |
| 格式 | PNG，**透明背景**（人物之外全透明，不要底色） |
| 比例 | 每一帧 **3:4 竖版**，半身像，帽顶到胸口，人物居中、头顶和两肩都留 1–2 格空白 |
| 像素尺寸 | 一帧 **48×64**（和手画版一致，CSS 已按 3×/4× 整数放大）；也可以 96×128 |
| 帧数 | 1 帧即可。想要眨眼和说话动画就并排放 **3 帧**：闲置、闭眼、张嘴，总宽 = 帧宽 × 3 |

帧宽按「高度 × 3/4」自动识别，所以一张图里只要高度对、帧并排放，脚本就能数出帧数。

## 1. 启用

两处 `<script>` 标签加上 `data-sprite` 属性即可，路径相对页面：

```html
<!-- projects/pm25-mental-health.html -->
<script src="../assets/night-guide.js" data-sprite="../assets/images/stories/guide-sprite.png"></script>

<!-- index.html -->
<script src="assets/nightwalk.js" data-sprite="assets/images/stories/guide-sprite.png"></script>
```

不加属性就不会去请求这张图（避免 404），页面继续用手画版。
首页用了外部立绘时不会再叠画香烟和烟。

## 2. 机制（和 `PORTRAIT_PROMPTS.md` 一致）

- 模型：`gemini-3-pro-image`（Nano Banana Pro），在 [Google AI Studio](https://aistudio.google.com) 跑
- **上传你的正脸照作为参考图**——这是图生图，提示词里要明确"保留参考图的脸、发型、眼镜"
- 比例参数 `image_config.aspect_ratio = "3:4"`
- 没有负面提示词，想去掉什么就正面描述你要什么
- 生成结果通常是 1024×1365 的"像素风"图而不是真像素。拿到后要**缩到 48×64**（Photoshop 用 Nearest Neighbor，
  或 `python -c "from PIL import Image; Image.open('in.png').resize((48,64), Image.NEAREST).save('guide-sprite.png')"`），
  再把背景抠透明。颜色多没关系，Canvas 直接画图，不走调色板

## 3. 提示词

> Turn the person in the attached photo into a 16-bit pixel-art character portrait for a
> visual novel, keeping their face, hairstyle, glasses and skin tone recognisably the same.
> Half-body, facing the viewer and looking slightly to the right of the frame, hat top to
> mid-chest, on a fully transparent background.
>
> Costume: a dark indigo fedora with a wine-red band, a wine-red scarf wrapped once with a
> tail hanging on the left, and a dark indigo overcoat with a lighter lapel and a white shirt
> showing at the collar. Light comes from the upper left; shadow falls down the right side of
> the face and coat.
>
> Render it as chunky pixel art on a coarse grid about 48 pixels wide and 64 tall: hard-edged
> blocks, a one-pixel dark outline, flat colour fills with at most two shades per material, no
> anti-aliasing and no gradients. Palette: deep purple-black #120a18 for outlines, indigo
> #1b1230 / #3b2f60 for the hat and coat, wine #6b2748 / #93405f for the band and scarf, warm
> skin #e0b091 with #b8846a shadow, off-white #eee6f2 for the shirt. Calm, slightly amused
> expression, mouth closed. Vertical 3:4 composition with the figure centred.

想要三帧动画，追加一段：

> Produce three versions side by side in one image at the same scale and position: the first as
> described, the second with both eyes closed, the third with the mouth open as if speaking.
> Nothing else changes between the three.

---

手画版的生成脚本在这次会话的 scratchpad（`make-guide.js`），眼镜是开关 `GLASSES`，发型、眉形、嘴角都是几行像素坐标，可以改。
