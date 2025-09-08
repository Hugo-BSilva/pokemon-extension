// src/pages/Region/index.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRegionPokemons } from '../../services/pokemons';
import { getPokemonTypes } from '../../services/types';
import { useFetchData } from '../../hooks/useFetchData';
import PokemonCard from '../../components/PokemonCard';
import Loading from '../../components/Loading';
import './styles.css';

const Region = () => {
  const { regionName } = useParams();
  const [pokemons, setPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [pokemonTypes, setPokemonTypes] = useState([]);
  const { loading, fetchData } = useFetchData();

  useEffect(() => {
    const fetchRegionData = async () => {
      const allPokemons = await fetchData(() => getRegionPokemons(regionName));
      if (!allPokemons) {
        return; // Retorna imediatamente se a busca falhar
      }
      setPokemons(allPokemons);

      const allTypes = await fetchData(() => getPokemonTypes());
      if (!allTypes) {
        return; // Retorna se a busca de tipos falhar
      }
      setPokemonTypes(allTypes);
    };

    fetchRegionData();
  }, [regionName, fetchData]);

  if (loading) {
    return <Loading />;
  }

  // <== ADICIONE ESTE BLOCO CRUCIAL
  // Se a busca falhou e o estado de "pokemons" e "pokemonTypes" não foi preenchido
  // Não renderizamos nada, pois o redirecionamento acontecerá em seguida.
  // Isso evita o "TypeError".
  if (!pokemons || !pokemonTypes) {
    return null;
  }

  const filteredPokemons = pokemons.filter((pokemon) => {
    const matchesName = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || (pokemon.types && pokemon.types.includes(selectedType));
    return matchesName && matchesType;
  });

  return (
    <div className="home-container">
      {/* Aqui a verificação para `regionName` evita o erro de `charAt` */}
      <div className="container-pokedex-search">
        <h1>{regionName ? `Região ${regionName.charAt(0).toUpperCase() + regionName.slice(1)}` : 'Pokédex'}</h1>

        <input
          type="text"
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="container-types-scroll">
        <div className="type-filters-wrapper">
        <button className="scroll-button left" onClick={() => {
          document.querySelector('.type-filters').scrollBy({ left: -200, behavior: 'smooth' });
        }}>‹</button>

        <div className="type-filters">
            {pokemonTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`type-button ${selectedType === type ? "active" : ""} ${type}`}
              >
                {type}
              </button>
            ))}
        </div>

        <button className="scroll-button right" onClick={() => {
          document.querySelector('.type-filters').scrollBy({ left: 200, behavior: 'smooth' });
          }}>›
        </button>
        </div>
      </div>

        <div className="pokemon-grid">
          {filteredPokemons.map((pokemon) => (
            <PokemonCard key={pokemon.name} pokemon={pokemon} />
          ))}
        </div>
    </div>
  );
};

export default Region;