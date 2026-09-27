import { useState } from 'react'
import './styles/tokens.css'

// Phase 0 验证页：验证 Doto 字体渲染、主题切换、tokens 生效
export default function App() {
  const [light, setLight] = useState(false)

  return (
    <div
      data-theme={light ? 'light' : undefined}
      style={{
        background: 'var(--bg)',
        color: 'var(--primary)',
        minHeight: '100vh',
        padding: 24,
        fontFamily: 'var(--f-ui)',
        transition: 'background .4s ease-in-out, color .4s ease-in-out',
      }}
    >
      <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.3em', color: 'var(--secondary)' }}>
        MUSIC POMODORO · PHASE 0
      </p>

      {/* Doto 点阵验证：数字应为分离的圆点 */}
      <p
        style={{
          fontFamily: 'var(--f-display)',
          fontVariationSettings: "'ROND' 100",
          fontWeight: 400,
          fontSize: 96,
          lineHeight: 1,
          color: 'var(--display)',
          marginTop: 32,
        }}
      >
        28:30
      </p>

      {/* 中文 fallback 验证 */}
      <p style={{ marginTop: 24, fontSize: 15, color: 'var(--secondary)' }}>
        音乐番茄钟 · 心流阶段 · 每颗番茄，都是一场音乐导演
      </p>

      {/* 信号红 token 验证 */}
      <p style={{ marginTop: 24, fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--accent-text)' }}>
        INTERRUPT 0 (SIGNAL RED)
      </p>

      <button
        onClick={() => setLight(!light)}
        style={{
          marginTop: 32,
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          letterSpacing: '.1em',
          padding: '8px 18px',
          background: 'transparent',
          color: 'var(--primary)',
          border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-sm)',
          cursor: 'pointer',
        }}
      >
        INV
      </button>
    </div>
  )
}
