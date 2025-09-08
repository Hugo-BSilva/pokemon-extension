import React, { useState, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

// Paleta de cores escuras para o hover
const darkTypeColors = {
 normal: "#7b7b59",
 fire: "#9c531d",
 water: "#44599a",
 grass: "#4a7d3a",
 electric: "#a18e22",
 ice: "#688484",
 fighting: "#7b201a",
 poison: "#6b2e6b",
 ground: "#8c7333",
 flying: "#72629b",
 psychic: "#993b58",
 bug: "#717b1b",
 rock: "#7b6d2a",
 ghost: "#4b3b64",
 dragon: "#47239d",
 steel: "#7b7b91",
 dark: "#483a30",
 fairy: "#92626e",
};


const PokemonCard = forwardRef(({ pokemon }, ref) => {
 const [isHovered, setIsHovered] = useState(false);

 const getHoverBackground = () => {
  const types = pokemon.types.map(type => type.toLowerCase());
  if (types.length === 2) {
   const color1 = darkTypeColors[types[0]];
   const color2 = darkTypeColors[types[1]];
   return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  }
  return darkTypeColors[types[0]] || '#444';
 };

 const cardStyle = {
  backgroundImage: isHovered && pokemon.types.length > 1 ? getHoverBackground() : 'none',
  backgroundColor: isHovered && pokemon.types.length === 1 ? getHoverBackground() : '#242629',
  transition: 'background-color 0.5s ease, background-image 0.5s ease'
 };


 return (
    <Link to={`/pokemon/${pokemon.name}`}
      className="pokemon-card-link"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={cardStyle}
      ref={ref}
    >
      <div className="pokemon-card-image">
      <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <div className="pokemon-card-info">
      <h3>{pokemon.name}</h3>
      <div className="pokemon-types">
        {pokemon.types.map((type) => (
        <div key={type} className={`pokemon-type ${type}`}>
          {type}
        </div>
        ))}
      </div>
      </div>
    </Link>
 );
});

export default PokemonCard;