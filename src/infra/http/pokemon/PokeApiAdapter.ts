import { Pokemon } from "../../../domain/pokemon/ports";

export function mapPokeApiToPokemon(data) {
  return new Pokemon({
    id: data.id,
    name: data.name,
    sprite: data.sprites?.front_default ?? "",
    types: (data.types ?? []).map((t) => t.type.name),
  });
}