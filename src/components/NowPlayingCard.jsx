// C5 NowPlayingCard 播放卡：磨砂玻璃 + 真实唱片图（圆形抠图透明底，改动 15）+ inline 状态
import DotDisc from './DotDisc.jsx'

export const RECORD_IMG = '/vinyl/record.png'   // 圆形抠图透明底（public/vinyl/）

export default function NowPlayingCard({ title, sub, status = 'PLAYING', spinning = true, discSize = 54 }) {
  return (
    <section className="np-card">
      <DotDisc size={discSize} spinning={spinning} img={RECORD_IMG} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="np-title">{title}</div>
        <div className="np-sub">
          <span className="np-status">{status}</span>
          <span>{sub}</span>
        </div>
      </div>
    </section>
  )
}
