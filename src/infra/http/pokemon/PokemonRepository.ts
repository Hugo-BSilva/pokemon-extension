import { mapPokeApiToPokemon } from "./PokeApiAdapter";
import { http } from "../client";

export function makePokemonRepository() {
  return {
    async list({ limit, offset }) {
      const { results } = await http.get(`/pokemon?limit=${limit}&offset=${offset}`);
      const details = await Promise.all(
        results.map((r) => http.get(`/pokemon/${r.name}`))
      );
      return details.map(mapPokeApiToPokemon);
    },

    async byName(name) {
      const data = await http.get(`/pokemon/${name}`);
      return mapPokeApiToPokemon(data);
    },

    async byRegion(region, { limit, offset }) {
      // Exemplo simplificado — pode refinar depois
      const { pokemon_entries } = await http.get(`/pokedex/${region}`);
      const slice = pokemon_entries.slice(offset, offset + limit);
      const details = await Promise.all(
        slice.map((p) => http.get(`/pokemon/${p.pokemon_species.name}`))
      );
      return details.map(mapPokeApiToPokemon);
    },
  };
}
