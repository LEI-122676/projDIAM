import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Perfil from "./components/perfil.jsx";


function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Perfil />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
