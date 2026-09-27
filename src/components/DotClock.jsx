// C1 点阵时钟：Doto 数字 + 圆点冒号单元（design.md §3：冒号不是字体字形）
export default function DotClock({ mm, ss, size = 'lg' }) {
  return (
    <div className={`dc-clock dc-${size}`} role="timer" aria-label={`剩余 ${mm} 分 ${ss} 秒`}>
      <span>{mm}</span>
      <span className="dc-colon" aria-hidden="true"><i></i><i></i></span>
      <span>{ss}</span>
    </div>
  )
}
