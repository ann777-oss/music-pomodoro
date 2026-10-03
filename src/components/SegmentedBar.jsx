// C2 SegmentedBar 频谱时间轴：离散方块 = 分钟（design.md 签名组件）
// v2.3 参数化（改动 11）：格数/分区/标签随当前时间轴配置（默认 45 格 5/10/30）
// done：已点亮格数；current：当前脉冲格索引；markRed：标红格索引（破戒/中断，信号红唯一 fill 场景）
import { getTimeline } from '../lib/timeline'

const ROMAN = ['Ⅰ', 'Ⅱ', 'Ⅲ']

export default function SegmentedBar({ done = 0, current = -1, markRed = [], showScale = true }) {
  const { phases, totalMin } = getTimeline()
  let idx = -1
  return (
    <div>
      <div className="sb-bar" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={totalMin}>
        {phases.map((p, g) => (
          <div key={p.key} className={`sb-group sb-g${g + 1}`}>
            {Array.from({ length: p.bars }, () => {
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
          {phases.map((p, g) => (
            <span key={p.key} className={`s sb-g${g + 1}`}>
              <b>{ROMAN[g]}</b>{p.label} {p.bars}′
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
