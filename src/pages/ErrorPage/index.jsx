// src/pages/ErrorPage/index.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
    console.clear(); // <== Adicione esta linha
  };

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>Oops! Algo deu errado.</h1>
        <p>Não foi possível encontrar a página ou houve um erro no servidor.</p>
        <p>
          Tente voltar para a página inicial ou verifique sua conexão com a internet.
        </p>
        <button onClick={handleGoHome} className="error-button">
          Voltar para a Pokédex
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;