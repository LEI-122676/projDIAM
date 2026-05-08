import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header.jsx';
import Sidebar from './sidebar.jsx';
import '../css/styles.css';

const Frigorifico = () => {
  const [ingredientes, setIngredientes] = useState(['Ingrediente A']);
  const [novoIngrediente, setNovoIngrediente] = useState('');
  const navigate = useNavigate();

  const adicionarIngrediente = (e) => {
    e.preventDefault();
    if (novoIngrediente.trim() !== '') {
      setIngredientes([...ingredientes, novoIngrediente.trim()]);
      setNovoIngrediente('');
    }
  };

  const removerIngrediente = (index) => {
    const novaLista = ingredientes.filter((_, i) => i !== index);
    setIngredientes(novaLista);
  };

  const irParaReceitas = () => {
    navigate('/receitas?filter=frigorifico');
  };

  return (
    <div className="body-wrapper">
      <Header />
      <div className="main-wrapper">
        <Sidebar />
        <main className="content-frigorifico">
          <div className="fridge-container">
            
            <div className="fridge-header">
              <h1 className="page-title-underline">O Meu Frigorífico</h1>
              <button className="btn-mostrar-receitas" onClick={irParaReceitas}>
                Mostrar Receitas
              </button>
            </div>

            <section className="fridge-input-card">
              <form onSubmit={adicionarIngrediente} className="fridge-form">
                <div className="input-group">
                  <label className="inter-bold">Ingrediente:</label>
                  <input 
                    type="text" 
                    placeholder="Insira um ingrediente" 
                    value={novoIngrediente}
                    onChange={(e) => setNovoIngrediente(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-guardar">Guardar</button>
              </form>
            </section>

            <section className="ingredients-grid">
              {ingredientes.map((ing, index) => (
                <div key={index} className="ingredient-tag">
                  <button className="remove-btn" onClick={() => removerIngrediente(index)}>✕</button>
                  <span className="ingredient-name">{ing}</span>
                </div>
              ))}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Frigorifico;