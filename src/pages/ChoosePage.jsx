import { useEffect, useRef, useState } from 'react'
import DotClock from '../components/DotClock.jsx'
import SongPicker from '../components/SongPicker.jsx'
import { BtnPrimary, BtnGhost } from '../components/Buttons.jsx'
import { HEART_POOL, FLOW_TYPES, FLOW_DEFAULT } from '../data/pools'
import { CHOOSE_SEC } from '../lib/timeline'

// P1 选歌页：90 秒限时选两首歌（每日首番茄；超时自动继承当前候选）。
// 改动 6：定向选歌——"从歌单选"打开 SongPicker（搜索 + 阶段预筛列表）。
// 改动 7：心流声场——第三导演位（5 类型 pill 一键切换 + 15s 试听）。
export default function ChoosePage({ p }) {
  const [fireIdx, setFireIdx] = useState(() => Math.floor(Math.random() * HEART_POOL.fire.length))
  const [glideIdx, setGlideIdx] = useState(() => Math.floor(Math.random() * HEART_POOL.glide.length))
  const [picked, setPicked] = useState({ ignite: null, glide: null })   // 歌单定向选中（覆盖轮换候选）
  const [picker, setPicker] = useState(null)                             // null | 'ignite' | 'glide'
  const [flowType, setFlowType] = useState(FLOW_DEFAULT)                // 心流声场类型
  const [previewing, setPreviewing] = useState(null)                    // 正在试听的类型 key
  const previewRef = useRef(null)                                       // 试听 Audio（与主引擎隔离）
  const confirmedRef = useRef(false)
  const { chooseLeft } = p

  // 当前生效的展示曲目：定向选中优先，否则轮换候选
  const fireView = picked.ignite
    ? { title: picked.ignite.title, tag: `${picked.ignite.artist} · ${picked.ignite.bpm} BPM` }
    : { title: HEART_POOL.fire[fireIdx].name, tag: `${HEART_POOL.fire[fireIdx].tag} · 高能上桌` }
  const glideView = picked.glide
    ? { title: picked.glide.title, tag: `${picked.glide.artist} · ${picked.glide.bpm} BPM` }
    : { title: HEART_POOL.glide[glideIdx].name, tag: `${HEART_POOL.glide[glideIdx].tag} · 熟悉旋律` }

  const stopPreview = () => {
    if (previewRef.current) {
      previewRef.current.pause()
      previewRef.current = null
    }
    setPreviewing(null)
  }

  // 15s 试听：与主引擎完全隔离（独立 Audio，音量 0.5，自动停）
  const togglePreview = type => {
    stopPreview()
    if (type !== previewing) {
      const a = new Audio(FLOW_TYPES[type].file)
      a.volume = 0.5
      a.onended = () => stopPreview()
      a.play().catch(() => {})                      // 浏览器拦截时静默
      previewRef.current = a
      setPreviewing(type)
      setTimeout(() => {                            // 最多 15s
        if (previewRef.current === a) stopPreview()
      }, 15000)
    }
  }

  // 卸载 / 确认开跑：停预览（番茄开始不被试听干扰）
  useEffect(() => () => stopPreview(), [])
  useEffect(() => {
    if (chooseLeft <= 0) stopPreview()
  }, [chooseLeft])

  const confirm = () => {
    if (confirmedRef.current) return
    confirmedRef.current = true
    stopPreview()
    p.confirmSongs({
      fire: '/audio/fire-01.wav',
      glideStart: '/audio/glide-01.wav',
      fireName: fireView.title,
      glideName: glideView.title,
      flowType,
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
  // 轮换操作回到快速模式（清除该阶段的定向选中）
  const rollFire = d => { setPicked(pk => ({ ...pk, ignite: null })); setFireIdx(i => shift(HEART_POOL.fire, i, d)) }
  const rollGlide = d => { setPicked(pk => ({ ...pk, glide: null })); setGlideIdx(i => shift(HEART_POOL.glide, i, d)) }

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
          <div className="ch-name">{fireView.title}</div>
          <div className="ch-tag">{fireView.tag}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="ch-swap" onClick={() => rollFire(-1)}>‹</button>
            <button className="ch-swap" onClick={() => rollFire(1)}>› 换一首</button>
            <button className="ch-pick" onClick={() => setPicker('ignite')}>从歌单选</button>
          </div>
        </div>
        <div className="ch-card">
          <div className="ch-slot"><span>Ⅱ GLIDE</span><span>滑入</span></div>
          <div className="ch-name">{glideView.title}</div>
          <div className="ch-tag">{glideView.tag}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="ch-swap" onClick={() => rollGlide(-1)}>‹</button>
            <button className="ch-swap" onClick={() => rollGlide(1)}>› 换一首</button>
            <button className="ch-pick" onClick={() => setPicker('glide')}>从歌单选</button>
          </div>
        </div>
      </div>

      {/* Ⅲ 心流声场（改动 7）：5 类型 pill 一键切换 + 15s 试听 */}
      <div className="ch-flowcard">
        <div className="ch-slot"><span>Ⅲ FLOW</span><span>心流 · 声场</span></div>
        <div className="ch-flowrow">
          <div className="ch-pills">
            {Object.entries(FLOW_TYPES).map(([key, t]) => (
              <button key={key}
                className={`ch-pill${flowType === key ? ' on' : ''}`}
                onClick={() => { stopPreview(); setFlowType(key) }}>
                {t.label}
              </button>
            ))}
          </div>
          <button className={`ch-pill prev${previewing ? ' on' : ''}`}
            onClick={() => togglePreview(flowType)}>
            {previewing ? '■ 停止' : '▶ 试听'}
          </button>
        </div>
        <div className="ch-tag">{FLOW_TYPES[flowType].desc} · 默认钢琴，随时可换</div>
      </div>

      <div className="ch-actions">
        <BtnPrimary onClick={confirm}>确认并开始</BtnPrimary>
        <BtnGhost onClick={() => p.inheritSongs()}>继承上次配置</BtnGhost>
      </div>

      {picker && (
        <SongPicker
          mode={picker}
          onPick={song => {
            setPicked(pk => ({ ...pk, [picker]: song }))
            setPicker(null)
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </main>
  )
}
