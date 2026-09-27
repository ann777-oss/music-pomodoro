import { BtnPrimary } from './Buttons.jsx'

// 新手引导（Task 5.2）：首次使用展示，15 秒内讲清三阶段 + 应急操作。
// 关闭即写 localStorage 标记，二次进入不出现。
export default function Onboarding({ onClose }) {
  const rows = [
    { no: 'Ⅰ', key: '点火', en: 'IGNITE', desc: '爱曲上桌，多巴胺拉你落座', dur: '5′' },
    { no: 'Ⅱ', key: '滑入', en: 'GLIDE', desc: '熟悉旋律，大脑停止警戒', dur: '10′' },
    { no: 'Ⅲ', key: '心流', en: 'FLOW', desc: '纯音乐垫底，消失在背景', dur: '30′' },
  ]
  return (
    <div className="ob-mask">
      <div className="ob-panel">
        <p className="ob-title">HOW IT CONDUCTS · 一颗番茄，一场导演</p>
        <p className="ob-sub">四十五分钟 · 你只需要选两首歌</p>

        <div className="ob-rows">
          {rows.map((r, i) => (
            <div key={r.no} className="ob-row" style={{ animationDelay: `${i * 0.12 + 0.2}s` }}>
              <span className="ob-no">{r.no}</span>
              <span className="ob-key">{r.key}</span>
              <span className="ob-en">{r.en}</span>
              <span className="ob-desc">{r.desc}</span>
              <span className="ob-dur">{r.dur}</span>
            </div>
          ))}
        </div>

        <p className="ob-hint">中途想停？连点屏幕三下。</p>
        <BtnPrimary onClick={onClose}>开始</BtnPrimary>
      </div>
    </div>
  )
}
