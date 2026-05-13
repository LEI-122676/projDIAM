import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Perfil from "./components/perfil-frigorifico-login/perfil.jsx";
import Homepage from "./components/homepage.jsx";
import Frigorifico from "./components/perfil-frigorifico-login/frigorifico.jsx";
import Eventos from "./components/eventos/descobrirEventos.jsx";
import CriarEvento from "./components/eventos/criarEvento.jsx";
import VerEvento from "./components/eventos/detalhesEvento.jsx"
import Receitas from "./components/receitas/explorar_receitas.jsx";
import CriarReceita from "./components/receitas/criar_receita.jsx";
import VerReceita from "./components/receitas/detalhes_receita.jsx";
import AsMinhasReceitas from "./components/receitas/minhas_receitas.jsx";
import Login from "./components/perfil-frigorifico-login/login.jsx";

function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>} />
        
        <Route path="/perfil" element={<Perfil/>} />
        <Route path="/perfil/minhas-receitas" element={<AsMinhasReceitas/>} />
        <Route path="/frigorifico" element={<Frigorifico/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/receitas" element={<Receitas/>} />
        <Route path="/eventos" element={<Eventos/>} />
        <Route path="/eventos/criarEvento" element={<CriarEvento/>} />
        <Route path="/eventos/verEvento" element={<VerEvento/>} />
        <Route path="/receitas" element={<Receitas/>} />
        <Route path="/receitas/criar-receita" element={<CriarReceita/>} />
        <Route path="/receitas/ver-receita" element={<VerReceita/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
