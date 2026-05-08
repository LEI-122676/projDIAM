import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Perfil from "./components/perfil-frigorifico-login/perfil.jsx";
import Homepage from "./components/homepage.jsx";
import Frigorifico from "./components/perfil-frigorifico-login/frigorifico.jsx";
import Eventos from "./components/eventos/descobrirEventos.jsx";
import Receitas from "./components/receitas/explorar_receitas.jsx";
import Login from "./components/perfil-frigorifico-login/login.jsx";
import CriarEvento from "./components/eventos/criarEvento.jsx";

function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>} />
        
        <Route path="/perfil" element={<Perfil/>} />
        <Route path="/frigorifico" element={<Frigorifico/>} />
        <Route path="/login" element={<Login/>} />
        
        <Route path="/receitas" element={<Receitas/>} />
        
        <Route path="/eventos" element={<Eventos/>} />
        <Route path="/eventos/criarEvento" element={<CriarEvento/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
