import AdminPanel from './AdminPanel'
import "./index.css"
import { Toaster, toast } from 'sonner'

function App() {

  return (
    <>
      <Toaster position='bottom-center' />
      <AdminPanel />
    </>
  )
}

export default App
