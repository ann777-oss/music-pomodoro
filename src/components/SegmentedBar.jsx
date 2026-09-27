// C2 SegmentedBar 频谱时间轴：45 格离散方块 = 45 分钟（design.md 签名组件）
// done：已点亮格数；current：当前脉冲格索引；markRed：标红格索引（破戒/中断，信号红唯一 fill 场景）
const GROUPS = [
  { cls: 'sb-g1', n: 5, label: 'Ⅰ', name: '点火 5′' },
  { cls: 'sb-g2', n: 10, label: 'Ⅱ', name: '滑入 10′' },
  { cls: 'sb-g3', n: 30, label: 'Ⅲ', name: '心流 30′' },
]

export default function SegmentedBar({ done = 0, current = -1, markRed = [], showScale = true }) {
  let idx = -1
  return (
    <div>
      <div className="sb-bar" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={45}>
        {GROUPS.map(g => (
          <div key={g.label} className={`sb-group ${g.cls}`}>
            {Array.from({ length: g.n }, () => {
              idx++
              const i = idx
              const cls = [
                'sb-cell',
                i < done ? 'on' : '',
                i === current && i >= done - 1 ? 'cur' : '',   // 当前分钟（含刚过界）脉冲
                markRed.includes(i) ? 'red' : '',
              ].filter(Boolean).join(' ')
              return <span key={i} className={cls} />
            })}
          </div>
        ))}
      </div>
      {showScale && (
        <div className="sb-scale">
          {GROUPS.map(g => (
            <span key={g.label} className={`s ${g.cls}`}>
              <b>{g.label}</b>{g.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
