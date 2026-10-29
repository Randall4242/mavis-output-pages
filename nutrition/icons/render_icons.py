"""Pillow 逐像素画图标，不走浏览器截 SVG。
drinking-tracker 那边截 SVG 连撞三次渐变色块，换成逐像素画一次过。"""

import numpy as np
from PIL import Image, ImageDraw

BG      = (250, 250, 249)
ACCENT  = (94, 106, 210)
GREEN   = (74, 157, 118)
YELLOW  = (184, 138, 68)
RED     = (196, 92, 79)
TEXT    = (31, 31, 31)
FAINT   = (160, 160, 160)

SIZES = {
    "favicon-32.png": 32,
    "favicon-64.png": 64,
    "apple-touch-icon.png": 180,
    "icon-192.png": 192,
    "icon-512.png": 512,
    "icon-maskable-512.png": 512,
}


def draw_plate(draw, cx, cy, r, color, width):
    """餐盘：一个圆环 + 盘沿。"""
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=width)


def draw_fork(draw, cx, cy, h, color, width):
    """叉子：细柄 + 三根细长齿。
    齿要细（width 的一半）且长（3/4 h），否则缩小后糊成一个方块。"""
    x = cx
    tooth_w = max(1, width // 2)
    gap = width * 0.85
    # 柄: 从齿根到下端
    draw.line([x, cy - h * 0.28, x, cy + h], fill=color, width=width)
    # 齿: 只画左右两根，中间那根就是柄本身的延伸
    for k in (-1, 1):
        draw.line([x + k * gap, cy - h, x + k * gap, cy - h * 0.22],
                  fill=color, width=tooth_w)


def render(size, maskable=False):
    """逐像素画。maskable 版本留 20% 安全边距，图形缩到中间 60%。"""
    img = Image.new("RGBA", (size, size), BG + (255,))
    d = ImageDraw.Draw(img)
    s = size / 512.0                      # 以 512 为设计基准
    scale = 0.6 if maskable else 1.0       # maskable 缩到中间
    cx = cy = size / 2
    w = max(1, int(round(28 * s * scale)))

    # 餐盘圆环
    draw_plate(d, cx, cy - 10 * s * scale, 132 * s * scale, ACCENT, w)
    # 盘内中心点
    dot = 20 * s * scale
    dcy = cy - 10 * s * scale
    d.ellipse([cx - dot, dcy - dot, cx + dot, dcy + dot], fill=ACCENT)

    # 顶部进度条：绿色短条 + 黄色中段，暗示"对着目标"
    bar_w = 190 * s * scale
    bar_h = 26 * s * scale
    bx0 = cx - bar_w / 2
    by0 = cy - 10 * s * scale - 132 * s * scale - bar_h - 30 * s * scale
    d.rounded_rectangle([bx0, by0, bx0 + bar_w, by0 + bar_h],
                        radius=bar_h / 2, fill=ACCENT)
    # 黄色高亮段（超标那段）
    seg_w = bar_w * 0.34
    d.rounded_rectangle([bx0 + bar_w - seg_w, by0, bx0 + bar_w, by0 + bar_h],
                        radius=bar_h / 2, fill=YELLOW)
    # 绿色达标段
    seg_w = bar_w * 0.22
    d.rounded_rectangle([bx0, by0, bx0 + seg_w, by0 + bar_h],
                        radius=bar_h / 2, fill=GREEN)

    # 叉子，放在盘子右侧留够间距
    draw_fork(d, cx + 196 * s * scale, cy - 10 * s * scale, 112 * s * scale, ACCENT, w)
    return img


def main():
    for name, size in SIZES.items():
        maskable = "maskable" in name
        img = render(size, maskable)
        out = f"/workspace/nutrition-tracker/web/icons/{name}"
        img.save(out, "PNG", optimize=True)
        print("写出", out, img.size)


if __name__ == "__main__":
    main()
