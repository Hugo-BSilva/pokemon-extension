import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

import RedBlue from '../../assets/red.jpg';
import BlueRed from '../../assets/blue.jpg';
import FireRed from '../../assets/firered.jpg';
import LeafGreen from '../../assets/leafgreen.jpg';
import SilverGold from '../../assets/silver.jpg';
import GoldSilver from '../../assets/gold.jpg';
import Crystal from '../../assets/crystal.jpg';
import Ruby from '../../assets/ruby.jpg';
import Sapphire from '../../assets/sapphire.jpg';
import Emerald from '../../assets/emerald.jpg';

// Kanto (Red)	red-blue
// Kanto (Blue)	red-blue
// Kanto (Fire Red)	fire-red
// Kanto (Leaf Green)	leaf-green
// Johto (Gold)	gold-silver
// Johto (Silver)	gold-silver
// Johto (Crystal)	crystal
// Hoenn (Ruby)	ruby-sapphire
// Hoenn (Sapphire)	ruby-sapphire
// Hoenn (Emerald)	emerald
// Lista dos jogos para seleção, com Version Group para o backend .NET
const GAMES = [
  {
    name: 'Kanto (Red)',
    versionGroup: 'red-blue',
    image1: RedBlue,
    image2: BlueRed
  },
  {
    name: 'Kanto (Fire Red)',
    versionGroup: 'firered-leafgreen',
    image1: FireRed,
    image2: LeafGreen
  },
  {
    name: 'Johto (Gold)',
    versionGroup: 'gold-silver',
    image1: GoldSilver,
    image2: SilverGold
  },
  {
    name: 'Johto (Crystal)',
    versionGroup: 'crystal',
    image1: Crystal
  },
  {
    name: 'Hoenn (Ruby)',
    versionGroup: 'ruby-sapphire',
    image1: Ruby,
    image2: Sapphire
  },
  {
    name: 'Hoenn (Emerald)',
    versionGroup: 'emerald',
    image1: Emerald
  },
];

const DIFFICULTY_OPTIONS = [
  { label: 'Fácil', value: 'easy', description: '6 melhores Pokémons para a jornada' },
  { label: 'Médio', value: 'medium', description: '6 Pokémons de tier médio para a jornada' },
  { label: 'Difícil', value: 'hard', description: '6 piores Pokémon para a jornada' },
];

const TeamBuilder = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setSelectedDifficulty(null); // Reseta a dificuldade ao mudar de jogo
  };

  

  const handleGenerateTeam = async () => {
    if (!selectedGame || !selectedDifficulty) {
      alert('Por favor, selecione um Jogo e uma Dificuldade.');
      return;
    }

    setLoading(true);

    const API_BASE_URL = 'https://localhost:5001';
    const params = new URLSearchParams({
        version: selectedGame.versionGroup,
        difficulty: selectedDifficulty
    });
    const fullUrl = `${API_BASE_URL}/api/teambuilder/generate?${params.toString()}`;

  // Faz uma única tentativa de chamada à API (sem retries automáticos)
  try {
    console.log(`Chamando a API uma única vez: ${fullUrl}`);
    const response = await fetch(fullUrl);

    if (response.ok) {
      const teamData = await response.json();
      console.log('Sucesso na chamada única da API');
      navigate('/team-builder-completed', { state: { teamData } });
      return;
    }

    // Se a resposta não foi OK, lê o texto e lança erro para o catch abaixo
    const errorText = await response.text();
    throw new Error(`Erro do servidor (Status ${response.status}): ${errorText.substring(0, 100)}...`);
  } catch (error) {
    console.error('Falha na chamada à API:', error);
    alert('Erro: Não foi possível gerar o time. Verifique a consola para detalhes.');
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="team-builder-container">
      <h1 className="main-title">Montar Time</h1>

      {/* 1. Seleção do Jogo */}
      <h2 className="section-title">1. Escolha o Jogo</h2>
      <div className="game-selection-grid">
        {GAMES.map((game) => (
          <div
            key={game.versionGroup}
            className={`game-card ${selectedGame?.versionGroup === game.versionGroup ? 'selected' : ''}`}
            onClick={() => handleGameSelect(game)}
          >

              <img src={game.image1} alt={game.name} className="game-boxart" />
              {game.image2 && (
                <img src={game.image2} alt={`${game.name} 2`} className="game-boxart" />
            )}
            <p className="game-name">{game.name}</p>
          </div>
        ))}
      </div>

      {/* 2. Seleção de Dificuldade (Aparece apenas após a seleção do jogo) */}
      {selectedGame && (
        <div className="difficulty-section">
          <h2 className="section-title">2. Escolha a Dificuldade para {selectedGame.name}</h2>
          <div className="difficulty-options">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`difficulty-button ${selectedDifficulty === option.value ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty(option.value)}
                disabled={loading}
              >
                <span className="difficulty-label">{option.label}</span>
                <span className="difficulty-description">{option.description}</span>
              </button>
            ))}
          </div>

          {/* 3. Botão Gerar */}
          <button
            className="generate-button"
            onClick={handleGenerateTeam}
            disabled={!selectedDifficulty || loading}
          >
            {loading ? 'Gerando Time...' : 'Gerar Time Aleatório'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamBuilder;