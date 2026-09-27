import { BtnPrimary } from '../components/Buttons.jsx'

// Idle 首页：今天的第一颗番茄从一个点按开始
export default function IdlePage({ onStart }) {
  return (
    <main className="pg-page">
      <div className="id-center">
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 13, letterSpacing: '.55em',
                    textIndent: '.55em', color: 'var(--secondary)' }}>
          音 乐 番 茄 钟
        </p>
        <p className="id-slogan">Every pomodoro, a performance we conduct.</p>
        <BtnPrimary onClick={onStart}>开始今天的第一颗</BtnPrimary>
      </div>
    </main>
  )
}
