// 品牌图形 · 点阵番茄（halftone 波普版，参照用户示例图）：
// 饱满圆果 + 5 裂尖萼片放射 + 边缘密度消散（核心实心 / 边缘交错跳点）+ 左上弧形高光带。
// 几何：果实椭圆 cx=7 cy=8.8 rx=5.9 ry=5.3；深度 t=1-d 驱动密度（halftone 灵魂）；
// 渲染：width:100% + aspect-ratio:1 显式正圆（禁 grid stretch 拉椭圆）。
export default function TomatoGlyph({ size = 112 }) {
  const dots = []
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      let cls = null

      // —— 5 裂尖萼片（放射状）：中叶 + 左右各两片外展 ——
      if ((r === 0 && c === 7)) cls = 'leaf'                          // 中叶尖
      else if (r === 1 && (c === 6 || c === 7 || c === 8)) cls = 'leaf'
      else if (r === 2 && c >= 5 && c <= 9) cls = 'leaf'              // 宽萼行
      else if (r === 3 && ((c >= 4 && c <= 5) || (c >= 9 && c <= 10))) cls = 'leaf'  // 外展片

      // —— 果实：深度驱动密度（t 统一计算一次）——
      if (!cls) {
        const dx = (c - 7) / 5.9
        const dy = (r - 8.8) / 5.3
        const t = 1 - Math.sqrt(dx * dx + dy * dy)          // 归一化深度（1=中心 0=边缘）
        if (t >= 0.32) cls = 'fruit'                              // 主体实心
        else if (t >= 0.16 && (r + c) % 2 === 0) cls = 'fruit'   // 边缘环：交错跳点（halftone 消散）
        if (cls === 'fruit' && c < 6.5 && r < 7.5 && t > 0.3 && t < 0.75) cls = 'hl'   // 左上高光带
      }

      if (cls) dots.push(<i key={`${r}-${c}`} className={cls} />)
    }
  }
  return (
    <div className="tg-tomato" style={{ '--gs': `${size}px` }} role="img" aria-label="番茄点阵标识">
      {dots}
    </div>
  )
}
