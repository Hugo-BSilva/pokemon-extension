export const getPokemonTypes = async () => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/type');
    const data = await response.json();
    return ['all types', ...data.results.map(type => type.name)];
  } catch (error) {
    console.error("Erro ao buscar tipos de Pokémons:", error);
    return []; // Retorne um array vazio em caso de erro
  }
};