import type { PokemonListResponse, PokemonListItem, PokemonDetail } from './types';

export const totalPokemon = 1025;
export const api = 'https://pokeapi.co/api/v2';
export const sprites = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export const types = [ 'all', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy', 'fighting', 'poison', 'ground', 'rock', 'ghost', 'steel', 'bug', 'flying', 'normal' ];

export const regions: { label: string; min: number; max: number }[] = [
  { label: 'All regions', min: 1, max: totalPokemon },
  { label: 'Kanto', min: 1, max: 151 },
  { label: 'Johto', min: 152, max: 251 },
  { label: 'Hoenn', min: 252, max: 386 },
  { label: 'Sinnoh', min: 387, max: 493 },
  { label: 'Unova', min: 494, max: 649 },
  { label: 'Kalos', min: 650, max: 721 },
  { label: 'Alola', min: 722, max: 809 },
  { label: 'Galar', min: 810, max: 905 },
  { label: 'Paldea', min: 906, max: totalPokemon },
];

export function getRegion(id: number): string {
  for (const r of regions) {
    if(r.label !== 'All regions' && id >= r.min && id <= r.max) return r.label;
  }
  return 'Unknown';
}

export async function fetchPokemonList(): Promise<PokemonListItem[]> {
  const res = await fetch(`${api}/pokemon?limit=${totalPokemon}`);
  if(!res.ok) throw new Error(`Failed to fetch pokemon list: ${res.status}`);
  const data: PokemonListResponse = await res.json();
  return data.results;
}

export async function fetchPokemonDetail(url: string): Promise<PokemonDetail> {
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Failed to fetch pokemon detail: ${res.status}`);
  return res.json();
}

export async function fetchPokemonById(id: number): Promise<PokemonDetail> {
  const res = await fetch(`${api}/pokemon/${id}`);
  if(!res.ok) throw new Error(`No pokemon found with id: ${id}`);
  return res.json();
}

export async function fetchPokemonByType(type: string): Promise<string[]> {
  const res = await fetch(`${api}/type/${type}`);
  if(!res.ok) throw new Error(`Failed to fetch type: ${type}`);
  const data = await res.json();
  return data.pokemon.map((p: { pokemon: { name: string } }) => p.pokemon.name);
}

export async function fetchPokemonSpeciesList(): Promise<{ name: string }[]> {
  const res = await fetch(`${api}/pokemon-species?limit=${totalPokemon}`);
  if (!res.ok) throw new Error(`Failed to fetch species list: ${res.status}`);
  const data = await res.json();
  return data.results;
}

export async function fetchGenderData(): Promise<{ femaleOnly: Set<string>; maleOnly: Set<string>; both: Set<string>; genderless: Set<string>; }> {
  const [femaleRes, maleRes, genderlessRes] = await Promise.all([ fetch(`${api}/gender/1`), fetch(`${api}/gender/2`), fetch(`${api}/gender/3`) ]);
  if (!femaleRes.ok || !maleRes.ok || !genderlessRes.ok) throw new Error('Failed to fetch gender data');
  const [femaleData, maleData, genderlessData] = await Promise.all([
    femaleRes.json(), maleRes.json(), genderlessRes.json()
  ]);

  const femaleOnly = new Set<string>();
  const both = new Set<string>();
  const maleOnly = new Set<string>();

  for (const d of femaleData.pokemon_species_details) {
    if (d.rate === 8) femaleOnly.add(d.pokemon_species.name);
    else both.add(d.pokemon_species.name);
  }

  for (const d of maleData.pokemon_species_details) {
    if (d.rate === 0) maleOnly.add(d.pokemon_species.name);
  }

  const genderless = new Set<string>(
    genderlessData.pokemon_species_details.map(
      (d: { pokemon_species: { name: string } }) => d.pokemon_species.name
    )
  );

  return { femaleOnly, maleOnly, both, genderless };
}
