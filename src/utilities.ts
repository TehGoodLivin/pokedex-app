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

export function parseGenderName(name: string): { display: string; gender: 'male' | 'female' | null } {
  const lower = name.toLowerCase();
  if(lower.endsWith('-female')) return { display: name.slice(0, -7), gender: 'female' };
  if(lower.endsWith('-male')) return { display: name.slice(0, -5), gender: 'male' };
  if(lower.endsWith('-f')) return { display: name.slice(0, -2), gender: 'female' };
  if(lower.endsWith('-m')) return { display: name.slice(0, -2), gender: 'male' };
  return { display: name, gender: null };
}

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
