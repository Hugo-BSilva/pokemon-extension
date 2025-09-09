const BASE_URL = "https://pokeapi.co/api/v2";

export const http = {
  async get(path) {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) {
      throw new Error(`Erro ao buscar ${path}`);
    }
    return res.json();
  },
};