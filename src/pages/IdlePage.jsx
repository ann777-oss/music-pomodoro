import { BtnPrimary } from '../components/Buttons.jsx'
import TomatoGlyph from '../components/TomatoGlyph.jsx'

// Idle 首页：今天的第一颗番茄从一个点按开始（点阵番茄品牌标识）
export default function IdlePage({ onStart }) {
  return (
    <main className="pg-page">
      <div className="id-center">
        <TomatoGlyph size={112} />
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 13, letterSpacing: '.55em',
                    textIndent: '.55em', color: 'var(--secondary)', marginTop: 8 }}>
          音 乐 番 茄 钟
        </p>
        <p className="id-slogan">Every pomodoro, a performance we conduct.</p>
        <BtnPrimary onClick={onStart}>开始今天的第一颗</BtnPrimary>
      </div>
    </main>
  )
}
