import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPokemonDetails } from '../../services/pokemons';
import { useFetchData } from '../../hooks/useFetchData';
import Loading from '../../components/Loading';
import './styles.css';


const PokemonDetail = () => {
  const { pokemonName } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const { loading, fetchData } = useFetchData();

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      // Passa a função de busca para o hook genérico
      const details = await fetchData(() => getPokemonDetails(pokemonName));
      if (!details) {
        return;
      }
      setPokemon(details);
    };

    fetchPokemonDetails();
  }, [pokemonName, fetchData]);

  if (loading) {
    return <Loading />;
  }

  // Adicionando a verificação para `pokemon` ser não-nulo antes de renderizar
  if (!pokemon) {
    return null; // ou você pode retornar uma mensagem de carregamento inicial, mas 'null' já resolve
  }

  return (
    <div className="pokemon-detail-container">
      <h1 className="pokemon-name">{pokemon.name}</h1>
      <div className="pokemon-image-container">
        <img src={pokemon.image} alt={pokemon.name} className="pokemon-image" />
      </div>

      <div className="pokemon-types">
        {pokemon.types.map((type, index) => (
          <span key={index} className={`pokemon-type ${type}`}>{type}</span>
        ))}
      </div>

      <div className="pokemon-moves-container">
        <h2>Movimentos por Jogo</h2>
        {Object.keys(pokemon.movesByVersion).length > 0 ? (
          <div className="moves-by-game">
            {Object.keys(pokemon.movesByVersion).map((version) => (
              <div key={version} className="game-section">
                <h3>{version}</h3>
                <ul className="moves-list">
                  {pokemon.movesByVersion[version].map((move, index) => (
                    <li key={index} className="move-item">
                      <span className={`pokemon-type ${move.type}`}> {move.type} </span>
                      <span className="move-name"> # {move.name} </span>
                      <span className="move-level"> - Nível {move.level}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhum movimento encontrado para este Pokémon.</p>
        )}
      </div>
    </div>
  );
}

export default PokemonDetail;