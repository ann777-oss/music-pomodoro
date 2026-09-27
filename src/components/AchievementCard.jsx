import { BtnPrimary } from './Buttons.jsx'
import SegmentedBar from './SegmentedBar.jsx'

// 首番茄成就卡（Task 5.3）：第一颗完成时的仪式化展示——价值感知前置。
export default function AchievementCard({ onClose }) {
  return (
    <div className="ob-mask" onClick={onClose}>
      <div className="ob-panel ac-panel" onClick={e => e.stopPropagation()}>
        <p className="ob-title">FIRST POMODORO · 完成</p>
        <div className="ac-big">45</div>
        <p className="ob-sub">你人生第一颗音乐番茄（分钟）</p>
        <div className="ac-bars">
          <SegmentedBar done={45} current={-1} showScale={false} />
        </div>
        <div className="ac-rows">
          <span>Ⅰ 点火 5′</span><span>Ⅱ 滑入 10′</span><span>Ⅲ 心流 30′</span>
        </div>
        <p className="ac-quote">Forty-five minutes, fully conducted.</p>
        <BtnPrimary onClick={onClose}>继续</BtnPrimary>
      </div>
    </div>
  )
}
