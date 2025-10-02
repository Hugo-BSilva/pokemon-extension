import { version } from 'react';
import { POKEAPI_BASE_URL } from '../../constants/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = `Erro na API: ${response.status} - ${response.statusText}`;
    throw new Error(errorText);
  }
  return await response.json();
};

export const getAllPokemons = async (limit = 20, offset = 20) => {
  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    const data = await handleResponse(response);

    const detailedPokemons = await Promise.all(
      data.results.map(async (pokemon) => {
        const pokeResponse = await fetch(pokemon.url);
        const pokeData = await pokeResponse.json();

         // Log para depuração
        return {
          id: pokeData.id,
          name: pokeData.name,
          image: pokeData.sprites.front_default,
          types: pokeData.types.map(typeInfo => typeInfo.type.name),
        };
      })
    );

    return { results: detailedPokemons, next: data.next };
  } catch (error) {
    console.error(`Erro ao buscar Pokémons:`, error);
    throw error;
  }
};

export const getRegionPokemons = async (regionName) => {
 try {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokedex/${regionName}`);
  const data = await handleResponse(response);

  // Verificamos se data.pokemon_entries existe e é um array
  const pokemonEntries = data.pokemon_entries;

  if (!pokemonEntries || !Array.isArray(pokemonEntries)) {
   console.error(`O endpoint da pokedex para a região ${regionName} não contém a propriedade 'pokemon_entries'. Verifique a documentação da PokeAPI.`);
   return [];
  }

  // Mapeamos os Pokémon para as URLs detalhadas
  const detailedPokemons = await Promise.all(
   pokemonEntries.map(async (entry) => {
    // A URL da 'species' pode ser diferente da URL do 'pokemon'.
    // Precisamos extrair o ID do Pokémon do URL da espécie.
    const speciesUrl = entry.pokemon_species.url;

    // Verificação adicional para garantir que a URL da espécie existe
    if (!speciesUrl) return null;

    // Extrai o ID do URL. A URL tem a forma '.../pokemon-species/ID/'.
    const parts = speciesUrl.split('/');
    const pokemonId = parts[parts.length - 2];

    if (!pokemonId) return null;

    // Monta a URL para os dados do Pokémon.
    const pokeUrl = `${POKEAPI_BASE_URL}/pokemon/${pokemonId}`;

    const pokeResponse = await fetch(pokeUrl);
    const pokeData = await handleResponse(pokeResponse);

    return {
     id: pokeData.id,
     name: pokeData.name,
     image: pokeData.sprites.front_default,
     types: pokeData.types.map(typeInfo => typeInfo.type.name),
    };
   })
  );

  // Filtra os valores nulos caso alguma requisição tenha falhado
  return detailedPokemons.filter(p => p !== null);
 } catch (error) {
  console.error(`Erro ao buscar Pokémons da região ${regionName}:`, error);
  throw error;
 }
};

const VERSION_ORDER = {
    'red-blue': 1,
    'yellow': 2,
    'gold-silver': 3,
    'crystal': 4,
    'ruby-sapphire': 5,
    'emerald': 6,
    'firered-leafgreen': 7,
    'diamond-pearl': 8,
    'platinum': 9,
    'heartgold-soulsilver': 10,
    'black-white': 11,
    'black-2-white-2': 12,
    'x-y': 13,
    'omega-ruby-alpha-sapphire': 14,
    'sun-moon': 15,
    'ultra-sun-ultra-moon': 16,
    'lets-go-pichu-evee': 17,
    'sword-shield': 18,
    // Você pode adicionar mais grupos de versão aqui conforme necessário
  };

// =========================================================================
// FUNÇÃO AUXILIAR: Extrai a cadeia de evolução recursivamente
// =========================================================================
const getEvolutionChain = (chain) => {
    const evolutions = [];
    let current = chain;

    while (current) {
        // Nome e ID do Pokémon atual na cadeia
        const pokemonName = current.species.name;
        const urlParts = current.species.url.split('/');
        const pokemonId = urlParts[urlParts.length - 2];

        // Dados de evolução
        let evolutionDetails = null;
        if (current.evolution_details && current.evolution_details.length > 0) {
            // Pega o primeiro detalhe, que geralmente é suficiente
            const details = current.evolution_details[0];
            evolutionDetails = {
                trigger: details.trigger.name,
                level: details.min_level,
                item: details.item ? details.item.name : null,
                // Adicione outros detalhes se necessário
            };
        }

        evolutions.push({
            id: pokemonId,
            name: pokemonName,
            details: evolutionDetails,
        });

        // Move para a próxima evolução
        current = current.evolves_to[0];
    }
    return evolutions;
};

export const getPokemonDetails = async (pokemonName) => {
 try {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonName}`);
  const data = await handleResponse(response);

  // 1. Busca dados da ESPÉCIE para obter a URL da cadeia de evolução
  const speciesResponse = await fetch(data.species.url);
  const speciesData = await handleResponse(speciesResponse);

  // 2. Busca a Cadeia de Evolução
  const chainResponse = await fetch(speciesData.evolution_chain.url);
  const chainData = await handleResponse(chainResponse);
  const evolutionChain = getEvolutionChain(chainData.chain);

  const movesWithTypes = await Promise.all(
    data.moves.map(async (moveData) => {
      const moveName = moveData.move.name;
      const responseTypeMove = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
      const dataTypeMove = await handleResponse(responseTypeMove);

      const typeMoveName = dataTypeMove.type.name;
      const category = dataTypeMove.damage_class.name;
      const power = dataTypeMove.power;
      const accuracy = dataTypeMove.accuracy;

      return {
        ...moveData,
        type: typeMoveName,
        category: category,
        power: power,
        accuracy: accuracy
      };
    })
  );

  // 4. Agrupa e Ordena Moves
  const movesByVersion = {};
  movesWithTypes.forEach(moveData => {
    moveData.version_group_details.forEach(versionDetail => {
      const versionName = versionDetail.version_group.name;
      const levelLearned = versionDetail.level_learned_at;

      if (versionDetail.move_learn_method.name === 'level-up' && levelLearned > 0) {
        if (!movesByVersion[versionName]) {
          movesByVersion[versionName] = [];
        }
        movesByVersion[versionName].push({
          type: moveData.type,
          name: moveData.move.name,
          level: levelLearned,
          category: moveData.category,
          power: moveData.power,
          accuracy: moveData.accuracy
        });
      }
    });
  });

  // Ordenar os movimentos por nível dentro de cada grupo
  for (const version in movesByVersion) {
    movesByVersion[version].sort((a, b) => a.level - b.level);
  }

  // 5. Ordenar os GRUPOS de Versão
  const versionNames = Object.keys(movesByVersion);
  const sortedVersionNames = versionNames.sort((a, b) => {
    const orderA = VERSION_ORDER[a] || 999;
    const orderB = VERSION_ORDER[b] || 999;
    return orderA - orderB;
  })

  const sortedMovesByVersion = {};
  sortedVersionNames.forEach(versionName => {
    sortedMovesByVersion[versionName] = movesByVersion[versionName];
  })

  // 6. Extrai Base Stats
  const baseStats = data.stats.map(statInfo => ({
      name: statInfo.stat.name,
      value: statInfo.base_stat
  }));

  return {
    id: data.id,
    name: data.name,
    image: data.sprites.front_default,
    types: data.types.map(typeInfo => typeInfo.type.name),
    movesByVersion: sortedMovesByVersion,
    baseStats: baseStats,
    evolutionChain: evolutionChain,
  };
 } catch (error) {
  console.error(`Erro ao buscar detalhes do Pokémon ${pokemonName}:`, error);
  throw error;
 }
};

export const getPokemonsByType = async (typeName) => {
  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/type/${typeName}`);

    const data = await handleResponse(response);

    const pokemonEntries = data.pokemon.map(entry => entry.pokemon);

    const detailedPokemons = await Promise.all(
      pokemonEntries.map(async (entry) => {
        const pokeResponse = await fetch(entry.url);
        const pokeData = await handleResponse(pokeResponse);

        return {
          id: pokeData.id,
          name: pokeData.name,
          image: pokeData.sprites.front_default,
          types: pokeData.types.map(typeInfo => typeInfo.type.name),
        };
      })
    );

    // Sort the pokemons by id before returning
    detailedPokemons.sort((a, b) => a.id - b.id);

    return detailedPokemons;

  } catch (error) {
    console.error(`Erro ao buscar Pokémons do tipo ${typeName}:`, error);
    throw error;
  }
};