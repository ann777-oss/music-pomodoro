// C5 NowPlayingCard 播放卡：磨砂玻璃 + 点阵唱片 + inline 状态（禁 toast）+ 点阵均衡器
import DotDisc from './DotDisc.jsx'
import DotEQ from './DotEQ.jsx'

export default function NowPlayingCard({ title, sub, status = 'PLAYING', spinning = true, discSize = 54 }) {
  return (
    <section className="np-card">
      <DotDisc size={discSize} spinning={spinning} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="np-title">{title}</div>
        <div className="np-sub">
          <span className="np-status">{status}</span>
          <span>{sub}</span>
        </div>
      </div>
      <DotEQ />
    </section>
  )
}
