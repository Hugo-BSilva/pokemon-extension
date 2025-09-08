// src/pages/Home/index.jsx

import React from "react";
// import { usePokemonData } from "../../hooks/usePokemonData";
import { usePokemonFeed } from "../../hooks/usePokemonFeed";
import PokemonCard from "../../components/PokemonCard";
import Loading from "../../components/Loading";
import "./styles.css";

const Home = () => {
  const {
    pokemons,
    loading,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    pokemonTypes,
    lastPokemonElementRef,
    hasMore,
  } = usePokemonFeed();

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleTypeChange = (type) => setSelectedType(type);

  return (
    <div className="home-container">
      <div className="container-pokedex-search">
        <h1>Pokédex</h1>

        {/* Campo de busca */}
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Filtros por tipo */}
      <div className="container-types-scroll">
        <div className="type-filters-wrapper">
        <button className="scroll-button left" onClick={() => {
          document.querySelector('.type-filters').scrollBy({ left: -200, behavior: 'smooth' });
        }}>‹</button>

        <div className="type-filters">
            {pokemonTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
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

      {/* Grid de Pokémons */}
      <div className="pokemon-grid">
        {pokemons.map((pokemon, index) => {
          // Identifica se é o último Pokémon visível para lazy loading
          const isLastPokemon = pokemons.length === index + 1 && hasMore;

          return (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              // Passa o ref apenas para o último item
              ref={isLastPokemon ? lastPokemonElementRef : null}
            />
          );
        })}
      </div>

      {/* Loader / Mensagens */}
      {loading && <Loading />}
      {!hasMore && !loading && pokemons.length > 0 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Todos os Pokémons foram carregados!
        </p>
      )}
      {!loading && pokemons.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Nenhum Pokémon encontrado.
        </p>
      )}
    </div>
  );
};

export default Home;
