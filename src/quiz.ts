import type { PokemonDetail } from './types';
import { regions, totalPokemon, fetchPokemonById, parseGenderName } from './utilities';

const STORAGE_KEY_SCORE = 'poke-quiz-score';
const STORAGE_KEY_HIGH_SCORE = 'poke-quiz-highscore';
const STORAGE_KEY_STREAK = 'poke-quiz-streak';
const STORAGE_KEY_HIGH_STREAK = 'poke-quiz-highstreak';
const STORAGE_KEY_REGION = 'poke-quiz-region';

let score = 0;
let streak = 0;
let highScore = 0;
let highStreak = 0;
let quizRegion = 'All regions';
let currentAnswer: PokemonDetail | null = null;
let quizActive = false;

function loadStats() {
  score = parseInt(localStorage.getItem(STORAGE_KEY_SCORE) || '0', 10);
  highScore = parseInt(localStorage.getItem(STORAGE_KEY_HIGH_SCORE) || '0', 10);
  streak = parseInt(localStorage.getItem(STORAGE_KEY_STREAK) || '0', 10);
  highStreak = parseInt(localStorage.getItem(STORAGE_KEY_HIGH_STREAK) || '0', 10);
  quizRegion = localStorage.getItem(STORAGE_KEY_REGION) || 'All regions';
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY_SCORE, String(score));
  localStorage.setItem(STORAGE_KEY_HIGH_SCORE, String(highScore));
  localStorage.setItem(STORAGE_KEY_STREAK, String(streak));
  localStorage.setItem(STORAGE_KEY_HIGH_STREAK, String(highStreak));
  localStorage.setItem(STORAGE_KEY_REGION, quizRegion);
}

function resetStats() {
  score = 0;
  streak = 0;
  saveStats();
  updateScoreboard();
}

function clearAllData() {
  score = 0;
  streak = 0;
  highScore = 0;
  highStreak = 0;
  quizRegion = 'All regions';
  localStorage.removeItem(STORAGE_KEY_SCORE);
  localStorage.removeItem(STORAGE_KEY_HIGH_SCORE);
  localStorage.removeItem(STORAGE_KEY_STREAK);
  localStorage.removeItem(STORAGE_KEY_HIGH_STREAK);
  localStorage.removeItem(STORAGE_KEY_REGION);

  const regionSelect = document.querySelector('#quiz-select-region') as HTMLSelectElement;
  if(regionSelect) regionSelect.value = 'All regions';
  
  updateScoreboard();
}

function updateScoreboard() {
  const scoreEl = document.querySelector('#quiz-score');
  const streakEl = document.querySelector('#quiz-streak');
  const highScoreEl = document.querySelector('#quiz-high-score');
  const highStreakEl = document.querySelector('#quiz-high-streak');

  if(scoreEl) scoreEl.textContent = String(score);
  if(streakEl) streakEl.textContent = String(streak);
  if(highScoreEl) highScoreEl.textContent = String(highScore);
  if(highStreakEl) highStreakEl.textContent = String(highStreak);
}

function getRegionRange(): { min: number; max: number } {
  const region = regions.find(r => r.label === quizRegion);
  return region ?? { min: 1, max: totalPokemon };
}

function getRandomIds(count: number): number[] {
  const { min, max } = getRegionRange();
  const rangeSize = max - min + 1;
  const ids = new Set<number>();
  const limit = Math.min(count, rangeSize);
  while (ids.size < limit) {
    ids.add(min + Math.floor(Math.random() * rangeSize));
  }
  return [...ids];
}

function getSpriteUrl(pokemon: PokemonDetail): string {
  return pokemon.sprites.front_default;
}

