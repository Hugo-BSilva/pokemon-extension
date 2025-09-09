import { useListPokemons } from "@/domain/pokemon/usecases/listPokemons";
import { useInfiniteIntersection } from "@/ui/hooks/useInfiniteIntersection";
import PokemonCard from "@/ui/components/PokemonCard";

export default function Home() {
  const { data, fetchNextPage, hasNextPage, isFetching, error } = useListPokemons();
  const loadMoreRef = useInfiniteIntersection(() => {
    if (hasNextPage && !isFetching) fetchNextPage();
  });

  if (error) return <p className="text-red-500">Erro ao carregar pokémons</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pokémons</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data?.pages.flat().map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
      {hasNextPage && (
        <div ref={loadMoreRef} className="h-12 flex justify-center items-center">
          {isFetching && <span className="text-gray-500">Carregando...</span>}
        </div>
      )}
    </div>
  );
}
