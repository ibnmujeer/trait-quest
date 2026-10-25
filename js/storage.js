/**
 * Trait Quest - Progress & State Storage
 * Persists player's collected animals, unlocked habitats, best habitat scores,
 * classification badges, and active selections in localStorage for full offline play.
 */

window.TraitQuestStorage = (() => {
  const STORAGE_KEY = 'trait_quest_save_v1';

  function getDefaultState() {
    const starters = window.TraitQuestGenetics.createStarterAnimals();
    return {
      animals: starters,
      unlockedHabitats: {
        forest: true,
        desert: false,
        snow: false
      },
      bestHabitatScores: {
        forest: 0,
        desert: 0,
        snow: 0
      },
      completedQuests: {},
      classificationsCompleted: 0,
      offspringBredCount: 0,
      testsRunCount: 0,
      selectedParentA: starters[0].id,
      selectedParentB: starters[1].id,
      selectedTestAnimalId: starters[0].id,
      selectedHabitatId: 'forest',
      hasSeenTutorial: false,
      muted: false
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = getDefaultState();
        saveState(fresh);
        return fresh;
      }
      const parsed = JSON.parse(raw);
      const defaults = getDefaultState();
      return {
        ...defaults,
        ...parsed,
        unlockedHabitats: { ...defaults.unlockedHabitats, ...(parsed.unlockedHabitats || {}) },
        bestHabitatScores: { ...defaults.bestHabitatScores, ...(parsed.bestHabitatScores || {}) },
        completedQuests: { ...defaults.completedQuests, ...(parsed.completedQuests || {}) },
        animals: Array.isArray(parsed.animals) && parsed.animals.length > 0 ? parsed.animals : defaults.animals
      };
    } catch (e) {
      return getDefaultState();
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Ignore quota errors in private browsing
    }
  }

  function resetState() {
    const fresh = getDefaultState();
    saveState(fresh);
    return fresh;
  }

  return {
    loadState,
    saveState,
    resetState
  };
})();
