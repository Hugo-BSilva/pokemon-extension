// src/services/types/index.js

// export const getPokemonTypes = async () => {
//   try {
//     const response = await fetch("https://pokeapi.co/api/v2/type");
//     const data = await response.json();

//     const types = data.results
//       .map(type => type.name)
//       .filter(type => type !== 'unknown' && type !== 'shadow');

//     return ['all', ...types];
//   } catch (error) {
//     console.error("Erro ao buscar tipos de Pokémons:", error);
//     return ['all'];
//   }
// };

export const getPokemonTypes = async () => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/type');
    const data = await response.json();
    return ['all', ...data.results.map(type => type.name)];
  } catch (error) {
    console.error("Erro ao buscar tipos de Pokémons:", error);
    return []; // Retorne um array vazio em caso de erro
  }
};