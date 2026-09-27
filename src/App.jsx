import AudioTest from './audioTest.jsx'
import Phase0 from './phase0.jsx'
import './styles/tokens.css'

// 路由：?audio-test 进入 Phase 2 听测页；默认 Phase 0 验证页
export default function App() {
  if (window.location.search.includes('audio-test')) {
    return <AudioTest />
  }
  return <Phase0 />
}
