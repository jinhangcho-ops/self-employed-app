import Toaster from '@/shared/Toaster'
import { useApp } from './context'
import ReceiptSheet from './receipt/ReceiptSheet'
import Guide from './receipt/Guide'
import DocSheet from './sheets/DocSheet'
import GateSheet from './sheets/GateSheet'
import IngSheet from './sheets/IngSheet'
import MenuSheet from './sheets/MenuSheet'
import SalesSheet from './sheets/SalesSheet'
import TabBar from './ui/TabBar'
import { buzz } from './lib/buzz'
import AuthView from './views/AuthView'
import Home from './views/Home'
import Ings from './views/Ings'
import Menus from './views/Menus'
import Onboard from './views/Onboard'
import Settings from './views/Settings'

const VIEWS = { cal: Home, menus: Menus, ings: Ings, settings: Settings, auth: AuthView, onboard: Onboard }

function Layer() {
  const { layer } = useApp()
  if (!layer) return null
  switch (layer.kind) {
    case 'sales':
      return <SalesSheet />
    case 'menu':
      return <MenuSheet key={layer.id ?? 'new'} id={layer.id} />
    case 'ing':
      return <IngSheet key={layer.id ?? 'new'} id={layer.id} />
    case 'gate':
      return <GateSheet />
    case 'doc':
      return <DocSheet doc={layer.doc} />
    case 'guide':
      return <Guide thenReceipt={layer.thenReceipt} />
    case 'receipt':
      return <ReceiptSheet />
  }
}

export default function App() {
  const { ui } = useApp()
  const View = VIEWS[ui.view]
  const cls = ['app', ui.enter && 'enter', ui.view === 'auth' && 'authbg'].filter(Boolean).join(' ')
  return (
    <>
      {/* key: 화면이 바뀔 때마다 나타나는 효과를 다시 재생 */}
      <div
        className={cls}
        key={ui.view}
        onPointerDown={(e) => {
          if ((e.target as Element).closest('.cta-main,.cta-sub,.btn.primary')) buzz(5)
        }}
      >
        <View />
      </div>
      <TabBar />
      <div
        id="layer"
        onPointerDown={(e) => {
          if ((e.target as Element).closest('.btn.primary,.step button')) buzz(5)
        }}
      >
        <Layer />
      </div>
      <Toaster />
    </>
  )
}
