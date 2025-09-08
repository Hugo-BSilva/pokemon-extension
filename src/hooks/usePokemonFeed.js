// src/hooks/usePokemonData.js
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getAllPokemons, getPokemonsByType } from "../services/pokemons";
import { getPokemonTypes } from "../services/types";

/**
 * Cache global (sobrevive a montagens/desmontagens — evita double fetch do StrictMode)
 */
const GLOBAL_CACHE = {
  all: null,            // Array de todos os pokémons (enriquecidos)
  byType: Object.create(null), // { [type]: Array<Pokemon> }
};
let PRELOAD_ALL_PROMISE = null;

const PAGE_SIZE = 20;

export const usePokemonFeed = () => {
  // Estado da UI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [pokemonTypes, setPokemonTypes] = useState([]);

  // “Página” do feed (quantas páginas de 20 já mostramos)
  const [page, setPage] = useState(0);

  // Loading e “tem mais?”
  const [loading, setLoading] = useState(false);
  const [hasMoreRemote, setHasMoreRemote] = useState(true); // só para /all quando ainda não temos cache
  const [typesLoading, setTypesLoading] = useState(false);

  // Lista parcial remota para /all enquanto o cache não está pronto
  const [remoteAll, setRemoteAll] = useState([]); // acumula páginas vindas da API
  const remoteOffsetRef = useRef(0);              // offset atual de /all
  const inFlightRef = useRef(false);              // trava para não “duplicar” chamadas

  // “bump” para re-render quando o cache global for preenchido
  const [cacheVersion, setCacheVersion] = useState(0);
  const bumpCache = () => setCacheVersion((v) => v + 1);

  /**
   * 1) Carrega os tipos uma única vez
   */
  useEffect(() => {
    let alive = true;
    (async () => {
      const types = await getPokemonTypes();
      if (alive && types) setPokemonTypes(types);
    })();
    return () => { alive = false; };
  }, []);

  /**
   * 2) Pré-carrega TODOS em background (lotes) — uma única vez no app
   *    Enquanto isso, vamos usando a paginação remota (remoteAll) pro feed “/all”
   */
  const preloadAllInBackground = useCallback(async () => {
    if (GLOBAL_CACHE.all) return; // já pronto
    if (PRELOAD_ALL_PROMISE) return; // já em andamento

    PRELOAD_ALL_PROMISE = (async () => {
      let all = [];
      // lotes “gentis” com a API (100 por vez)
      for (let offset = 0; offset < 1302; offset += 100) {
        const res = await getAllPokemons(100, offset);
        if (res?.results?.length) all = all.concat(res.results);
        // pequena pausa só pra não “floodar”
        await new Promise((r) => setTimeout(r, 250));
      }
      GLOBAL_CACHE.all = all;
      PRELOAD_ALL_PROMISE = null;
      bumpCache();
    })();

    try { await PRELOAD_ALL_PROMISE; } catch { /* se falhar, ignoramos; o feed remoto continua funcionando */ }
  }, []);

  useEffect(() => {
    // Só faz sentido pré-carregar se estivermos na aba “all”
    if (selectedType === "all") {
      preloadAllInBackground();
    }
  }, [selectedType, preloadAllInBackground]);

  /**
   * 3) Busca incremental remota para “/all” (enquanto o cache não existe)
   */
  const fetchNextRemoteAllPage = useCallback(async () => {
    if (inFlightRef.current) return;
    if (!hasMoreRemote) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const limit = PAGE_SIZE;
      const offset = remoteOffsetRef.current;
      const res = await getAllPokemons(limit, offset);
      const chunk = res?.results ?? [];
      setRemoteAll((prev) => prev.concat(chunk));
      remoteOffsetRef.current = offset + chunk.length;
      if (chunk.length < limit) setHasMoreRemote(false);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [hasMoreRemote]);

  /**
   * 4) Ao trocar o tipo:
   *    - reseta paginação
   *    - se for um tipo específico e ainda não estiver no cache, carrega 1x e salva no cache global
   */
  useEffect(() => {
    setPage(0);
    setHasMoreRemote(true);

    // tipo específico: baixa a lista completa desse tipo e guarda no cache global
    const ensureTypeList = async () => {
      if (selectedType === "all") return;

      if (!GLOBAL_CACHE.byType[selectedType]) {
        setTypesLoading(true);
        const data = await getPokemonsByType(selectedType);
        GLOBAL_CACHE.byType[selectedType] = Array.isArray(data) ? data : [];
        setTypesLoading(false);
        bumpCache();
      }
    };

    ensureTypeList();
  }, [selectedType]);

  /**
   * 5) Sempre que avançamos “page”, garantimos ter dados suficientes:
   *    - se “all” tem cache -> nada a fazer (pagina em memória)
   *    - se “all” NÃO tem cache -> busca a próxima página remota quando necessário
   */
  useEffect(() => {
    if (selectedType !== "all") return;             // só interessa para /all
    if (GLOBAL_CACHE.all) return;                   // já temos tudo em memória

    const need = (page + 1) * PAGE_SIZE;
    if (remoteAll.length < need) {
      // traz mais para manter o feed fluido
      fetchNextRemoteAllPage();
    }
  }, [page, selectedType, remoteAll.length, fetchNextRemoteAllPage, cacheVersion]);

  /**
   * 6) Base list (fonte de verdade) para render:
   *    - /all -> usa cache global se existir; senão usa remoteAll (paginado da API)
   *    - /tipo -> usa cache do tipo (carregado 1x)
   */
  const baseList = useMemo(() => {
    if (selectedType === "all") {
      return GLOBAL_CACHE.all ?? remoteAll;
    }
    return GLOBAL_CACHE.byType[selectedType] ?? [];
  }, [selectedType, cacheVersion, remoteAll]);

  /**
   * 7) Busca por nome (em memória sobre a base list atual)
   */
  const filteredList = useMemo(() => {
    if (!searchTerm) return baseList;
    const q = searchTerm.toLowerCase();
    return baseList.filter((p) => p?.name && p.name.toLowerCase().includes(q));
  }, [baseList, searchTerm]);

  /**
   * 8) “Página” do feed — fatia do filtrado (estilo Instagram)
   */
  const visible = useMemo(() => {
    const end = (page + 1) * PAGE_SIZE;
    return filteredList.slice(0, end);
  }, [filteredList, page]);

  /**
   * 9) Cálculo de hasMore:
   *    - se já existe cache completo da fonte -> compara slice vs filtrado
   *    - se está em /all sem cache -> considera também hasMoreRemote
   */
  const hasMore = useMemo(() => {
    const moreInMemory = visible.length < filteredList.length;
    if (selectedType === "all" && !GLOBAL_CACHE.all) {
      return moreInMemory || hasMoreRemote;
    }
    return moreInMemory;
  }, [visible.length, filteredList.length, selectedType, hasMoreRemote]);

  /**
   * 10) IntersectionObserver: ao cruzar o último card, avança a “page”
   */
  const observer = useRef(null);
  const lastPokemonElementRef = useCallback(
    (node) => {
      if (loading || typesLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((p) => p + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, typesLoading, hasMore]
  );

  /**
   * 11) Loading agregado
   */
  const isLoading = loading || typesLoading;

  return {
    pokemons: visible,
    loading: isLoading,
    error: null, // se quiser, podemos expor erros dos fetches
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    pokemonTypes,
    lastPokemonElementRef,
    hasMore,
  };
};
