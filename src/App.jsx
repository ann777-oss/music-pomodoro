import { useState } from 'react'
import { usePomodoro, onboarded, markOnboarded } from './hooks/usePomodoro.js'
import DotField from './components/DotField.jsx'
import Onboarding from './components/Onboarding.jsx'
import AudioTest from './audioTest.jsx'
import ComponentsShowcase from './componentsShowcase.jsx'
import IdlePage from './pages/IdlePage.jsx'
import ChoosePage from './pages/ChoosePage.jsx'
import FocusPage from './pages/FocusPage.jsx'
import RestPage from './pages/RestPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import './styles/tokens.css'
import './components/components.css'
import './pages/pages.css'

// 主应用：状态机路由四页（design.md §5）+ 首次引导（Task 5.2）
function MainApp() {
  const [light, setLight] = useState(false)
  const [showOb, setShowOb] = useState(() => !onboarded())
  const p = usePomodoro()

  return (
    <div data-theme={light ? 'light' : undefined}
         style={{ background: 'var(--bg)', color: 'var(--primary)', minHeight: '100vh',
                  transition: 'background .4s var(--ease), color .4s var(--ease)' }}>
      <DotField />
      {p.session.state === 'idle' && <IdlePage p={p} onStart={p.start} />}
      {p.session.state === 'choosing' && <ChoosePage p={p} />}
      {p.session.state === 'running' &&
        <FocusPage p={p} onToggleTheme={() => setLight(l => !l)} />}
      {p.session.state === 'resting' && <RestPage p={p} />}
      {p.session.state === 'report' && <ReportPage p={p} />}
      {showOb && (
        <Onboarding onClose={() => { markOnboarded(); setShowOb(false) }} />
      )}
    </div>
  )
}

// 路由：?audio-test 听测页 / ?components 组件陈列 / 默认主应用
export default function App() {
  const q = window.location.search
  if (q.includes('audio-test')) return <AudioTest />
  if (q.includes('components')) return <ComponentsShowcase />
  return <MainApp />
}
