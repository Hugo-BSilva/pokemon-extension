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

        return {
          id: pokeData.id,
          name: pokeData.name,
          image: pokeData.sprites.front_default,
          types: pokeData.types.map(typeInfo => typeInfo.type.name),
        };
      })
    );

    // CORREÇÃO: Retorne um objeto com 'results' e 'next'.
    return { results: detailedPokemons, next: data.next };
  } catch (error) {
    console.error(`Erro ao buscar Pokémons:`, error);
    throw error;
  }
};

// src/services/pokemons.js

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

// export const getPokemonDetails = async (pokemonName) => {
//   try {
//     const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonName}`);
//     const data = await handleResponse(response);

//     // Processar os dados para extrair os detalhes que você precisa
//     const movesByVersion = await Promise.all(
//       data.moves.map(async moveData => {
//         const moveName = moveData.move.name;
//         const responseTypeMove = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
//         const dataTypeMove = await handleResponse(responseTypeMove);
//         const typeMoveName = dataTypeMove.type.name;

//         moveData.version_group_details.forEach(versionDetail => {
//           const versionName = versionDetail.version_group.name;
//           const levelLearned = versionDetail.level_learned_at;

//           // Só queremos movimentos aprendidos por level-up
//           if (versionDetail.move_learn_method.name === 'level-up' && levelLearned > 0) {
//             if (!movesByVersion[versionName]) {
//               movesByVersion[versionName] = [];
//             }
//             movesByVersion[versionName].push({
//               type: typeMoveName,
//               name: moveName,
//               level: levelLearned,
//             });
//           }
//         });
//       })
//     )

//     // Ordenar os movimentos por nível
//     for (const version in movesByVersion) {
//       movesByVersion[version].sort((a, b) => a.level - b.level);
//     }

//     return {
//       id: data.id,
//       name: data.name,
//       image: data.sprites.front_default,
//       types: data.types.map(typeInfo => typeInfo.type.name),
//       movesByVersion,
//     };
//   } catch (error) {
//     console.error(`Erro ao buscar detalhes do Pokémon ${pokemonName}:`, error);
//     throw error; // <== Ação correta: lança o erro para o hook
//   }
// };

export const getPokemonDetails = async (pokemonName) => {
 try {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${pokemonName}`);
  const data = await handleResponse(response);

  // CORREÇÃO: Usar Promise.all para esperar todas as requisições de tipo
  const movesWithTypes = await Promise.all(
   data.moves.map(async (moveData) => {
    const moveName = moveData.move.name;
    const responseTypeMove = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
    const dataTypeMove = await handleResponse(responseTypeMove);
    const typeMoveName = dataTypeMove.type.name;

    return {
     ...moveData,
     type: typeMoveName
    };
   })
  );

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
     });
    }
   });
  });

  // Ordenar os movimentos por nível
  for (const version in movesByVersion) {
   movesByVersion[version].sort((a, b) => a.level - b.level);
  }

  return {
   id: data.id,
   name: data.name,
   image: data.sprites.front_default,
   types: data.types.map(typeInfo => typeInfo.type.name),
   movesByVersion,
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