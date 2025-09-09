// Modelo base do domínio
export class Pokemon {
  public id: number;
  public name: string;
  public sprite: string;
  public types: string[];

  constructor({ id, name, sprite, types }) {
    this.id = id;
    this.name = name;
    this.sprite = sprite;
    this.types = types;
  }
}

// Contrato (Porta)
export class PokemonRepositoryPort {
  async list({ limit, offset }) {
    throw new Error("Not implemented");
  }

  async byName(name) {
    throw new Error("Not implemented");
  }

  async byRegion(region, { limit, offset }) {
    throw new Error("Not implemented");
  }
}