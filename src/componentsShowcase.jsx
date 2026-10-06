import { useState } from 'react'
import DotClock from './components/DotClock.jsx'
import SegmentedBar from './components/SegmentedBar.jsx'
import PhaseLine from './components/PhaseLine.jsx'
import Readout from './components/Readout.jsx'
import NowPlayingCard from './components/NowPlayingCard.jsx'
import DotField from './components/DotField.jsx'
import { BtnPrimary, BtnOutline, BtnGhost } from './components/Buttons.jsx'
import './styles/tokens.css'
import './components/components.css'

// Phase 3 组件陈列页：对照 design.md §11 自检清单验收
export default function ComponentsShowcase() {
  const [light, setLight] = useState(false)
  const [tab, setTab] = useState(0)

  return (
    <div data-theme={light ? 'light' : undefined} style={{ background: 'var(--bg)', color: 'var(--primary)', minHeight: '100vh', transition: 'background .4s ease-in-out, color .4s ease-in-out' }}>
      <DotField />

      <main className="cs-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.3em', color: 'var(--secondary)' }}>
            PHASE 3 · COMPONENTS C1–C7
          </p>
          <BtnOutline onClick={() => setLight(!light)}>INV</BtnOutline>
        </div>

        <section className="cs-sec">
          <h3>C1 DotClock（lg / md）</h3>
          <DotClock mm="28" ss="30" />
          <DotClock mm="28" ss="30" size="md" />
        </section>

        <section className="cs-sec">
          <h3>C2 SegmentedBar（进行中 / 完成带破戒格 / 初始）</h3>
          <SegmentedBar done={16} current={16} />
          <SegmentedBar done={45} current={-1} markRed={[7, 12]} />
          <SegmentedBar done={0} current={-1} />
        </section>

        <section className="cs-sec">
          <h3>C3 PhaseLine（running / idle / needs-input）</h3>
          <PhaseLine phaseKey="flow" state="running" />
          <PhaseLine phaseKey="fire" state="idle" />
          <PhaseLine phaseKey="glide" state="needs-input" />
        </section>

        <section className="cs-sec">
          <h3>C4 Readout（正常 / 中断信号红）</h3>
          <Readout bpm={72} vol={60} interrupt={0} />
          <Readout bpm={96} vol={80} interrupt={2} />
        </section>

        <section className="cs-sec">
          <h3>C5 NowPlayingCard（旋转 / 静止）</h3>
          <NowPlayingCard title="大鱼 · 纯音乐版" sub="心流曲库 60–90 BPM · FADE 10S" spinning={true} />
          <NowPlayingCard title="暂停演示" sub="RESTING · 我可以，且不止于此" status="IDLE" spinning={false} discSize={40} />
        </section>

        <section className="cs-sec">
          <h3>C6 Buttons（主=黑白反转 / 描边 / Ghost）</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <BtnPrimary onClick={() => setTab(t => t + 1)}>SIMULATE {tab}</BtnPrimary>
            <BtnOutline>INV</BtnOutline>
            <BtnGhost>继承上次配置</BtnGhost>
          </div>
        </section>

        <p style={{ fontFamily: 'var(--f-editorial)', fontStyle: 'italic', fontSize: 15, color: 'var(--secondary)', textAlign: 'center', marginTop: 40 }}>
          Every pomodoro, a performance we conduct.
        </p>
      </main>
    </div>
  )
}
