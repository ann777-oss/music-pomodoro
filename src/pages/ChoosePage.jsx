import { useEffect, useRef, useState } from 'react'
import DotClock from '../components/DotClock.jsx'
import SongPicker from '../components/SongPicker.jsx'
import { BtnPrimary, BtnGhost } from '../components/Buttons.jsx'
import { HEART_POOL, FLOW_TYPES, FLOW_GROUPS, FLOW_DEFAULT, BG_TYPES, BG_DEFAULT } from '../data/pools'
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
  const [bgType, setBgType] = useState(BG_DEFAULT)                       // 计时背景（改动 10）
  const [previewing, setPreviewing] = useState(null)                    // 正在试听的类型 key
  const previewRef = useRef(null)                                       // 试听 Audio（与主引擎隔离）
  const previewKeyRef = useRef(null)                                    // 试听中类型（同步读，免闭包态）
  const confirmedRef = useRef(false)
  const { chooseLeft } = p

  // 背景实时预览（改动 12）：选中即切换试看，与番茄页同款渲染规则
  const bgFile = BG_TYPES[bgType]?.file || null
  useEffect(() => {
    document.body.classList.toggle('has-bg', !!bgFile)
    return () => document.body.classList.remove('has-bg')
  }, [bgFile])

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
    previewKeyRef.current = null
    setPreviewing(null)
  }

  // 选中即试听（改动 12）：点 pill = 切换选中 + 自动播 15s；再点同 pill = 停止。
  // 独立 Audio 通道（音量 0.5，与主引擎隔离），15s / 播完 / 切换 / 确认 / 卸载 自动停。
  const pickFlow = key => {
    const wasThis = previewKeyRef.current === key
    stopPreview()
    setFlowType(key)
    if (!wasThis) {
      const a = new Audio(FLOW_TYPES[key].file)
      a.volume = 0.5
      a.onended = () => stopPreview()
      a.play().catch(() => {})                      // 浏览器拦截时静默
      previewRef.current = a
      previewKeyRef.current = key
      setPreviewing(key)
      setTimeout(() => {                           // 最多 15s
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
      bgType,
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
      {/* 背景实时预览层（改动 12）：与番茄页同款——图 cover + 纯色遮罩 */}
      {bgFile && (
        <div className="fo-bgwrap" aria-hidden="true">
          <img src={bgFile} alt="" />
          <div className="fo-bgmask" />
        </div>
      )}

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

      {/* Ⅲ 心流声场（改动 7 + 9 + 12）：8 类型分两组；选中即试听 15s（♪ 标记正在播） */}
      <div className="ch-flowcard">
        <div className="ch-slot"><span>Ⅲ FLOW</span><span>心流 · 声场</span></div>
        {FLOW_GROUPS.map(g => (
          <div key={g.key} className="ch-flowrow">
            <span className="ch-grouplabel">{g.label}</span>
            <div className="ch-pills">
              {Object.entries(FLOW_TYPES).filter(([, t]) => t.group === g.key)
                .map(([key, t]) => (
                  <button key={key}
                    className={`ch-pill${flowType === key ? ' on' : ''}${previewing === key ? ' playing' : ''}`}
                    onClick={() => pickFlow(key)}>
                    {t.label}
                  </button>
                ))}
            </div>
          </div>
        ))}
        <div className="ch-tag">{FLOW_TYPES[flowType].desc} · 选中即试听 15s，再点停止</div>
      </div>

      {/* IV 计时背景（改动 10）：默认 / 窗边 / 伴学 三选一 */}
      <div className="ch-flowcard">
        <div className="ch-slot"><span>Ⅳ SCENE</span><span>计时背景</span></div>
        <div className="ch-flowrow">
          <div className="ch-pills">
            {Object.entries(BG_TYPES).map(([key, b]) => (
              <button key={key}
                className={`ch-pill${bgType === key ? ' on' : ''}`}
                onClick={() => setBgType(key)}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ch-tag">{BG_TYPES[bgType].desc}</div>
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
