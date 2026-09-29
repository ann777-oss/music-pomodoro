import { useRef, useState } from 'react'
import DotClock from '../components/DotClock.jsx'
import SegmentedBar from '../components/SegmentedBar.jsx'
import PhaseLine from '../components/PhaseLine.jsx'
import Readout from '../components/Readout.jsx'
import NowPlayingCard from '../components/NowPlayingCard.jsx'
import Motto from '../components/Motto.jsx'
import { BtnPrimary, BtnOutline } from '../components/Buttons.jsx'
import { useLearners } from '../hooks/useLearners.js'
import { FLOW_TYPES } from '../data/pools'
import { remainText } from '../lib/timeline'

// P2 番茄进行页：纯净无切歌入口；连点三下调出放弃面板（深藏应急入口）；
// 底部 TOGETHER 在学人数（陪伴感，demo 模拟数据）
export default function FocusPage({ p, onToggleTheme }) {
  const { session, track, speed } = p
  const learners = useLearners()
  const [panel, setPanel] = useState(false)
  const clicksRef = useRef([])

  // 连点三下（800ms 内）调出放弃面板
  const onTap = () => {
    if (panel) return
    const now = Date.now()
    clicksRef.current = clicksRef.current.filter(t => now - t < 800)
    clicksRef.current.push(now)
    if (clicksRef.current.length >= 3) {
      setPanel(true)
      clicksRef.current = []
    }
  }

  const remain = remainText(session.secElapsed)
  const focusMin = Math.floor(
    session.history.reduce((acc, h) => acc + h.duration, 0) / 60)

  return (
    <main className="pg-page" onClick={onTap}>
      <div className="pg-topbar">
        <span className="brand">MUSIC POMODORO</span>
        <span className="pg-right">
          <span>SESSION {String(session.pomodoroIndex + 1).padStart(2, '0')}</span>
          <BtnOutline onClick={(e) => { e.stopPropagation(); p.setSpeed(speed === 1 ? 15 : 1) }}>
            SIM ×{speed}
          </BtnOutline>
          <BtnOutline onClick={(e) => { e.stopPropagation(); onToggleTheme?.() }}>INV</BtnOutline>
        </span>
      </div>

      <div className="fo-hero">
        <DotClock mm={remain.slice(0, 2)} ss={remain.slice(3)} />
        <PhaseLine phaseKey={session.phase.key} state="running" />
        <Motto />
      </div>

      <div style={{ marginTop: 48 }}>
        <SegmentedBar done={session.minuteDone} current={session.minuteDone} />
      </div>

      <div className="fo-readout">
        <Readout bpm={session.phase.bpm} vol={session.phase.vol * 100}
                 interrupt={session.interrupts.length} />
      </div>

      <div className="fo-card">
        <NowPlayingCard
          title={track.pool === 'fire' ? (session.songs?.fireName || '点火曲')
                : track.pool === 'glide' ? (session.songs?.glideName || '滑入曲')
                : track.pool === 'flow'
                  ? (session.songs?.flowType
                      ? `${FLOW_TYPES[session.songs.flowType]?.label} · 心流声场`
                      : '心流曲库 · 纯音乐')
                : '大鱼 · 纯音乐版'}
          sub={`${track.pool.toUpperCase()} POOL · FADE 10S`}
        />
      </div>

      <div className="fo-foot">
        <div className="fo-stats">
          <div className="fo-st"><span className="k">TODAY</span>
            <span className="v">{session.history.length}/{session.pomodoroIndex + 1}</span><span className="u">颗</span></div>
          <div className="fo-st"><span className="k">FOCUS</span>
            <span className="v">{focusMin}</span><span className="u">MIN</span></div>
          <div className="fo-st"><span className="k">STREAK</span>
            <span className="v">{p.streak}</span><span className="u">DAYS</span></div>
          <div className="fo-st"><span className="k">TOGETHER</span>
            <span className="v">{learners.toLocaleString('en-US')}</span><span className="u">人在学</span></div>
        </div>
      </div>

      {panel && (
        <div className="fo-mask" onClick={() => setPanel(false)}>
          <div className="fo-panel" onClick={e => e.stopPropagation()}>
            <h4>确定放弃这颗番茄？</h4>
            <p>唱针已落，音乐未完。<br/>放弃将如实记录（今日报告中标记为破戒）。</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <BtnPrimary onClick={() => { setPanel(false); p.abandon() }}>放弃</BtnPrimary>
              <BtnOutline onClick={() => setPanel(false)}>继续专注</BtnOutline>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
