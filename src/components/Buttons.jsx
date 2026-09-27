// C6 按钮组：主按钮黑白反转（禁红）；描边；Ghost
export function BtnPrimary({ children, onClick, type = 'button' }) {
  return <button type={type} className="bt-btn bt-primary" onClick={onClick}>{children}</button>
}

export function BtnOutline({ children, onClick, type = 'button' }) {
  return <button type={type} className="bt-btn bt-outline" onClick={onClick}>{children}</button>
}

export function BtnGhost({ children, onClick, type = 'button' }) {
  return <button type={type} className="bt-btn bt-ghost" onClick={onClick}>{children}</button>
}
