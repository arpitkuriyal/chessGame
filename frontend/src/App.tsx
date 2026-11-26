
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import Game from './pages/Game'
import History from './pages/History'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/game' element={<Game/>}/>
        <Route path='/history' element={<History/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
