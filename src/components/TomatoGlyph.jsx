// 品牌图形 · 点阵番茄：红果(--accent) + 绿叶(--leaf 新 token) + 果面高光。
// 几何函数生成（同 DotDisc 技法）；13×13 网格：r0 茎 / r1-2 三叉叶 / r3-12 果实圆。
// 注：品牌 wordmark 级图形，非 UI 状态信号（design.md §6 品牌图形条款）。
export default function TomatoGlyph({ size = 96 }) {
  const dots = []
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      let cls = null
      if (r === 0 && c === 6) {
        cls = 'leaf'                                   // 茎
      } else if (r === 1 && c >= 4 && c <= 8) {
        cls = 'leaf'                                   // 主叶
      } else if (r === 2 && ((c >= 2 && c <= 4) || (c >= 8 && c <= 10))) {
        cls = 'leaf'                                   // 左右展叶
      } else {
        const d = Math.hypot(c - 6, r - 7.8)          // 果实圆（含轻微高光点）
        if (d <= 4.9) cls = 'fruit'
      }
      if (cls) {
        const isHl = (r === 5 && c === 3) || (r === 5 && c === 4) || (r === 6 && c === 3)
        dots.push(<i key={`${r}-${c}`} className={isHl ? 'hl' : cls} />)
      }
    }
  }
  return (
    <div className="tg-tomato" style={{ '--gs': `${size}px` }} role="img" aria-label="番茄点阵标识">
      {dots}
    </div>
  )
}
