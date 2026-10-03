// C3 PhaseLine 阶段状态行：统一状态机（idle/running/paused/needs-input/done），状态先行
import { getTimeline } from '../lib/timeline'

export default function PhaseLine({ phaseKey, state = 'running' }) {
  const phases = getTimeline().phases
  const phase = phases.find(p => p.key === phaseKey) || phases[0]
  return (
    <div className="pl-line">
      <span className={`pl-stat ${state}`} aria-hidden="true"></span>
      <b>{phase.label}</b>
      <span>{state === 'paused' ? '已暂停 · 音乐停走，随时回来'
            : `${phase.tempo} · 第{{ fire: '一', glide: '二', flow: '三' }[phase.key]}乐章`}</span>
    </div>
  )
}
