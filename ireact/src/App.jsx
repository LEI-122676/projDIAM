import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Perfil from "./components/perfil.jsx";
import Homepage from "./components/homepage.jsx";
import Login from "./components/login.jsx";


function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/perfil" element={<Perfil/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
