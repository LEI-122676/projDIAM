import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Perfil from "./components/perfil-frigorifico-login/perfil.jsx";
import Homepage from "./components/homepage.jsx";
import Frigorifico from "./components/perfil-frigorifico-login/frigorifico.jsx";
import Eventos from "./components/eventos/descobrir_eventos.jsx";
import Receitas from "./components/receitas/explorar_receitas.jsx";

function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>} />
        <Route path="/perfil" element={<Perfil/>} />
        <Route path="/frigorifico" element={<Frigorifico/>} />
        <Route path="/eventos" element={<Eventos/>} />
        <Route path="/receitas" element={<Receitas/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
