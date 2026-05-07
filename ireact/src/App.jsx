import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Perfil from "./components/header.jsx";


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
