import React, { useState } from 'react';
import Home from './pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Region from './pages/Region';
import PokemonDetail from './pages/PokemonDetail';
import ErrorPage from './pages/ErrorPage';
import TeamBuilder from './pages/TeamBuilder';
import TeamCompleted from './pages/TeamCompleted';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div>
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main>
          <div onClick={toggleSidebar}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/region/:regionName" element={<Region />} />
            <Route path="/pokemon/:pokemonName" element={<PokemonDetail />} />
            <Route path="/team-builder" element={<TeamBuilder />} />
            <Route path="/team-builder-completed" element={<TeamCompleted />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;