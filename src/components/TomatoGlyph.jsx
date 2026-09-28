// 品牌图形 · 点阵番茄（可爱萌版）：横向椭圆红果 + 小翘叶 + 双点高光（果冻感）。
// 几何函数生成：茎(0,6) / 顶叶 r1 / 侧翘叶 r2 / 果实椭圆 cx=6 cy=7.5 rx=6 ry=4.9。
// 渲染要点：点用 width:100% + aspect-ratio:1 显式正圆（禁 grid stretch 拉成椭圆）。
export default function TomatoGlyph({ size = 112 }) {
  const dots = []
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      let cls = null
      if (r === 0 && c === 6) {
        cls = 'leaf'                                        // 茎
      } else if (r === 1 && c >= 5 && c <= 7) {
        cls = 'leaf'                                        // 顶叶（小而圆）
      } else if (r === 2 && ((c >= 3 && c <= 4) || (c >= 8 && c <= 9))) {
        cls = 'leaf'                                        // 左右翘叶
      } else {
        const dx = (c - 6) / 6                              // 横向椭圆果实
        const dy = (r - 7.5) / 4.9
        if (dx * dx + dy * dy <= 1) cls = 'fruit'
      }
      if (cls) {
        // 左上双高光（萌感）：大高光两连点 + 小高光一点
        const isHl = (r === 5 && (c === 3 || c === 4)) || (r === 6 && c === 3)
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
