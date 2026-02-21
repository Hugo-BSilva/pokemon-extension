import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './styles.css';

const TeamCompleted = () => {
    // Pega os dados passados pelo `Maps` no estado
    const location = useLocation();
    const teamData = location.state?.teamData; // O nome da chave é 'teamData'

    // Logs para depuração: mostrar o payload que vem da API / navigation state
    console.log('TeamCompleted - location.state:', location.state);
    console.log('TeamCompleted - teamData (raw):', teamData);


    // Checa se teamData existe antes de usar
    if (!teamData) {
        console.log('TeamCompleted - nenhum teamData recebido.');
    }

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

    const { gameVersion, difficulty, team = [] } = teamData;

    // Normalizar o payload caso as chaves venham em PascalCase (ex: PokemonName, Moves, Matchups)
    const normalizedTeam = (team || []).map((p) => ({
        pokemonName: p.PokemonName || p.pokemonName || 'Desconhecido',
        pokedexNumber: p.PokedexNumber || p.pokedexNumber || '—',
        imageUrl: p.ImageUrl || p.imageUrl || '',
        moves: (p.Moves || p.moves || []).map((m) => ({
            name: m.Name || m.name || '—',
            type: m.Type || m.type || '—',
            power: m.Power ?? m.power ?? '—',
            method: m.Method || m.method || '—',
        })),
        matchups: {
            weakAgainstLeaders: (p.Matchups?.weakAgainstLeaders || p.matchups?.weakAgainstLeaders || []),
            strongAgainstLeaders: (p.Matchups?.strongAgainstLeaders || p.matchups?.strongAgainstLeaders || []),
        },
    }));

    console.log('TeamCompleted - normalizedTeam:', normalizedTeam);

    // Use versão normalizada para renderização
    const teamToRender = normalizedTeam;

    return (
        <div className="team-completed-container">
            <h1 className="main-title">Time de Pokémon Gerado com Sucesso!</h1>

            <div className="summary-box">
                <p><strong>Jogo:</strong> {gameVersion}</p>
                <p><strong>Dificuldade:</strong> {difficulty}</p>
            </div>

            <div className="team-grid">
                {teamToRender.length === 0 && (
                    <p>Nenhum Pokémon no time.</p>
                )}

                {teamToRender.map((pokemon, index) => (
                    <div key={index} className="pokemon-card">
                        <img src={pokemon.imageUrl || ''} alt={pokemon.pokemonName || 'pokemon'} className="pokemon-image" />
                        <h2>{pokemon.pokemonName || 'Desconhecido'} (#{pokemon.pokedexNumber || '—'})</h2>

                        {/* Detalhes dos Movimentos */}
                        <div className="moves-section">
                            <h4>Movimentos:</h4>
                            <ul>
                                {(pokemon.moves || []).map((move, moveIndex) => (
                                    <li key={moveIndex}>
                                        <span className={`move-type ${ (move.type || '').toLowerCase() }`}>{move.type || '—'}</span>
                                        <strong className='move-name'>{move.name || '—'}</strong>
                                        (Poder: {move?.power || '—'})
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Detalhes dos Matchups */}
                        <div className="matchup-section">
                            <h4>Matchups com Líderes/Elite 4:</h4>
                            <p>
                                <strong>Forte Contra: </strong>
                                {(pokemon.matchups?.strongAgainstLeaders || []).join(', ') || 'Nenhum listado'}
                            </p>
                            <p>
                                <strong>Fraco Contra: </strong>
                                {(pokemon.matchups?.weakAgainstLeaders || []).join(', ') || 'Nenhum listado'}
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