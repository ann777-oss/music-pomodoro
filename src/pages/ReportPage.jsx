import Readout from '../components/Readout.jsx'
import SegmentedBar from '../components/SegmentedBar.jsx'
import { BtnPrimary } from '../components/Buttons.jsx'

// P4 日报告页：学习结束时；破戒番茄标红中断格
export default function ReportPage({ p }) {
  const { session } = p
  const totalMin = Math.floor(session.history.reduce((a, h) => a + h.duration, 0) / 60)
  const doneCount = session.history.filter(h => h.result === 'done').length
  const longestMin = Math.max(0, ...session.history.map(h => Math.floor(h.duration / 60)))
  const interruptTotal = session.history.reduce((a, h) => a + h.interrupts.length, 0)

  return (
    <main className="pg-page">
      <div className="pg-topbar">
        <span className="brand">MUSIC POMODORO</span>
        <span>SESSION REPORT</span>
      </div>

      <div className="rp-hero">
        <div className="rp-big">{totalMin}</div>
        <div className="rp-big-u">MIN · 今日专注分钟</div>
      </div>

      <div style={{ marginTop: 40 }}>
        <Readout bpm={doneCount} vol={longestMin} interrupt={interruptTotal} />
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.14em',
                    color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center', marginTop: 12 }}>
          完成番茄 · 最长连续 MIN · 中断（信号红）</p>
      </div>

      <div className="rp-rows">
        {session.history.map((h, i) => (
          <div key={i} className="rp-row">
            <span>#{String(i + 1).padStart(2, '0')}</span>
            <span style={{ color: h.result === 'done' ? 'var(--secondary)' : 'var(--accent-text)' }}>
              {h.result === 'done' ? 'DONE' : 'BROKEN'}</span>
            <div className="bar">
              <SegmentedBar
                done={Math.min(45, Math.floor(h.duration / 60))}
                current={-1}
                markRed={h.interrupts.map(x => Math.floor(x.at / 60))}
                showScale={false}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rp-actions">
        <BtnPrimary onClick={p.resetDay}>开始新的一天</BtnPrimary>
      </div>
    </main>
  )
}
