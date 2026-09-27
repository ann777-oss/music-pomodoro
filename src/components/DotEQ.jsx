// C5 内嵌 · 点阵均衡器：3×3 圆点依次点亮（禁止条形，design.md §3）
export default function DotEQ() {
  return (
    <div className="dq-eq" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <i key={i} />)}
    </div>
  )
}
