import { BtnPrimary } from '../components/Buttons.jsx'

// Idle 首页（方案二「被导演的 45 分钟」定稿）：
// 45:00 点阵大字（冒号呼吸）+ 三段旋律波形（与阶段文字同构对齐）+ 昨日成就 footnote。
// 波形三段 = 三阶段音乐导演：Ⅰ 点火粗壮跳动 / Ⅱ 滑入中幅过渡 / Ⅲ 心流细密低缓。
const PHASES = [
  { label: 'Ⅰ · 点火 ALLEGRO 128', bars: 12, h: i => 16 + 15 * Math.abs(Math.sin(i * 1.35)) },
  { label: 'Ⅱ · 滑入 ANDANTE 96', bars: 18, h: i => 9 + 6 * (0.5 + 0.5 * Math.sin(i * 0.75 + 1)) },
  { label: 'Ⅲ · 心流 ADAGIO 72', bars: 40, h: i => 5 + 2.4 * (0.5 + 0.5 * Math.sin(i * 0.42)) },
]

// 昨日记录是否真的属于"昨天"（隔天未学则不显示旧成就）
const isYesterday = rec =>
  rec && rec.date === new Date(Date.now() - 86400000).toISOString().slice(0, 10)

export default function IdlePage({ p, onStart }) {
  // footnote 文案：昨日成就（真实持久化数据）或新用户引导
  let footnote = '今天的第一颗，等待点亮。'
  if (p && isYesterday(p.yesterday) && p.yesterday.count > 0) {
    const hrs = p.lifetime.min > 0 ? ` · 累计学习时长 ${(p.lifetime.min / 60).toFixed(1)} 小时` : ''
    footnote = `昨日 ${p.yesterday.count} 颗点亮${hrs}。`
  }

  let k = 0   // 亮度流全局序（沿时间轴扫过）

  return (
    <main className="pg-page">
      <div className="id-center">
        <div className="id-big">45<span className="id-colon">:</span>00</div>
        <p className="id-brand">音 乐 番 茄 钟</p>
        <p className="id-slogan">Every pomodoro, a performance we conduct.</p>
        <BtnPrimary onClick={onStart}>开始今天的第一颗</BtnPrimary>
      </div>
      <div className="id-bottom">
        <div className="id-scorewrap">
          <div className="id-melody">
            {PHASES.map((ph, g) => (
              <div className="id-seg" key={g}>
                {Array.from({ length: ph.bars }, (_, i) => (
                  <i key={i} className="id-bar"
                    style={{ height: ph.h(i).toFixed(1) + 'px', animationDelay: `${(k++) * 0.12}s` }} />
                ))}
              </div>
            ))}
          </div>
          <div className="id-labels">
            {PHASES.map((ph, g) => <span key={g}>{ph.label}</span>)}
          </div>
        </div>
        <p className="id-footnote">{footnote}</p>
      </div>
    </main>
  )
}
