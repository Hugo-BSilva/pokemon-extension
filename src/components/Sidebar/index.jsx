// src/components/Sidebar/index.jsx

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const regions = [
  { name: "all", label: "All Regions" },
  { name: "kanto", label: "Kanto" },
  { name: "updated-johto", label: "Johto" },
  { name: "updated-hoenn", label: "Hoenn" },
  { name: "original-sinnoh", label: "Sinnoh" },
  { name: "original-unova", label: "Unova" },
  { name: "kalos-coastal", label: "Kalos" },
  { name: "original-alola", label: "Alola" }
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const sidebarRef = useRef(null);
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // 1. Não faça nada se o menu não estiver aberto
      if (!isSidebarOpen) return;

      // 2. Verifica se o clique foi DENTRO da sidebar
      if (sidebarRef.current && sidebarRef.current.contains(event.target)) {
        return; // Clique dentro do menu, não fecha.
      }
      // 3. Verifica se o clique foi no botão que ABRE o menu (se for o caso, a lógica de abertura já lidou com isso)
      // Esta verificação é opcional se você usa um botão separado para abrir
      const isMenuToggle = event.target.closest('.menu-toggle');
      if (isMenuToggle) return;

      // 4. Se o menu está aberto E o clique foi fora, fecha
      closeSidebar();
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSidebarOpen, setIsSidebarOpen]);

  return (
    <>
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}
      <aside ref={sidebarRef} className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>

        <button className="close-button" onClick={closeSidebar}>
          &times; {/* Símbolo "X" */}
        </button>

        <h2>Regions</h2>
        <nav>
          <ul>
            {regions.map((region) => (
              <li key={region.name}>
                <Link to={region.name === 'all' ? '/' : `/region/${region.name}`}>
                  {region.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;