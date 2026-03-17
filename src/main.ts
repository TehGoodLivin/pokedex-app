import { createPokemonCard, renderModal } from './render';
import { initQuiz } from './quiz';
import { regions, types, totalPokemon, fetchPokemonList, fetchPokemonDetail, fetchPokemonById, fetchPokemonByType, fetchPokemonSpeciesList, fetchGenderData } from './utilities';

document.addEventListener("DOMContentLoaded", (event: Event) => {
  const favorites = new Set<number>( JSON.parse(localStorage.getItem('poke-favorites') || '[]') ); // Storage

  const grid = document.querySelector('#grid')! as HTMLElement;
  const loading = document.querySelector('#loading')! as HTMLElement;
  const modal = document.querySelector('#modal')! as HTMLElement;
  const modalBody = document.querySelector('#modal-body')! as HTMLElement;
  const modalFav = document.querySelector('#modal-fav')! as HTMLButtonElement;
  const searchInput = document.querySelector('#search')! as HTMLInputElement;
  const btnRandom = document.querySelector('#btn-random')! as HTMLElement;
  const btnFavorites = document.querySelector('#btn-favorites')! as HTMLElement;
  const navDex = document.querySelector('#nav-dex')! as HTMLButtonElement;
  const navQuiz = document.querySelector('#nav-quiz')! as HTMLButtonElement;
  const mainView = document.querySelector('main')! as HTMLElement;
  const quizView = document.querySelector('#quiz-view')! as HTMLElement;
  const typeSelect = document.querySelector('#select-type')! as HTMLSelectElement;
  const regionSelect = document.querySelector('#select-region')! as HTMLSelectElement;
  const headerControls = document.querySelector('.header-controls')! as HTMLElement;

  let masterList: { name: string; url: string; species: { name: string }; gender: 'male' | 'female' | 'both' | 'genderless' }[] = [];
  let activeType = 'all';
  let activeRegion = 'All regions';
  let searchQuery = '';
  let showFavoritesOnly = false;

  let audioPlaying: boolean = false;
  let audio: HTMLAudioElement | null;

  function saveFavorites() {
    localStorage.setItem('poke-favorites', JSON.stringify([...favorites]));
  }

  modalFav.addEventListener('click', () => {
    const id = Number(modalFav.dataset.id);

    if(!id) return;

    if(favorites.has(id)) {
      favorites.delete(id);
      modalFav.classList.remove('active');
      modalFav.textContent = 'Favorite';
    } else {
      favorites.add(id);
      modalFav.classList.add('active');
      modalFav.textContent = 'Unfavorite';
    }

    saveFavorites();

    const gridCard = grid.querySelector(`.poke-card[data-id="${id}"] .fav-btn`) as HTMLButtonElement;
    if(!gridCard) throw new Error("Button modalFav gridCard Error"); // Throw new error if gridCard doesnt exist in DOM
      
    gridCard.classList.toggle('active', favorites.has(id));

    if(showFavoritesOnly) renderGrid(masterList);
  });

  function getRegionFiltered(): typeof masterList {
    if(activeRegion === 'All regions') return masterList;

    const region = regions.find(r => r.label === activeRegion);
    if(!region) return masterList;

    return masterList.filter((_, i) => {
      const id = i + 1;
      return id >= region.min && id <= region.max;
    });
  }

  function buildDropdowns() {
    // Should import Types & Regions from API and minimize hard coded values.

    types.forEach(type => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type === 'all' ? 'All types' : type.charAt(0).toUpperCase() + type.slice(1);
      typeSelect.appendChild(opt);
    });

    regions.forEach(region => {
      const opt = document.createElement('option');
      opt.value = region.label;
      opt.textContent = region.label;
      regionSelect.appendChild(opt);
    });
  }

  function renderGrid(list: typeof masterList) {
    grid.innerHTML = '';

    let filtered = list;

    if(showFavoritesOnly) {
      filtered = filtered.filter(p => favorites.has(masterList.indexOf(p) + 1));
    }

    filtered.forEach((pokemon) => {
      const index = masterList.indexOf(pokemon);
      const card = createPokemonCard(pokemon, index);
      const id = index + 1;
      const favBtn = document.createElement('button');
      
      favBtn.className = 'fav-btn' + (favorites.has(id) ? ' active' : '');
      favBtn.textContent = '♥';
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if(favorites.has(id)) {
          favorites.delete(id);
          favBtn.classList.remove('active');
        } else {
          favorites.add(id);
          favBtn.classList.add('active');
        }
        saveFavorites();
        if(showFavoritesOnly) renderGrid(masterList);
      });

      card.appendChild(favBtn);
      grid.appendChild(card);
    });
  }

  function openModal(html: string, pokemonId: number) {
    modalBody.innerHTML = html;
    modal.classList.add('open');

    const modalCryBtn = modalBody.querySelector('.modal-cry-btn') as HTMLButtonElement;
    const modalDexVoiceBtn = modalBody.querySelector('.voice-entry-btn') as HTMLButtonElement;

    if(modalFav) {
      modalFav.dataset.id = pokemonId.toString();
      modalFav.textContent = favorites.has(pokemonId) ? 'Unfavorite' : 'Favorite';
      modalFav.classList.toggle('active', favorites.has(pokemonId));
    }

    if(modalCryBtn) {
      modalCryBtn.addEventListener("click", () => {
        if(!audioPlaying) {
          audioPlaying = true;
          audio = new Audio(modalCryBtn.dataset.cry);
          audio.volume = 0.4; // Lets not make anyone deaf
          audio.play().then(() => console.log(`Cry Audio playing: ${modalCryBtn.dataset.cry}`)).catch(e => console.error("Playback failed:", e));

          audio.addEventListener("ended", () => {
            audioPlaying = false;
            audio = null;
          });
        }
      });
    }

    if(modalDexVoiceBtn) {
      modalDexVoiceBtn.addEventListener("click", () => {
        if(!audioPlaying) {
          audioPlaying = true;
          audio = new Audio(`audio/${pokemonId.toString()}.mp3`);
          audio.volume = 0.4; // Lets not make anyone deaf
          audio.play().then(() => console.log(`Dex Audio playing: ${window.location.origin + window.location.pathname}audio/${pokemonId.toString()}.mp3`)).catch(e => console.error("Playback failed:", e));
          modalDexVoiceBtn.textContent = "▶ Playing...";

          audio.addEventListener("ended", () => {
            audioPlaying = false;
            modalDexVoiceBtn.textContent = "▶ Play Entry";
            audio = null;
          });
        }
        
        // For Pause / Resume Options
        // if (audio && !audio.paused) {
        //   audio.pause();
        //   modalDexVoiceBtn.textContent = "▶ Resume Entry";
        //   return;
        // }

        // if (audio && audio.paused) {
        //   audio.play();
        //   modalDexVoiceBtn.textContent = "⏸ Pause Entry";
        //   return;
        // }

        // audio = new Audio(`/audio/${pokemonId.toString()}.mp3`);
        // audio.play();
        // modalDexVoiceBtn.textContent = "⏸ Pause Entry";
      });
    }
  }

  document.querySelectorAll('.close-modal').forEach(b => { // Used for modal close actions and stopping the audio
    b.addEventListener('click', () => {
      if(audio) { 
        audioPlaying = false;
        audio.pause();
        audio = null;
      }

      modal.classList.remove('open');
      modalBody.innerHTML = '';
    });
  });

  grid.addEventListener('click', async (e) => {
    const card = (e.target as HTMLElement).closest('.poke-card') as HTMLElement;
    if(!card) return;
    openModal('<p style="text-align:center;padding:40px;color:#aaa">Loading...</p>', 0);
    try {
      const detail = await fetchPokemonDetail(card.dataset.url!);
      openModal(renderModal(detail, masterList[detail.id - 1]?.gender ?? 'genderless'), detail.id);
    } catch (e) {
      openModal('<p style="text-align:center;padding:40px;color:#CC0000">Failed to load. Try again.</p>', 0);
    }
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value.toLowerCase().trim();
    const regionFiltered = getRegionFiltered();
    const searched = regionFiltered.filter(p => {
      const id = String(masterList.indexOf(p) + 1);
      return p.species.name.includes(searchQuery) || id.includes(searchQuery);
    });
    renderGrid(searched);
  });

  typeSelect.addEventListener('change', async () => {
    activeType = typeSelect.value;

    if(activeType === 'all') {
      renderGrid(getRegionFiltered());
      return;
    }

    grid.innerHTML = '<p style="text-align:center;padding:60px;color:#aaa">Loading type...</p>';

    try {
      const typeNames = await fetchPokemonByType(activeType);
      const typeSet = new Set(typeNames);
      const regionFiltered = getRegionFiltered();
      const filtered = regionFiltered.filter(p => typeSet.has(p.name));
      renderGrid(filtered);
    } catch (e) {
      grid.innerHTML = '<p style="text-align:center;padding:60px;color:#cc0000">Failed to load type. Try again.</p>';
      console.error(e);
    }
  });

  regionSelect.addEventListener('change', async () => {
    activeRegion = regionSelect.value;

    if(activeType === 'all') {
      renderGrid(getRegionFiltered());
      return;
    }

    grid.innerHTML = '<p style="text-align:center;padding:60px;color:#aaa">Loading...</p>';

    try {
      const typeNames = await fetchPokemonByType(activeType);
      const typeSet = new Set(typeNames);
      const regionFiltered = getRegionFiltered();
      const filtered = regionFiltered.filter(p => typeSet.has(p.name));
      renderGrid(filtered);
    } catch (e) {
      grid.innerHTML = '<p style="text-align:center;padding:60px;color:#cc0000">Failed to load. Try again.</p>';
      console.error(e);
    }
  });

  btnRandom.addEventListener('click', async () => {
    const id = Math.floor(Math.random() * totalPokemon) + 1;
    openModal('<p style="text-align:center;padding:40px;color:#aaa">Loading...</p>', 0);

    try {
      const detail = await fetchPokemonById(id);
      openModal(renderModal(detail, masterList[detail.id - 1]?.gender ?? 'genderless'), detail.id);
    } catch (e) {
      openModal('<p style="text-align:center;padding:40px;color:#CC0000">Failed to load. Try again.</p>', 0);
    }
  });

  btnFavorites.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    btnFavorites.classList.toggle('active', showFavoritesOnly);
    renderGrid(getRegionFiltered());
  });

  navDex.addEventListener('click', () => {
    mainView.classList.remove('hidden');
    quizView.classList.add('hidden');
    navDex.classList.add('active');
    navQuiz.classList.remove('active');
    headerControls.classList.remove('hidden');
  });

  navQuiz.addEventListener('click', () => {
    mainView.classList.add('hidden');
    quizView.classList.remove('hidden');
    navQuiz.classList.add('active');
    navDex.classList.remove('active');
    headerControls.classList.add('hidden');

    initQuiz();
  });

  async function init() {
    try {
      loading.style.display = 'block';

      const [ pokemonList, speciesList, genderData ] = await Promise.all([
        fetchPokemonList(),
        fetchPokemonSpeciesList(),
        fetchGenderData()
      ]);

      masterList = pokemonList.map((p, i) => {
        let speciesName = speciesList[i]?.name ?? p.name;
        let gender: 'male' | 'female' | 'both' | 'genderless';

        if (genderData.genderless.has(speciesName)) gender = 'genderless';
        else if (genderData.femaleOnly.has(speciesName)) gender = 'female';
        else if (genderData.maleOnly.has(speciesName)) gender = 'male';
        else if (genderData.both.has(speciesName)) gender = 'both';
        else gender = 'genderless';

        speciesName = (speciesList[i]?.name ?? p.name).replace(/-[mf]$/, ''); // fix -m/f names and doesnt interfere with species name

        return { ...p, species: { name: speciesName }, gender };
      });

      loading.style.display = 'none';

      buildDropdowns();

      renderGrid(masterList);
    } catch (e) {
      loading.textContent = 'Failed to load Pokémon. Please refresh.';
      console.error(e);
    }
  }

  console.log("DOM fully loaded", event);

  init(); // Initiate App
});