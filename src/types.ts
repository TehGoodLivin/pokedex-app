export interface PokemonListResponse {
  count: number;
  results: PokemonListItem[];
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface Stat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface Ability {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface Sprites {
  front_default: string;
  front_female: string | null;
  other: {
    'official-artwork': {
      front_default: string;
      front_female: string | null;
    };
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: Sprites;
  stats: Stat[];
  types: PokemonType[];
  abilities: Ability[];
  cries: {
    latest: string;
  };
  species: {
    name: string;
  }
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: { name: string };
  version: { name: string };
}

export interface PokemonSpecies {
  flavor_text_entries: FlavorTextEntry[];
}