import AudioTest from './audioTest.jsx'
import ComponentsShowcase from './componentsShowcase.jsx'
import Phase0 from './phase0.jsx'
import './styles/tokens.css'

// 路由：?audio-test 听测页；?components 组件陈列页；默认 Phase 0 验证页
export default function App() {
  const q = window.location.search
  if (q.includes('audio-test')) return <AudioTest />
  if (q.includes('components')) return <ComponentsShowcase />
  return <Phase0 />
}
