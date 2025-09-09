import { useInfiniteQuery } from '@tanstack/react-query';
import { makePokemonRepository } from '../../../infra/http/pokemon/PokemonRepository';

export function useListPokemons() {
  const repo = makePokemonRepository();

  return useInfiniteQuery({
    queryKey: ['pokemons'],
    queryFn: async ({ pageParam = 0 }) => {
      return repo.list({ limit: 20, offset: pageParam });
    },
    getNextPageParam: (lastPage, allPages) => allPages.length * 20,
  });
}
