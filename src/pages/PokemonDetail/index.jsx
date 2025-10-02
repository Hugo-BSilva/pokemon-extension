import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPokemonDetails } from '../../services/pokemons';
import { useFetchData } from '../../hooks/useFetchData';
import Loading from '../../components/Loading';
import './styles.css'; // O CSS para os estilos está aqui

// Mapeamento para nomes de Stats mais amigáveis
const STAT_NAMES = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    'speed': 'Speed',
};
// Valor máximo para calcular o preenchimento da barra de stats (Base Stat máximo no jogo)
const MAX_BASE_STAT = 255;

const PokemonDetail = () => {
    const { pokemonName } = useParams();
    const [pokemon, setPokemon] = useState(null);
    const { loading, fetchData } = useFetchData();

    useEffect(() => {
        const fetchPokemonDetails = async () => {
            // Assumimos que getPokemonDetails está em '../../services/pokemons'
            const details = await fetchData(() => getPokemonDetails(pokemonName));
            if (details) {
                setPokemon(details);
            }
        };
        fetchPokemonDetails();
    }, [pokemonName, fetchData]);

    if (loading) {
        return <Loading />;
    }

    if (!pokemon) {
        return <p>Pokémon não encontrado ou erro ao carregar.</p>;
    }

    // Calcula o total dos stats
    const totalStats = pokemon.baseStats.reduce((sum, stat) => sum + stat.value, 0);

    // --- Componentes Reutilizáveis em JSX ---

    // 1. Renderiza a Tabela de Base Stats
    const renderBaseStats = () => (
        <div className="pokemon-section">
            <h2>Base stats</h2>
            <div className="stats-table">
                {pokemon.baseStats.map(stat => (
                    <div key={stat.name} className="stat-row">
                        <span className="stat-name">{STAT_NAMES[stat.name] || stat.name}</span>
                        <span className="stat-value">{stat.value}</span>
                        <div className="stat-bar-container">
                            <div
                                className={`stat-bar ${stat.name}`}
                                style={{ width: `${(stat.value / MAX_BASE_STAT) * 100}%` }}
                                title={`${stat.value} / ${MAX_BASE_STAT}`}
                            ></div>
                        </div>
                    </div>
                ))}
                <div className="stat-row total-row">
                    <span className="stat-name">Total</span>
                    <span className="stat-value">{totalStats}</span>
                    <div className="stat-bar-container"></div> {/* Espaço vazio para alinhar */}
                </div>
            </div>
        </div>
    );

    // 2. Renderiza a Cadeia de Evolução
    const renderEvolutionChain = () => {
        if (!pokemon.evolutionChain || pokemon.evolutionChain.length <= 1) {
            return (
                <div className="pokemon-section">
                    <h2>Evolution chart</h2>
                    <p>{pokemon.name} não possui evoluções.</p>
                </div>
            );
        }

        return (
            <div className="pokemon-section">
                <h2>Evolution chart</h2>
                <div className="evolution-chain">
                    {pokemon.evolutionChain.map((evo, index) => {
                        const nextEvo = pokemon.evolutionChain[index + 1];

                        return (
                            <React.Fragment key={evo.id}>
                                <div className="pokemon-evo-step">
                                    <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                                        alt={evo.name}
                                        className="evo-sprite"
                                    />
                                    <div className="evo-details">
                                        #{String(evo.id).padStart(4, '0')}
                                        <div className="evo-name">{evo.name}</div>
                                        <div className="evo-types">
                                            {pokemon.types.map(t => (
                                                <span key={t} className={`evo-type-badge type-${t}`}>{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {nextEvo && (
                                    <span className="evo-arrow">
                                        →
                                        {nextEvo.details?.level && (
                                            <span className="level-detail">
                                                (Level {nextEvo.details.level})
                                            </span>
                                        )}
                                        {/* Adicionar mais detalhes de trigger, como item, se desejar */}
                                    </span>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        );
    };

    // 3. Renderiza a Tabela de Moves por Level Up
    const renderMovesTable = () => (
        <div className="pokemon-section">
            <h2>Moves learnt by level up</h2>

            {Object.keys(pokemon.movesByVersion).map(version => (
                <div key={version} className="moves-by-game-section">
                    <h3>{version.replace(/-/g, ' ')}</h3>
                    <table className="moves-table">
                        <thead>
                            <tr>
                                <th>Lv.</th>
                                <th>Move</th>
                                <th>Type</th>
                                <th>Cat.</th>
                                <th>Power</th>
                                <th>Acc.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pokemon.movesByVersion[version].map((move, index) => (
                                <tr key={index}>
                                    <td>{move.level}</td>
                                    <td>{move.name.replace(/-/g, ' ')}</td>
                                    <td><span className={`type-badge type-${move.type}`}>{move.type}</span></td>
                                    <td>
                                        <span className={`category-icon cat-${move.category}`} title={move.category}></span>
                                    </td>
                                    <td>{move.power || '—'}</td>
                                    <td>{move.accuracy || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );


    return (
        <div className="pokemon-detail-container">
            <h1 className="pokemon-name">#{String(pokemon.id).padStart(4, '0')} {pokemon.name}</h1>
            <div className="header-info">
                <img src={pokemon.image} alt={pokemon.name} className="pokemon-image" />
                <div className="pokemon-types">
                    {pokemon.types.map((type, index) => (
                        <span key={index} className={`pokemon-type type-${type}`}>{type}</span>
                    ))}
                </div>
            </div>

            {renderBaseStats()}

            {renderEvolutionChain()}

            {renderMovesTable()}

        </div>
    );
}

export default PokemonDetail;