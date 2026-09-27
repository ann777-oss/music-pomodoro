import { useEffect, useRef, useState } from 'react'
import { AudioEngine } from './lib/audioEngine'
import { POOLS } from './data/pools'
import { phaseAt, remainText, targetVolume } from './lib/timeline'
import './styles/tokens.css'

// Phase 2 听测页：验证曲池调度 / crossfade / 音量曲线 / 灵活边界。
// 访问方式：dev server 下 http://localhost:5173/?audio-test
export default function AudioTest() {
  const engineRef = useRef(null)
  const secRef = useRef(0)
  const [sec, setSec] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [log, setLog] = useState([])
  const [track, setTrack] = useState({ pool: '—', file: '—' })
  const [paused, setPaused] = useState(false)

  const addLog = (msg) =>
    setLog(l => [`[${remainText(secRef.current)}] ${msg}`, ...l].slice(0, 40))

  const start = async () => {
    const eng = new AudioEngine(POOLS)
    engineRef.current = eng
    eng.onTrackChange((pool, file) => {
      setTrack({ pool, file: file.split('/').pop() })
      addLog(`切歌 → ${pool}: ${file.split('/').pop()}`)
    })
    await eng.startPomodoro({
      fire: POOLS.fire.tracks[0],
      glideStart: POOLS.glide.tracks[0],
    })
    setSec(0)
    secRef.current = 0
    setLog([])
    addLog('番茄开始（fire: fire-01, glideStart: glide-01）')
  }

  // 速度驱动：30 tick/s，每 tick 前进 speed/30 虚拟秒 → 每真实秒 = speed 虚拟秒
  useEffect(() => {
    if (!speed || !engineRef.current) return
    const timer = setInterval(() => {
      secRef.current = Math.min(45 * 60, secRef.current + speed / 30)
      setSec(secRef.current)
      engineRef.current.tick(secRef.current)
    }, 33)
    return () => clearInterval(timer)
  }, [speed])

  const phase = phaseAt(sec)
  const vol = targetVolume(sec)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--primary)', minHeight: '100vh',
                  padding: 24, fontFamily: 'var(--f-mono)', fontSize: 13 }}>
      <p style={{ fontFamily: 'var(--f-mono)', letterSpacing: '.3em', color: 'var(--secondary)', marginBottom: 20 }}>
        PHASE 2 · AUDIO ENGINE TEST
      </p>

      <button onClick={start} style={btn}>① 开始番茄（建立 AudioContext）</button>
      {' '}
      <button onClick={() => setSpeed(s => s === 0 ? 15 : 0)} style={speed ? btnOn : btn}>
        ② {speed ? '暂停驱动' : '×15 驱动'}
      </button>
      {' '}
      <button onClick={() => { if (engineRef.current) { setPaused(!paused); paused ? engineRef.current.resume() : engineRef.current.pause() } }} style={btn}>
        ③ {paused ? '恢复' : '暂停'}（中断联动）
      </button>

      <div style={{ marginTop: 24, display: 'grid', gap: 8 }}>
        <div>虚拟时间 <b style={doto}>{remainText(sec)}</b>（已过 {Math.floor(sec)}s）</div>
        <div>期望阶段（时间轴）: <b>{phase.key} / {phase.tempo}</b></div>
        <div>引擎实际播放池: <b>{track.pool}</b> —— {track.file}</div>
        <div>目标音量: <b style={doto}>{Math.round(vol * 100)}%</b>（曲线）</div>
      </div>

      <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
        <p style={{ color: 'var(--secondary)', marginBottom: 8 }}>事件日志（新→旧）</p>
        {log.map((line, i) => (
          <div key={i} style={{ color: 'var(--secondary)', lineHeight: 1.9 }}>{line}</div>
        ))}
      </div>

      <p style={{ marginTop: 24, color: 'var(--secondary)', fontSize: 11, lineHeight: 1.9 }}>
        听测要点：×15 下 fire 期 20s、glide 期 40s、flow 期 120s。<br />
        · 边界"截断"：5:00 处 fire-01 剩 10s &lt; 15s → 应记 pending，歌播完后切 glide（延迟切）；<br />
        · 15:00 处若 glide 歌剩余 &gt; 15s → 直接 crossfade 进 flow（时间轴优先）；<br />
        · crossfade 10s 无爆音；音量随曲线从 100% 降到 60%。
      </p>
    </div>
  )
}

const btn = {
  fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.1em',
  padding: '8px 14px', background: 'transparent', color: 'var(--primary)',
  border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', cursor: 'pointer',
}
const btnOn = { ...btn, background: 'var(--display)', color: 'var(--bg)' }
const doto = { fontFamily: 'var(--f-display)', fontVariationSettings: "'ROND' 100", fontWeight: 400, fontSize: 18 }
