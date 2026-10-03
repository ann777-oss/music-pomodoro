import { useState } from 'react'

// SettingsPanel 阶段时长设置（改动 11）：
// 三阶段步进器（点火 0-15 / 滑入 0-20 / 心流 5-60），允许 0（如"静得下心的人全调成心流"）；
// 仅 idle 期入口；保存 = 生效 + 持久化 mp-timeline；默认 5/10/30。
const LIMITS = [
  { key: 'fire',  label: '点火', min: 0, max: 15 },
  { key: 'glide', label: '滑入', min: 0, max: 20 },
  { key: 'flow',  label: '心流', min: 5, max: 60 },
]

export default function SettingsPanel({ cfg, onSave, onClose }) {
  const [draft, setDraft] = useState(cfg)
  const total = draft.fire + draft.glide + draft.flow

  const step = (key, d, lim) => setDraft(dr => ({
    ...dr, [key]: Math.max(lim.min, Math.min(lim.max, dr[key] + d)),
  }))

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-panel" onClick={e => e.stopPropagation()}>
        <div className="sp-head">
          <span className="sp-title">设置 · 阶段时长</span>
          <button className="sp-close" onClick={onClose} aria-label="关闭">✕</button>
        </div>

        <div className="st-list">
          {LIMITS.map(lim => (
            <div key={lim.key} className="st-row">
              <span className="st-name">{lim.label}</span>
              <span className="st-range">{lim.min}–{lim.max} MIN</span>
              <span className="st-ctrl">
                <button className="st-btn" onClick={() => step(lim.key, -5, lim)} aria-label={`${lim.label}减5`}>−5</button>
                <button className="st-btn" onClick={() => step(lim.key, -1, lim)} aria-label={`${lim.label}减1`}>−</button>
                <b className="st-val">{draft[lim.key]}</b>
                <button className="st-btn" onClick={() => step(lim.key, 1, lim)} aria-label={`${lim.label}加1`}>+</button>
                <button className="st-btn" onClick={() => step(lim.key, 5, lim)} aria-label={`${lim.label}加5`}>+5</button>
              </span>
            </div>
          ))}
        </div>

        <p className="st-total">
          番茄总长 <b>{total}</b> 分钟
          <span className="st-hint">（点火 0 = 直接进滑入；静得下心可全调心流）</span>
        </p>

        <div className="st-actions">
          <button className="st-save" onClick={() => { onSave(draft); onClose() }}>保存</button>
          <button className="st-cancel" onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  )
}
