// src/components/Loading/index.jsx

import React from 'react';
import './styles.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Carregando Pokémons...</p>
    </div>
  );
};

export default Loading;