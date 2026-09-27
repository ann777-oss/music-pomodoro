// C3 PhaseLine 阶段状态行：统一状态机（idle/running/needs-input/done），状态先行
import { PHASES } from '../lib/timeline'

export default function PhaseLine({ phaseKey, state = 'running' }) {
  const phase = PHASES.find(p => p.key === phaseKey) || PHASES[0]
  return (
    <div className="pl-line">
      <span className={`pl-stat ${state}`} aria-hidden="true"></span>
      <b>{phase.label}</b>
      <span>{phase.tempo} · 第{{ fire: '一', glide: '二', flow: '三' }[phase.key]}乐章</span>
    </div>
  )
}
