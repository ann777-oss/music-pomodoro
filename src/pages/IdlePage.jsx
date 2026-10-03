import { useState } from 'react'
import { BtnPrimary, BtnOutline } from '../components/Buttons.jsx'
import SettingsPanel from '../components/SettingsPanel.jsx'
import { getTimeline } from '../lib/timeline'

// Idle 首页（方案二「被导演的 45 分钟」+ v2.3 参数化）：
// 大字 = 当前配置总长（如 45:00）；三段旋律波形与阶段标签按配置分钟数动态分配；
// 右上 SET = 阶段时长设置（改动 11）；昨日成就 footnote。
const ROMAN = ['Ⅰ', 'Ⅱ', 'Ⅲ']
// 三段波形高度特征：点火粗壮跳动 / 滑入中幅过渡 / 心流低缓细密（粗细反差=速度感）
const HEIGHT_FN = {
  fire:  i => 16 + 15 * Math.abs(Math.sin(i * 1.35)),
  glide: i => 9 + 6 * (0.5 + 0.5 * Math.sin(i * 0.75 + 1)),
  flow:  i => 5 + 2.4 * (0.5 + 0.5 * Math.sin(i * 0.42)),
}

const isYesterday = rec =>
  rec && rec.date === new Date(Date.now() - 86400000).toISOString().slice(0, 10)

export default function IdlePage({ p, onStart }) {
  const [showSet, setShowSet] = useState(false)
  const tl = getTimeline()
  const mm = String(tl.totalMin).padStart(2, '0')

  // 波形 70 根按三段分钟比例分配（最少 3 根保留特征）
  const TOTAL_BARS = 70
  let acc = 0
  const segs = tl.phases.map(ph => {
    const bars = Math.max(3, Math.round(TOTAL_BARS * ph.bars / tl.totalMin))
    const start = acc
    acc += bars
    return { key: ph.key, bars, start, label: `${ROMAN[tl.phases.indexOf(ph)]} · ${ph.label} ${ph.bars}′ ${ph.tempo.toUpperCase()} ${ph.bpm}` }
  })

  let footnote = '今天的第一颗，等待点亮。'
  if (p && isYesterday(p.yesterday) && p.yesterday.count > 0) {
    const hrs = p.lifetime.min > 0 ? ` · 累计学习时长 ${(p.lifetime.min / 60).toFixed(1)} 小时` : ''
    footnote = `昨日 ${p.yesterday.count} 颗点亮${hrs}。`
  }

  let k = 0   // 亮度流全局序

  return (
    <main className="pg-page">
      <div className="pg-topbar">
        <span className="brand">MUSIC POMODORO</span>
        <span className="pg-right">
          <BtnOutline onClick={() => setShowSet(true)}>SET</BtnOutline>
        </span>
      </div>

      <div className="id-center">
        <div className="id-big">{mm}<span className="id-colon">:</span>00</div>
        <p className="id-brand">音 乐 番 茄 钟</p>
        <p className="id-slogan">Every pomodoro, a performance we conduct.</p>
        <BtnPrimary onClick={onStart}>开始今天的第一颗</BtnPrimary>
      </div>
      <div className="id-bottom">
        <div className="id-scorewrap">
          <div className="id-melody">
            {segs.map(sg => (
              <div className="id-seg" key={sg.key}>
                {Array.from({ length: sg.bars }, (_, i) => (
                  <i key={i} className="id-bar"
                    style={{ height: HEIGHT_FN[sg.key](i).toFixed(1) + 'px', animationDelay: `${(k++) * 0.12}s` }} />
                ))}
              </div>
            ))}
          </div>
          <div className="id-labels">
            {segs.map(sg => <span key={sg.key}>{sg.label}</span>)}
          </div>
        </div>
        <p className="id-footnote">{footnote}</p>
      </div>

      {showSet && (
        <SettingsPanel
          cfg={p.timeline.cfg}
          onSave={p.saveTimeline}
          onClose={() => setShowSet(false)}
        />
      )}
    </main>
  )
}
