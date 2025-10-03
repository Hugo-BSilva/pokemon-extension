import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './styles.css';

const TeamCompleted = () => {
    // Pega os dados passados pelo `Maps` no estado
    const location = useLocation();
    const teamData = location.state?.teamData; // O nome da chave é 'teamData'

    if (!teamData) {
        return (
            <div className="team-completed-container">
                <h2>Ops! Nenhum time foi encontrado.</h2>
                <Link to="/team-builder" className="back-link">
                    Voltar para o Team Builder
                </Link>
            </div>
        );
    }

    const { gameVersion, difficulty, team } = teamData;

    return (
        <div className="team-completed-container">
            <h1 className="main-title">Time de Pokémon Gerado com Sucesso!</h1>

            <div className="summary-box">
                <p><strong>Jogo:</strong> {gameVersion}</p>
                <p><strong>Dificuldade:</strong> {difficulty}</p>
            </div>

            <div className="team-grid">
                {team.map((pokemon, index) => (
                    <div key={index} className="pokemon-card">
                        <img src={pokemon.imageUrl} alt={pokemon.pokemonName} className="pokemon-image" />
                        <h2>{pokemon.pokemonName} (#{pokemon.pokedexNumber})</h2>

                        {/* Detalhes dos Movimentos */}
                        <div className="moves-section">
                            <h4>Movimentos:</h4>
                            <ul>
                                {pokemon.moves.map((move, moveIndex) => (
                                    <li key={moveIndex}>
                                        <span className={`move-type ${move.type.toLowerCase()}`}>{move.type}</span>
                                        <strong className='move-name'>{move.name}</strong>
                                        (Poder: {move.power || '—'})
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Detalhes dos Matchups */}
                        <div className="matchup-section">
                            <h4>Matchups com Líderes/Elite 4:</h4>
                            <p>
                                <strong>Forte Contra: </strong>
                                {pokemon.matchups.strongAgainstLeaders.join(', ') || 'Nenhum listado'}
                            </p>
                            <p>
                                <strong>Fraco Contra: </strong>
                                {pokemon.matchups.weakAgainstLeaders.join(', ') || 'Nenhum listado'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Link to="/team-builder" className="generate-new-link">
                Gerar Outro Time
            </Link>
        </div>
    );
};

export default TeamCompleted;