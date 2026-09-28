import Readout from '../components/Readout.jsx'
import SegmentedBar from '../components/SegmentedBar.jsx'
import { BtnPrimary } from '../components/Buttons.jsx'

// 鼓励语梯度：按今日完成数（Newsreader 每页一句配额）
function encouragement(done) {
  if (done === 0) return '今天没让番茄响起——明天，唱针再落。'
  if (done <= 2) return '阶梯的第一级，已经砌好。'
  if (done <= 4) return '今天的深度，值得写进乐谱。'
  return '名副其实的一天，指挥家。'
}

// P4 日报告页：学习结束时；破戒番茄标红中断格；累计数据 + 鼓励（改动 3）
export default function ReportPage({ p }) {
  const { session, lifetime } = p
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

      {/* 跨天累计 + 听歌数（改动 3） */}
      <div className="rp-acc">
        <span className="ro-k">ACCUMULATED · 累计</span>
        <span className="rp-acc-num">{(lifetime.min / 60).toFixed(1)}</span>
        <span className="ro-u">小时专注</span>
        <span className="rp-acc-dot">·</span>
        <span className="rp-acc-num">{lifetime.tracks}</span>
        <span className="ro-u">首歌听过</span>
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

      <p className="rp-encourage">{encouragement(doneCount)}</p>

      <div className="rp-actions">
        <BtnPrimary onClick={p.resetDay}>开始新的一天</BtnPrimary>
      </div>
    </main>
  )
}
