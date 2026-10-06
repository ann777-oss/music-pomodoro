import { useState } from 'react'
import DotClock from '../components/DotClock.jsx'
import AchievementCard from '../components/AchievementCard.jsx'
import { BtnPrimary, BtnOutline, BtnGhost } from '../components/Buttons.jsx'

// P3 休息页：10 分钟人间段；唯一常规改歌入口；末 30 秒预告下一段点火。
// Task 5.3：第一颗完成时展示成就卡（每次会话仅一次）。
export default function RestPage({ p }) {
  const { session, restLeft } = p
  const [celebrated, setCelebrated] = useState(false)
  const doneCount = session.history.filter(h => h.result === 'done').length
  const isFirstDone = !celebrated && session.history.length === 1
    && session.history[0].result === 'done'

  const mm = String(Math.floor(restLeft / 60)).padStart(2, '0')
  const ss = String(restLeft % 60).padStart(2, '0')

  return (
    <main className="pg-page">
      <div className="pg-topbar">
        <span className="brand">MUSIC POMODORO</span>
        <span>RESTING</span>
      </div>

      <div className="re-center">
        <DotClock mm={mm} ss={ss} size="md" />
        <div className="pl-line">
          <span className="pl-stat idle" aria-hidden="true"></span>
          <b style={{ color: 'var(--primary)' }}>休息</b>
          <span>我可以，且不止于此</span>
        </div>

        <div className="fo-stats" style={{ gap: 32 }}>
          <div className="fo-st"><span className="k">TODAY</span>
            <span className="v">{doneCount}</span><span className="u">颗完成</span></div>
          <div className="fo-st"><span className="k">NEXT</span>
            <span className="v">{session.pomodoroIndex + 1}</span><span className="u">颗待启</span></div>
        </div>

        {restLeft <= 30 && restLeft > 0 && (
          <p className="re-next">NEXT: IGNITE INCOMING · 点火前奏渐入</p>
        )}

        <div className="re-actions">
          <BtnOutline onClick={p.rechoose}>修改今日两首歌</BtnOutline>
          <BtnPrimary onClick={p.nextPomodoro}>再来一颗</BtnPrimary>
          <BtnGhost onClick={p.finishDay}>结束今天的学习</BtnGhost>
        </div>
      </div>

      {isFirstDone && (
        <AchievementCard onClose={() => setCelebrated(true)} />
      )}
    </main>
  )
}
