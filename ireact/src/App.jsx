import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Perfil from "./components/perfil-frigorifico-login/perfil.jsx";
import Homepage from "./components/homepage.jsx";
import Frigorifico from "./components/perfil-frigorifico-login/frigorifico.jsx";
import Login from "./components/perfil-frigorifico-login/login.jsx";

function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>} />
        <Route path="/perfil" element={<Perfil/>} />
        <Route path="/frigorifico" element={<Frigorifico/>} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
