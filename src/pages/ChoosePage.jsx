import { useEffect, useRef, useState } from 'react'
import DotClock from '../components/DotClock.jsx'
import { BtnPrimary, BtnGhost } from '../components/Buttons.jsx'
import { HEART_POOL } from '../data/pools'
import { CHOOSE_SEC } from '../lib/timeline'

// P1 选歌页：90 秒限时选两首歌（每日首番茄；超时自动继承当前候选）
export default function ChoosePage({ p }) {
  const [fireIdx, setFireIdx] = useState(() => Math.floor(Math.random() * HEART_POOL.fire.length))
  const [glideIdx, setGlideIdx] = useState(() => Math.floor(Math.random() * HEART_POOL.glide.length))
  const confirmedRef = useRef(false)
  const { chooseLeft } = p

  const confirm = () => {
    if (confirmedRef.current) return
    confirmedRef.current = true
    p.confirmSongs({
      fire: '/audio/fire-01.wav',
      glideStart: '/audio/glide-01.wav',
      fireName: HEART_POOL.fire[fireIdx].name,
      glideName: HEART_POOL.glide[glideIdx].name,
    })
  }

  // 超时：自动继承（当前候选直接生效，不惩罚）
  useEffect(() => {
    if (chooseLeft <= 0) confirm()
  }, [chooseLeft])

  const mm = String(Math.floor(Math.max(0, chooseLeft) / 60)).padStart(2, '0')
  const ss = String(Math.max(0, chooseLeft) % 60).padStart(2, '0')
  const danger = chooseLeft <= 15   // 剩余 <15s：信号红（催促信号，design.md §6）

  const shift = (arr, i, d) => (i + d + arr.length) % arr.length

  return (
    <main className="pg-page">
      <div className="pg-topbar">
        <span className="brand">MUSIC POMODORO</span>
        <span>今日选歌</span>
      </div>

      <div className={`ch-clockwrap${danger ? ' ch-danger' : ''}`}>
        <DotClock mm={mm} ss={ss} size="md" />
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.24em',
                    color: danger ? 'var(--accent-text)' : 'var(--secondary)',
                    textTransform: 'uppercase', marginTop: 16 }}>
          TIME TO CHOOSE · 每天两首歌
        </p>
      </div>

      <div className="ch-cards">
        <div className="ch-card">
          <div className="ch-slot"><span>Ⅰ IGNITE</span><span>点火</span></div>
          <div className="ch-name">{HEART_POOL.fire[fireIdx].name}</div>
          <div className="ch-tag">{HEART_POOL.fire[fireIdx].tag} · 高能上桌</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ch-swap" onClick={() => setFireIdx(i => shift(HEART_POOL.fire, i, -1))}>‹</button>
            <button className="ch-swap" onClick={() => setFireIdx(i => shift(HEART_POOL.fire, i, 1))}>› 换一首</button>
          </div>
        </div>
        <div className="ch-card">
          <div className="ch-slot"><span>Ⅱ GLIDE</span><span>滑入</span></div>
          <div className="ch-name">{HEART_POOL.glide[glideIdx].name}</div>
          <div className="ch-tag">{HEART_POOL.glide[glideIdx].tag} · 熟悉旋律</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="ch-swap" onClick={() => setGlideIdx(i => shift(HEART_POOL.glide, i, -1))}>‹</button>
            <button className="ch-swap" onClick={() => setGlideIdx(i => shift(HEART_POOL.glide, i, 1))}>› 换一首</button>
          </div>
        </div>
      </div>

      <div className="ch-actions">
        <BtnPrimary onClick={confirm}>确认并开始</BtnPrimary>
        <BtnGhost onClick={() => p.inheritSongs()}>继承上次配置</BtnGhost>
      </div>
    </main>
  )
}
