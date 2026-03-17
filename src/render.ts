import type { PokemonDetail } from './types';
import { getRegion, sprites } from './utilities';

export function createPokemonCard( pokemon: { name: string; url: string; species: { name: string }; gender: 'male' | 'female' | 'both' | 'genderless' }, index: number ): HTMLElement {
  const id = index + 1;
  const card = document.createElement('div');
  card.className = 'poke-card';
  card.dataset.id = String(id);
  card.dataset.url = pokemon.url;

  const sprite = `${sprites}/${id}.png`;

  const genderIcon = pokemon.gender === 'both'
    ? ' <span class="card-gender-icon male">♂</span><span class="card-gender-icon female">♀</span>'
    : pokemon.gender === 'male' ? ' <span class="card-gender-icon male">♂</span>'
    : pokemon.gender === 'female' ? ' <span class="card-gender-icon female">♀</span>'
    : '';

    console.log(pokemon.species.name);

  card.innerHTML = `
    <img src="${sprite}" alt="${pokemon.species.name}" loading="lazy" />
    <p class="card-num">#${String(id).padStart(3, '0')}</p>
    <p class="card-name">${pokemon.species.name} ${genderIcon}</p>
    <p class="card-region">${getRegion(id)}</p>
  `;

  return card;
}

export function renderModal(p: PokemonDetail, gender: 'male' | 'female' | 'both' | 'genderless'): string {
  const sprite = p.sprites.front_default;

  const types = p.types.map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`).join('');

  const stats = p.stats
    .map(s => `
      <div class="stat-row">
        <span class="stat-name">${s.stat.name}</span>
        <div class="stat-bar-bg">
          <div class="stat-bar" style="width:${Math.round((s.base_stat / 255) * 100)}%"></div>
        </div>
        <span class="stat-val">${s.base_stat}</span>
      </div>
    `)
    .join('');

  const genderIcons = gender === 'both'
    ? ' <span class="modal-gender-icon male">♂</span><span class="modal-gender-icon female">♀</span>'
    : gender === 'male' ? ' <span class="modal-gender-icon male">♂</span>'
    : gender === 'female' ? ' <span class="modal-gender-icon female">♀</span>'
    : '';

  const abilities = p.abilities
    .map(a => `<span class="ability-badge">${a.ability.name}</span>`)
    .join('');

  return `
    <div class="modal-header-row">
      <div>
        <h2>#${String(p.id).padStart(3, '0')} ${p.species.name.replace(/-[mf]$/, '')} ${genderIcons}</h2>
        <p class="modal-region">${getRegion(p.id)}</p>
        <div class="types">${types}</div>
      </div>
      <div class="modal-header-actions">
        <button class="modal-cry-btn" data-id="${p.id}" data-cry="${p.cries.latest}">▶</button>
      </div>
    </div> 
    <img class="modal-artwork" src="${sprite}" alt="${p.name}" />
    <div class="stats">${stats}</div>
    <div class="abilities"><h3>Abilities</h3>${abilities}</div>
    <div class="voice-entry"><h3>Pokédex Voice</h3><button class="voice-entry-btn" data-id="${p.id}" data-name="${p.species.name}">▶ Play Entry</button></div>
  `;
}