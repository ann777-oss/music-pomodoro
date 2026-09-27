// C5 内嵌 · 唱片组件：img 传入时渲染真实唱片图片（圆形裁切+旋转），
// 否则回退 9×9 点阵唱片（几何生成：外圆 4.25 + 交替沟槽 + 中心 hub）。
// 真实唱片图片素材待 P5 前替换（见 dev-plan 素材清单）。
export default function DotDisc({ size = 54, spinning = true, img = null }) {
  if (img) {
    return (
      <div className={`dd-disc dd-img${spinning ? ' spin' : ''}`} style={{ '--gs': `${size}px` }}>
        <img src={img} alt="" />
      </div>
    )
  }
  const dots = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const d = Math.hypot(r - 4, c - 4)
      if (d > 4.25) continue                      // 圆外不放点
      const cls = d <= 1.0 ? 'hub' : Math.round(d) % 2 === 0 ? '' : 'off'
      dots.push(<i key={`${r}-${c}`} className={cls} />)
    }
  }
  return (
    <div className={`dd-disc${spinning ? ' spin' : ''}`} style={{ '--gs': `${size}px` }} aria-hidden="true">
      {dots}
    </div>
  )
}
