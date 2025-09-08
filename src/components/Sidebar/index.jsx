// src/components/Sidebar/index.jsx

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const regions = [
  { name: "all", label: "Todos os Pokémons" },
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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Se a sidebar estiver aberta e o clique for fora dela
      const isMenuToggle = event.target.closest('.menu-toggle');
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && !isMenuToggle) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSidebarOpen, setIsSidebarOpen]);

  return (
    // Anexamos a referência à div principal da sidebar
    <aside ref={sidebarRef} className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <h2>Regiões</h2>
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
  );
};

export default Sidebar;