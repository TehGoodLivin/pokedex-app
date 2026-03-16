import type { PokemonDetail } from './types';
import { getRegion, parseGenderName, sprites } from './utilities';

export function createPokemonCard( pokemon: { name: string; url: string }, index: number ): HTMLElement {
  const id = index + 1;
  const card = document.createElement('div');
  card.className = 'poke-card';
  card.dataset.id = String(id);
  card.dataset.url = pokemon.url;

  const sprite = `${sprites}/${id}.png`;
  const { display, gender } = parseGenderName(pokemon.name);
  const genderIcon = gender === 'female' ? ' <span class="gender-icon female" title="Female">♀</span>' : gender === 'male' ? ' <span class="gender-icon male" title="Male">♂</span>' : '';

  card.innerHTML = `
    <img src="${sprite}" alt="${pokemon.name}" loading="lazy" />
    <p class="card-num">#${String(id).padStart(3, '0')}</p>
    <p class="card-name">${display}${genderIcon}</p>
    <p class="card-region">${getRegion(id)}</p>
  `;

  return card;
}

export function renderModal(p: PokemonDetail): string {
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

  const abilities = p.abilities
    .map(a => `<span class="ability-badge">${a.ability.name}</span>`)
    .join('');

  const hasFemale = !!p.sprites.front_female;
  const { display: displayName, gender } = parseGenderName(p.name);
  const nameGender = gender === 'female' ? ' <span class="gender-icon female" title="Female">♀</span>' : gender === 'male' ? ' <span class="gender-icon male" title="Male">♂</span>' : '';
  const genderIcons = nameGender || (hasFemale ? ' <span class="gender-icon male" title="Male">♂</span><span class="gender-icon female" title="Female">♀</span>' : '');

  return `
    <div class="modal-header-row">
      <div>
        <h2>#${String(p.id).padStart(3, '0')} ${displayName}${genderIcons}</h2>
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
    <div class="voice-entry"><h3>Pokédex Voice</h3><button class="voice-entry-btn" data-id="${p.id}" data-name="${displayName}">▶ Play Entry</button></div>
  `;
}