function buildChoiceLabel(pokemon: PokemonDetail): string {
  const { display } = parseGenderName(pokemon.name);
  return display;
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function initQuiz() {
  loadStats();

  const quizView = document.querySelector('#quiz-view') as HTMLElement;
  quizView.innerHTML = `
    <div class="quiz-scoreboard">
      <div class="quiz-stat">
        <span class="quiz-stat-label">Score</span>
        <strong id="quiz-score">${score}</strong>
      </div>
      <div class="quiz-stat">
        <span class="quiz-stat-label">Streak</span>
        <strong id="quiz-streak">${streak}</strong>
      </div>
      <div class="quiz-stat best">
        <span class="quiz-stat-label">Best Score</span>
        <strong id="quiz-high-score">${highScore}</strong>
      </div>
      <div class="quiz-stat best">
        <span class="quiz-stat-label">Best Streak</span>
        <strong id="quiz-high-streak">${highStreak}</strong>
      </div>
    </div>

    <div class="quiz-controls">
      <label class="quiz-control-label">Region</label>
      <select id="quiz-select-region" class="quiz-select-region">
        ${regions.map(r => `
          <option value="${r.label}" ${r.label === quizRegion ? 'selected' : ''}>
            ${r.label}
          </option>`).join('')}
      </select>
    </div>

    <div class="quiz-silhouette-wrap">
      <img id="quiz-img" src="" alt="Who's that Pokémon?" style="visibility:hidden" />
    </div>
    <p class="quiz-prompt">Who's that Pokémon?</p>
    <div class="quiz-choices" id="quiz-choices"></div>
    <div class="quiz-actions">
      <button class="quiz-skip"  id="quiz-skip">Skip</button>
      <button class="quiz-reset" id="quiz-reset">Reset Score</button>
      <button class="quiz-clear" id="quiz-clear">Clear All Data</button>
    </div>
  `;

  document.querySelector('#quiz-select-region')!.addEventListener('change', (e) => {
    quizRegion = (e.target as HTMLSelectElement).value;
    saveStats();
    nextRound();
  });

  document.querySelector('#quiz-skip')!.addEventListener('click', () => {
    if(quizActive) {
      streak = 0;
      saveStats();
      updateScoreboard();
      nextRound();
    }
  });

  document.querySelector('#quiz-reset')!.addEventListener('click', () => {
    resetStats();
  });

  document.querySelector('#quiz-clear')!.addEventListener('click', () => {
    if(confirm('Clear all quiz data including high scores?')) {
      clearAllData();
    }
  });

  nextRound();
}

async function nextRound() {
  quizActive = false;
  currentAnswer = null;

  const img = document.querySelector('#quiz-img') as HTMLImageElement;
  const choices = document.querySelector('#quiz-choices') as HTMLElement;
  const prompt = document.querySelector('.quiz-prompt') as HTMLElement;

  img.style.filter = 'brightness(0)';
  img.style.visibility = 'hidden'
  img.src = '';
  choices.innerHTML = '<p style="text-align:center;color:#aaaaaa;padding:20px">Loading...</p>';
  prompt.textContent = "Who's that Pokémon?";

  try {
    let details: PokemonDetail[] = [];
    for (let attempt = 0; attempt < 5; attempt++) {
      const ids = getRandomIds(4);
      details = await Promise.all(ids.map(id => fetchPokemonById(id)));
      const names = details.map(d => d.name);
      if(new Set(names).size === names.length) break;
    }
    const answerIndex = Math.floor(Math.random() * details.length);
    currentAnswer = details[answerIndex];

    const spriteUrl = getSpriteUrl(currentAnswer);

    await preloadImage(spriteUrl);

    img.style.visibility = 'hidden'; // Helps prevent image from flashing on screen
    img.style.filter = 'brightness(0)';
    img.src = spriteUrl;

    await new Promise<void>(resolve => {
      if(img.complete) resolve();
      else img.onload = () => resolve();
    });
    
    img.style.visibility = 'visible'; // Helps prevent image from flashing on screen

    choices.innerHTML = '';

    details.forEach(pokemon => {
      const label = buildChoiceLabel(pokemon);
      const btn = document.createElement('button');
      btn.className = 'quiz-choice';
      btn.textContent = label;
      btn.dataset.name = label;
      btn.addEventListener('click', () => handleAnswer(btn));
      choices.appendChild(btn);
    });

    quizActive = true;
  } catch (e) {
    choices.innerHTML = '<p style="text-align:center;color:#cc0000">Failed to load. Skipping...</p>';
    setTimeout(nextRound, 1500);
  }
}

function handleAnswer(btn: HTMLButtonElement) {
  if(!quizActive || !currentAnswer) return;
  quizActive = false;

  const correctLabel = buildChoiceLabel(currentAnswer);
  const correct = btn.dataset.name === correctLabel;

  const choices = document.querySelector('#quiz-choices') as HTMLElement;
  const prompt = document.querySelector('.quiz-prompt') as HTMLElement;
  const img = document.querySelector('#quiz-img') as HTMLImageElement;

  img.style.filter = 'brightness(1)';

  choices.querySelectorAll('.quiz-choice').forEach(b => {
    const button = b as HTMLButtonElement;

    if(button.dataset.name === correctLabel) {
      button.classList.add('correct');
    } else if(button === btn && !correct) {
      button.classList.add('wrong');
    }

    button.disabled = true;
  });

  if(correct) {
    score++;
    streak++;

    if(score > highScore) highScore = score;
    if(streak > highStreak) highStreak = streak;

    prompt.textContent = `Correct! It's ${correctLabel}!`;
  } else {
    streak = 0;

    prompt.textContent = `Wrong! It was ${correctLabel}.`;
  }

  saveStats();
  updateScoreboard();
  setTimeout(nextRound, 1500);
}