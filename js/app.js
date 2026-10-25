/**
 * Trait Quest - Main Application Controller
 * Connects the 4 core gameplay loops:
 * 1. Collect (Wild variation exploration)
 * 2. Classify (Interactive trait sorting bins)
 * 3. Breed (Parent trait comparison & random inheritance from Parent A & B)
 * 4. Test (Animated habitat simulation, survival score calculation & habitat unlocking)
 */

(() => {
  const { TRAITS, SPECIES, HABITATS, CLASSIFY_CHALLENGES, QUEST_GOALS } = window.TraitQuestData;
  const Audio = window.TraitQuestAudio;
  const Art = window.TraitQuestArt;
  const Genetics = window.TraitQuestGenetics;
  const Storage = window.TraitQuestStorage;
  const Sim = window.TraitQuestHabitatSim;

  let state = Storage.loadState();
  let activeTab = 'collect';

  // Expedition state
  let currentExpeditionHabitat = 'forest';
  let wildEncounters = [];
  let collectedEncounterIds = new Set();

  // Classification state
  let currentClassifyChallengeIndex = 0;
  let classifySelectedAnimalId = null;
  let classifyBinPlacements = {}; // { animalId: binValue }

  // Breeding state
  let lastBredOffspring = null;

  // Test Simulation state
  let isTestRunning = false;
  let lastTestResult = null;
  let liveBreakdownSteps = [];

  // PWA Install Prompt
  let deferredInstallPrompt = null;

  function init() {
    Audio.setMuted(state.muted);
    updateSoundBtnUI();

    // Generate initial wild encounters
    startNewExpedition('forest', false);

    // Bind navigation tabs
    document.querySelectorAll('.nav-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        Audio.playClick();
        switchTab(btn.dataset.tab);
      });
    });

    // Header buttons
    document.getElementById('soundToggleBtn').addEventListener('click', () => {
      state.muted = !state.muted;
      Audio.setMuted(state.muted);
      Storage.saveState(state);
      updateSoundBtnUI();
      if (!state.muted) Audio.playPop();
    });

    const instructionsBtn = document.getElementById('instructionsHeaderBtn');
    if (instructionsBtn) {
      instructionsBtn.addEventListener('click', () => {
        Audio.playClick();
        openWelcomeModal();
      });
    }

    const teacherBtn = document.getElementById('teacherNotesBtn');
    if (teacherBtn) {
      teacherBtn.addEventListener('click', () => {
        Audio.playClick();
        document.getElementById('teacherModal').hidden = false;
      });
    }

    const closeTeacherBtn = document.getElementById('closeTeacherModalBtn');
    if (closeTeacherBtn) {
      closeTeacherBtn.addEventListener('click', () => {
        document.getElementById('teacherModal').hidden = true;
      });
    }

    document.getElementById('closeWelcomeModalBtn').addEventListener('click', () => {
      closeWelcomeModal();
    });

    document.getElementById('startAdventureBtn').addEventListener('click', () => {
      Audio.playCollect();
      closeWelcomeModal();
    });

    document.getElementById('guideModalBtn').addEventListener('click', () => {
      Audio.playClick();
      openGuideModal();
    });

    document.getElementById('closeGuideModalBtn').addEventListener('click', () => {
      document.getElementById('guideModal').hidden = true;
    });

    document.getElementById('closePickerModalBtn').addEventListener('click', () => {
      document.getElementById('animalPickerModal').hidden = true;
    });

    // Close modals on backdrop click
    ['animalPickerModal', 'guideModal', 'welcomeModal', 'teacherModal'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          if (id === 'welcomeModal') {
            closeWelcomeModal();
          } else {
            el.hidden = true;
          }
        }
      });
    });

    // Collect tab buttons
    document.getElementById('newExpeditionBtn').addEventListener('click', () => {
      Audio.playPop();
      startNewExpedition(currentExpeditionHabitat, true);
    });

    // Classify tab reset button
    document.getElementById('autoCheckClassifyBtn').addEventListener('click', () => {
      Audio.playClick();
      classifyBinPlacements = {};
      classifySelectedAnimalId = null;
      renderClassifyTab();
    });

    // Breed button
    document.getElementById('breedNowBtn').addEventListener('click', () => {
      handleBreedOffspring();
    });

    // Test tab buttons
    document.getElementById('changeTestAnimalBtn').addEventListener('click', () => {
      Audio.playClick();
      openAnimalPickerModal('test');
    });

    document.getElementById('startSurvivalTestBtn').addEventListener('click', () => {
      handleRunSurvivalTest();
    });

    // PWA Service Worker & Install Prompt
    registerServiceWorker();
    setupPwaInstallPrompt();

    // Initial full UI render
    renderHeader();
    renderCollectTab();
    renderClassifyTab();
    renderBreedTab();
    renderTestTab();

    // Automatically show the detailed kid-friendly instructions at the beginning of the game
    if (!state.hasSeenTutorial) {
      openWelcomeModal();
    }
  }

  function openWelcomeModal() {
    document.getElementById('welcomeModal').hidden = false;
  }

  function closeWelcomeModal() {
    document.getElementById('welcomeModal').hidden = true;
    if (!state.hasSeenTutorial) {
      state.hasSeenTutorial = true;
      Storage.saveState(state);
    }
  }

  function updateSoundBtnUI() {
    const btn = document.getElementById('soundToggleBtn');
    btn.textContent = state.muted ? '🔇' : '🔊';
    btn.title = state.muted ? 'Unmute Sound' : 'Mute Sound';
  }

  function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.nav-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === `panel_${tabId}`);
    });

    if (tabId === 'collect') renderCollectTab();
    if (tabId === 'classify') renderClassifyTab();
    if (tabId === 'breed') renderBreedTab();
    if (tabId === 'test') renderTestTab();
  }

  function getAnimalById(id) {
    return state.animals.find((a) => a.id === id) || state.animals[0];
  }

  // ==================== HEADER & QUEST PROGRESS ====================

  function renderHeader() {
    // Determine current active quest goal
    const questTextEl = document.getElementById('questText');
    let activeQuest = null;
    if (!state.unlockedHabitats.desert) {
      activeQuest = `Score 75%+ in Whispering Forest 🌲 to unlock the Sunbaked Desert! (Best: ${state.bestHabitatScores.forest}%)`;
    } else if (!state.unlockedHabitats.snow) {
      activeQuest = `Score 80%+ in Sunbaked Desert 🏜️ to unlock the Frozen Tundra! (Best: ${state.bestHabitatScores.desert}%)`;
    } else if (state.bestHabitatScores.snow < 85) {
      activeQuest = `Score 85%+ in Frozen Tundra 🏔️ to earn the Master Biologist Badge! (Best: ${state.bestHabitatScores.snow}%)`;
    } else {
      const maxAny = Math.max(state.bestHabitatScores.forest, state.bestHabitatScores.desert, state.bestHabitatScores.snow);
      if (maxAny < 100) {
        activeQuest = `All 3 Habitats Mastered! Can you breed a 100% Perfect Champion in any habitat? (Best: ${maxAny}%)`;
      } else {
        activeQuest = `👑 Ultimate Adaptation Champion! You unlocked all habitats and reached 100% survival!`;
      }
    }
    questTextEl.textContent = activeQuest;

    // Render Habitat Pills
    const pillsContainer = document.getElementById('headerHabitatPills');
    pillsContainer.innerHTML = Object.values(HABITATS)
      .map((h) => {
        const unlocked = state.unlockedHabitats[h.id];
        const best = state.bestHabitatScores[h.id] || 0;
        return `
          <button class="habitat-pill ${unlocked ? 'unlocked' : 'locked'}" data-hab="${h.id}" title="${unlocked ? `${h.name}: Best Score ${best}%` : h.unlockRequirementText}">
            <span>${unlocked ? h.icon : '🔒'}</span>
            <span class="pill-name">${h.shortName}</span>
            <span class="pill-score">${unlocked ? `${best}%` : 'Locked'}</span>
          </button>
        `;
      })
      .join('');

    pillsContainer.querySelectorAll('.habitat-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const habId = btn.dataset.hab;
        if (state.unlockedHabitats[habId]) {
          Audio.playClick();
          state.selectedHabitatId = habId;
          Storage.saveState(state);
          switchTab('test');
        } else {
          Audio.playWrong();
          showToast(`🔒 ${HABITATS[habId].unlockRequirementText}`, 'warning');
        }
      });
    });
  }

  // ==================== TAB 1: COLLECT ====================

  function startNewExpedition(habitatId, animate = true) {
    if (!state.unlockedHabitats[habitatId]) {
      habitatId = 'forest';
    }
    currentExpeditionHabitat = habitatId;
    collectedEncounterIds.clear();
    wildEncounters = Genetics.generateWildExpedition(habitatId, state.unlockedHabitats);
    if (animate) {
      renderCollectTab();
    }
  }

  function renderCollectTab() {
    // Habitat selector buttons for expedition
    const expBtns = document.getElementById('expeditionHabitatBtns');
    expBtns.innerHTML = Object.values(HABITATS)
      .map((h) => {
        const unlocked = state.unlockedHabitats[h.id];
        const active = currentExpeditionHabitat === h.id;
        return `
          <button class="hab-filter-btn ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}" data-hab="${h.id}">
            ${unlocked ? h.icon : '🔒'} ${h.shortName}
          </button>
        `;
      })
      .join('');

    expBtns.querySelectorAll('.hab-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const habId = btn.dataset.hab;
        if (!state.unlockedHabitats[habId]) {
          Audio.playWrong();
          showToast(`🔒 ${HABITATS[habId].unlockRequirementText}`, 'warning');
          return;
        }
        Audio.playClick();
        startNewExpedition(habId, true);
      });
    });

    // Render 3 wild animal cards
    const grid = document.getElementById('wildEncountersGrid');
    grid.innerHTML = wildEncounters
      .map((animal, idx) => {
        const isCollected = collectedEncounterIds.has(animal.id);
        const speciesMeta = SPECIES.find((s) => s.id === animal.speciesId) || SPECIES[0];
        return `
          <div class="animal-card wild-card ${isCollected ? 'collected' : ''}" style="animation-delay: ${idx * 70}ms">
            <div class="card-top-tag">
              <span class="species-tag">${speciesMeta.name}</span>
              <span class="variation-tag">Wild Individual #${idx + 1}</span>
            </div>
            <div class="animal-art-box">
              ${Art.renderAnimalSVG(animal, { size: 138 })}
            </div>
            <h3 class="animal-name">"${animal.nickname}"</h3>
            <p class="species-fact">${speciesMeta.fact}</p>
            <div class="traits-mini-grid">
              ${renderTraitPillsHTML(animal.traits)}
            </div>
            <button class="collect-btn ${isCollected ? 'collected-btn' : ''}" data-idx="${idx}" ${isCollected ? 'disabled' : ''}>
              ${isCollected ? '✅ Added to Sanctuary' : '➕ Collect Animal'}
            </button>
          </div>
        `;
      })
      .join('');

    grid.querySelectorAll('.collect-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        const wildAnimal = wildEncounters[idx];
        if (!wildAnimal || collectedEncounterIds.has(wildAnimal.id)) return;

        collectedEncounterIds.add(wildAnimal.id);
        state.animals.unshift(wildAnimal);
        Storage.saveState(state);

        Audio.playCollect();
        showToast(`🎉 Collected ${wildAnimal.nickname} the ${wildAnimal.speciesName}!`, 'success');
        renderCollectTab();
      });
    });

    // Render Sanctuary List
    renderSanctuaryList();
  }

  function renderTraitPillsHTML(traits, traitSources = null) {
    return ['coat', 'ears', 'color', 'special']
      .map((key) => {
        const cat = TRAITS[key];
        const val = cat.values[traits[key]];
        const sourceTag =
          traitSources && traitSources[key]
            ? `<span class="inherit-mini-badge parent-${traitSources[key].toLowerCase()}">From ${traitSources[key]}</span>`
            : '';
        return `
          <div class="trait-pill" title="${cat.name}: ${val.label} — ${val.desc}">
            <span class="trait-icon">${val.badge}</span>
            <div class="trait-pill-text">
              <span class="trait-cat-label">${cat.shortName}</span>
              <span class="trait-val-label">${val.shortLabel}</span>
            </div>
            ${sourceTag}
          </div>
        `;
      })
      .join('');
  }

  function renderSanctuaryList() {
    document.getElementById('sanctuaryCount').textContent = state.animals.length;
    const listEl = document.getElementById('sanctuaryList');

    listEl.innerHTML = state.animals
      .map((animal) => {
        const bestMax = Math.max(
          animal.bestScores?.forest || 0,
          animal.bestScores?.desert || 0,
          animal.bestScores?.snow || 0
        );
        return `
          <div class="sanctuary-item">
            <div class="sanctuary-avatar">
              ${Art.renderAnimalSVG(animal, { size: 76, animated: false })}
            </div>
            <div class="sanctuary-info">
              <div class="sanctuary-title-row">
                <strong>${animal.nickname}</strong>
                <span class="sanctuary-species">${animal.speciesName}</span>
                ${animal.isOffspring ? `<span class="gen-badge">Gen ${animal.generation}</span>` : ''}
                ${bestMax > 0 ? `<span class="score-mini-badge">🌟 ${bestMax}%</span>` : ''}
              </div>
              <div class="sanctuary-traits-row">
                ${['coat', 'ears', 'color', 'special']
                  .map((k) => {
                    const v = TRAITS[k].values[animal.traits[k]];
                    return `<span class="mini-chip">${v.badge} ${v.shortLabel}</span>`;
                  })
                  .join('')}
              </div>
              <div class="sanctuary-quick-actions">
                <button class="tiny-action-btn" data-action="setA" data-id="${animal.id}">🅰️ Parent A</button>
                <button class="tiny-action-btn" data-action="setB" data-id="${animal.id}">🅱️ Parent B</button>
                <button class="tiny-action-btn highlight" data-action="test" data-id="${animal.id}">🌍 Test Survival</button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    listEl.querySelectorAll('.tiny-action-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        Audio.playClick();
        if (action === 'setA') {
          state.selectedParentA = id;
          if (state.selectedParentB === id && state.animals.length > 1) {
            const other = state.animals.find((a) => a.id !== id);
            if (other) state.selectedParentB = other.id;
          }
          Storage.saveState(state);
          showToast('Selected as Parent A! Switching to Breed Lab...', 'info');
          switchTab('breed');
        } else if (action === 'setB') {
          state.selectedParentB = id;
          if (state.selectedParentA === id && state.animals.length > 1) {
            const other = state.animals.find((a) => a.id !== id);
            if (other) state.selectedParentA = other.id;
          }
          Storage.saveState(state);
          showToast('Selected as Parent B! Switching to Breed Lab...', 'info');
          switchTab('breed');
        } else if (action === 'test') {
          state.selectedTestAnimalId = id;
          Storage.saveState(state);
          switchTab('test');
        }
      });
    });
  }

  // ==================== TAB 2: CLASSIFY ====================

  function renderClassifyTab() {
    const challenge = CLASSIFY_CHALLENGES[currentClassifyChallengeIndex];
    document.getElementById('classifyPromptText').textContent = challenge.prompt;

    // Render Trait Mode Switcher Pills
    const selectorEl = document.getElementById('classifyTraitSelector');
    selectorEl.innerHTML = CLASSIFY_CHALLENGES.map((c, idx) => {
      const traitMeta = TRAITS[c.traitKey];
      return `
        <button class="mode-pill ${idx === currentClassifyChallengeIndex ? 'active' : ''}" data-idx="${idx}">
          ${traitMeta.icon} ${traitMeta.shortName}
        </button>
      `;
    }).join('');

    selectorEl.querySelectorAll('.mode-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        Audio.playClick();
        currentClassifyChallengeIndex = Number(btn.dataset.idx);
        classifyBinPlacements = {};
        classifySelectedAnimalId = null;
        renderClassifyTab();
      });
    });

    // Take up to 8 animals from the player's sanctuary to classify
    const pool = state.animals.slice(0, 8);
    const unsorted = pool.filter((a) => !classifyBinPlacements[a.id]);
    document.getElementById('unsortedCount').textContent = unsorted.length;

    const unsortedRow = document.getElementById('unsortedCardsRow');
    if (unsorted.length === 0) {
      unsortedRow.innerHTML = `
        <div class="all-sorted-banner">
          🎉 <strong>Awesome Classification!</strong> You sorted all ${pool.length} animals by <strong>${TRAITS[challenge.traitKey].name}</strong>!
          Try another trait tab above or head to the <strong>Breed Lab</strong>!
        </div>
      `;
    } else {
      unsortedRow.innerHTML = unsorted
        .map((animal) => {
          const isSelected = classifySelectedAnimalId === animal.id;
          const traitValObj = TRAITS[challenge.traitKey].values[animal.traits[challenge.traitKey]];
          return `
            <div class="classify-animal-chip ${isSelected ? 'selected' : ''}" draggable="true" data-id="${animal.id}">
              <div class="chip-art">${Art.renderAnimalSVG(animal, { size: 70, animated: false })}</div>
              <div class="chip-meta">
                <strong>${animal.nickname}</strong>
                <span>${animal.speciesName}</span>
                <span class="chip-trait-hint">${traitValObj.badge} ${traitValObj.shortLabel}</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // Bind click and drag events on unsorted animal chips
    unsortedRow.querySelectorAll('.classify-animal-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        Audio.playClick();
        const id = chip.dataset.id;
        classifySelectedAnimalId = classifySelectedAnimalId === id ? null : id;
        renderClassifyTab();
      });

      chip.addEventListener('dragstart', (e) => {
        classifySelectedAnimalId = chip.dataset.id;
        e.dataTransfer.setData('text/plain', chip.dataset.id);
      });
    });

    // Render the 3 Classification Bins
    const binsGrid = document.getElementById('classificationBinsGrid');
    binsGrid.innerHTML = challenge.bins
      .map((bin) => {
        const placedAnimals = pool.filter((a) => classifyBinPlacements[a.id] === bin.value);
        return `
          <div class="classify-bin ${classifySelectedAnimalId ? 'ready-target' : ''}" data-bin="${bin.value}" style="background:${bin.color}; border-color:${bin.border}">
            <div class="bin-header">
              <h4>${bin.label}</h4>
              <span class="bin-count">${placedAnimals.length}</span>
            </div>
            <p class="bin-desc">${TRAITS[challenge.traitKey].values[bin.value].desc}</p>
            <div class="bin-drop-zone">
              ${
                placedAnimals.length === 0
                  ? `<div class="bin-placeholder">${classifySelectedAnimalId ? '👆 Tap here to place selected animal!' : 'Drop or tap matching animals here'}</div>`
                  : placedAnimals
                      .map(
                        (a) => `
                    <div class="placed-mini-card">
                      ${Art.renderAnimalSVG(a, { size: 52, animated: false })}
                      <span>${a.nickname}</span>
                    </div>
                  `
                      )
                      .join('')
              }
            </div>
          </div>
        `;
      })
      .join('');

    // Bind click and drop on bins
    binsGrid.querySelectorAll('.classify-bin').forEach((binEl) => {
      const binVal = binEl.dataset.bin;

      binEl.addEventListener('click', () => {
        if (!classifySelectedAnimalId) {
          showToast('👆 Tap an animal in the top tray first, then tap its matching group!', 'info');
          return;
        }
        attemptClassifyPlacement(classifySelectedAnimalId, binVal, challenge.traitKey);
      });

      binEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        binEl.classList.add('drag-over');
      });

      binEl.addEventListener('dragleave', () => {
        binEl.classList.remove('drag-over');
      });

      binEl.addEventListener('drop', (e) => {
        e.preventDefault();
        binEl.classList.remove('drag-over');
        const draggedId = e.dataTransfer.getData('text/plain') || classifySelectedAnimalId;
        if (draggedId) {
          attemptClassifyPlacement(draggedId, binVal, challenge.traitKey);
        }
      });
    });
  }

  function attemptClassifyPlacement(animalId, binValue, traitKey) {
    const animal = getAnimalById(animalId);
    if (!animal) return;

    const actualValue = animal.traits[traitKey];
    const traitMeta = TRAITS[traitKey];
    const actualLabel = traitMeta.values[actualValue].label;

    if (actualValue === binValue) {
      Audio.playCorrect();
      classifyBinPlacements[animalId] = binValue;
      classifySelectedAnimalId = null;
      state.classificationsCompleted = (state.classificationsCompleted || 0) + 1;
      Storage.saveState(state);
      showToast(`✅ Spot on! ${animal.nickname} has ${actualLabel}!`, 'success');
      renderClassifyTab();
    } else {
      Audio.playWrong();
      showToast(`🤔 Look closely at ${animal.nickname}! Its ${traitMeta.shortName} is "${actualLabel}".`, 'warning');
    }
  }

  // ==================== TAB 3: BREED ====================

  function renderBreedTab() {
    const parentA = getAnimalById(state.selectedParentA) || state.animals[0];
    const parentB =
      getAnimalById(state.selectedParentB) ||
      state.animals.find((a) => a.id !== parentA.id) ||
      state.animals[0];

    state.selectedParentA = parentA.id;
    state.selectedParentB = parentB.id;

    // Render Parent A Slot
    document.getElementById('parentSlotA').innerHTML = renderParentCardHTML(parentA, 'A');
    // Render Parent B Slot
    document.getElementById('parentSlotB').innerHTML = renderParentCardHTML(parentB, 'B');

    // Bind change parent buttons
    document.querySelectorAll('.change-parent-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        Audio.playClick();
        openAnimalPickerModal(btn.dataset.slot);
      });
    });

    // Render center trait comparison bridge
    const bridgeEl = document.getElementById('traitComparisonBridge');
    bridgeEl.innerHTML = `
      <div class="bridge-title">Trait Comparison</div>
      ${['coat', 'ears', 'color', 'special']
        .map((key) => {
          const cat = TRAITS[key];
          const valA = cat.values[parentA.traits[key]];
          const valB = cat.values[parentB.traits[key]];
          const same = parentA.traits[key] === parentB.traits[key];
          return `
            <div class="bridge-row ${same ? 'same-trait' : 'diff-trait'}">
              <span class="bridge-side side-a">${valA.badge} ${valA.shortLabel}</span>
              <span class="bridge-center-label">${cat.icon} ${cat.shortName}</span>
              <span class="bridge-side side-b">${valB.badge} ${valB.shortLabel}</span>
            </div>
          `;
        })
        .join('')}
      <p class="bridge-note">
        🎲 Offspring randomly inherits <strong>2 traits from Parent A</strong> and <strong>2 traits from Parent B</strong>!
      </p>
    `;

    // Render Offspring Reveal Card
    renderOffspringCard();
  }

  function renderParentCardHTML(animal, slotLetter) {
    return `
      <div class="parent-badge parent-badge-${slotLetter.toLowerCase()}">Parent ${slotLetter}</div>
      <div class="parent-art-wrap">
        ${Art.renderAnimalSVG(animal, { size: 130 })}
      </div>
      <h3 class="parent-name">${animal.nickname}</h3>
      <p class="parent-species">${animal.speciesName}</p>
      <button class="secondary-btn change-parent-btn" data-slot="parent${slotLetter}">
        🔄 Choose Parent ${slotLetter}
      </button>
    `;
  }

  function handleBreedOffspring() {
    const parentA = getAnimalById(state.selectedParentA);
    const parentB = getAnimalById(state.selectedParentB);
    if (!parentA || !parentB) return;

    const baby = Genetics.breedOffspring(parentA, parentB);
    lastBredOffspring = baby;
    state.animals.unshift(baby);
    state.offspringBredCount = (state.offspringBredCount || 0) + 1;
    state.selectedTestAnimalId = baby.id;
    Storage.saveState(state);

    Audio.playBreed();
    showToast(`🐣 New Offspring Born! Meet "${baby.nickname}"!`, 'success');
    renderBreedTab();
  }

  function renderOffspringCard() {
    const container = document.getElementById('offspringRevealCard');
    if (!lastBredOffspring) {
      container.innerHTML = `
        <div class="empty-offspring-state">
          <div class="egg-illustration">🥚✨</div>
          <h3>Ready to Breed an Offspring!</h3>
          <p>Compare <strong>Parent A</strong> and <strong>Parent B</strong> on the left, then press <strong>"Breed Offspring!"</strong> to see which traits get passed down.</p>
          <div class="edu-callout">
            💡 <strong>Biologist Tip:</strong> Want an animal that survives in the <strong>Desert</strong> or <strong>Snow</strong>? Pick two parents that each have some of the ideal traits and mix them together!
          </div>
        </div>
      `;
      return;
    }

    const baby = lastBredOffspring;
    container.innerHTML = `
      <div class="offspring-celebration">
        <div class="offspring-header-badge">🎉 NEW OFFSPRING (Gen ${baby.generation})</div>
        <div class="offspring-art-stage">
          ${Art.renderAnimalSVG(baby, { size: 155 })}
        </div>
        <h3 class="offspring-title">"${baby.nickname}" the ${baby.speciesName}</h3>
        <p class="offspring-parents-sub">
          Parents: <strong>${baby.parentNames.a} (A)</strong> &amp; <strong>${baby.parentNames.b} (B)</strong>
        </p>

        <div class="inherited-traits-box">
          <h4>🧬 Inherited Trait Mix:</h4>
          <div class="traits-mini-grid">
            ${renderTraitPillsHTML(baby.traits, baby.traitSources)}
          </div>
        </div>

        <div class="offspring-actions">
          <button class="breed-cta-btn" id="testNewBabyBtn">
            🌍 Test "${baby.nickname}" in a Habitat!
          </button>
          <button class="secondary-btn" id="useBabyAsParentBtn">
            🧬 Use as Parent A for Next Generation
          </button>
        </div>
      </div>
    `;

    document.getElementById('testNewBabyBtn').addEventListener('click', () => {
      Audio.playClick();
      state.selectedTestAnimalId = baby.id;
      Storage.saveState(state);
      switchTab('test');
    });

    document.getElementById('useBabyAsParentBtn').addEventListener('click', () => {
      Audio.playClick();
      state.selectedParentA = baby.id;
      Storage.saveState(state);
      showToast(`"${baby.nickname}" is now Parent A! Pick a Parent B to keep improving traits!`, 'info');
      renderBreedTab();
    });
  }

  // ==================== TAB 4: TEST SURVIVAL ====================

  function renderTestTab() {
    if (!state.unlockedHabitats[state.selectedHabitatId]) {
      state.selectedHabitatId = 'forest';
    }
    const habitat = HABITATS[state.selectedHabitatId];
    const testAnimal = getAnimalById(state.selectedTestAnimalId) || state.animals[0];
    state.selectedTestAnimalId = testAnimal.id;

    // Habitat Selector Tabs
    const habTabs = document.getElementById('testHabitatSelector');
    habTabs.innerHTML = Object.values(HABITATS)
      .map((h) => {
        const unlocked = state.unlockedHabitats[h.id];
        const active = state.selectedHabitatId === h.id;
        return `
          <button class="hab-tab-btn ${active ? 'active' : ''} ${!unlocked ? 'locked' : ''}" data-hab="${h.id}">
            <span>${unlocked ? h.icon : '🔒'}</span>
            <span>${h.shortName}</span>
          </button>
        `;
      })
      .join('');

    habTabs.querySelectorAll('.hab-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const habId = btn.dataset.hab;
        if (!state.unlockedHabitats[habId]) {
          Audio.playWrong();
          showToast(`🔒 ${HABITATS[habId].unlockRequirementText}`, 'warning');
          return;
        }
        if (isTestRunning) return;
        Audio.playClick();
        state.selectedHabitatId = habId;
        lastTestResult = null;
        Storage.saveState(state);
        renderTestTab();
      });
    });

    // Selected Animal Summary Bar
    const summaryEl = document.getElementById('selectedTestAnimalSummary');
    summaryEl.innerHTML = `
      <div class="test-animal-avatar">
        ${Art.renderAnimalSVG(testAnimal, { size: 68, animated: false })}
      </div>
      <div class="test-animal-details">
        <strong>${testAnimal.nickname} <span class="species-sub">(${testAnimal.speciesName})</span></strong>
        <div class="test-animal-chips">
          ${['coat', 'ears', 'color', 'special']
            .map((k) => {
              const v = TRAITS[k].values[testAnimal.traits[k]];
              return `<span class="mini-chip">${v.badge} ${v.shortLabel}</span>`;
            })
            .join('')}
        </div>
      </div>
    `;

    // Render Idle Canvas Preview if not currently running simulation
    const canvas = document.getElementById('habitatCanvas');
    if (!isTestRunning) {
      Sim.renderIdleScene(canvas, testAnimal, habitat.id);
      const badge = document.getElementById('canvasOverlayBadge');
      badge.textContent = `${habitat.icon} ${habitat.name} • Goal: ${habitat.targetScore}%+ Survival`;
    }

    renderSurvivalReportPanel(habitat, testAnimal);
  }

  function handleRunSurvivalTest() {
    if (isTestRunning) return;
    const habitat = HABITATS[state.selectedHabitatId];
    const testAnimal = getAnimalById(state.selectedTestAnimalId);
    if (!habitat || !testAnimal) return;

    isTestRunning = true;
    liveBreakdownSteps = [];
    lastTestResult = null;

    const startBtn = document.getElementById('startSurvivalTestBtn');
    startBtn.disabled = true;
    startBtn.textContent = '🐾 Testing in Habitat...';

    const evalResult = Genetics.evaluateSurvival(testAnimal, habitat.id);
    const canvas = document.getElementById('habitatCanvas');
    const badge = document.getElementById('canvasOverlayBadge');
    badge.textContent = `Testing "${testAnimal.nickname}" in ${habitat.name}...`;

    renderSurvivalReportPanel(habitat, testAnimal);

    Sim.runSimulation(
      canvas,
      testAnimal,
      habitat.id,
      evalResult,
      (stepIdx, stepItem) => {
        liveBreakdownSteps.push(stepItem);
        renderSurvivalReportPanel(habitat, testAnimal);
      },
      (finalResult) => {
        isTestRunning = false;
        lastTestResult = finalResult;
        startBtn.disabled = false;
        startBtn.textContent = '🚀 Run Survival Test Again!';

        // Save best scores & check habitat unlocks!
        processTestCompletion(testAnimal, habitat, finalResult);
        badge.textContent = `${finalResult.rankEmoji} Survival Score: ${finalResult.totalScore}% — ${finalResult.rankTitle}`;
        renderHeader();
        renderSurvivalReportPanel(habitat, testAnimal);
      }
    );
  }

  function processTestCompletion(animal, habitat, result) {
    state.testsRunCount = (state.testsRunCount || 0) + 1;
    if (!animal.bestScores) animal.bestScores = { forest: 0, desert: 0, snow: 0 };
    if (result.totalScore > (animal.bestScores[habitat.id] || 0)) {
      animal.bestScores[habitat.id] = result.totalScore;
    }

    if (result.totalScore > (state.bestHabitatScores[habitat.id] || 0)) {
      state.bestHabitatScores[habitat.id] = result.totalScore;
    }

    // Check Habitat Unlocks
    let unlockedSomething = false;
    if (habitat.id === 'forest' && result.totalScore >= 75 && !state.unlockedHabitats.desert) {
      state.unlockedHabitats.desert = true;
      unlockedSomething = true;
      Audio.playUnlock();
      showToast('🎉 NEW HABITAT UNLOCKED: Sunbaked Desert 🏜️! Visit Collect or Test to explore it!', 'unlock');
    } else if (habitat.id === 'desert' && result.totalScore >= 80 && !state.unlockedHabitats.snow) {
      state.unlockedHabitats.snow = true;
      unlockedSomething = true;
      Audio.playUnlock();
      showToast('🎉 NEW HABITAT UNLOCKED: Frozen Tundra 🏔️! Visit Collect or Test to explore it!', 'unlock');
    } else if (result.passedTarget) {
      Audio.playCollect();
      showToast(`🌟 Great job! ${animal.nickname} scored ${result.totalScore}% in ${habitat.name}!`, 'success');
    } else {
      showToast(`📊 ${animal.nickname} scored ${result.totalScore}%. Try breeding better traits for ${habitat.shortName}!`, 'info');
    }

    Storage.saveState(state);
    return unlockedSomething;
  }

  function renderSurvivalReportPanel(habitat, animal) {
    const panel = document.getElementById('survivalReportCard');

    if (isTestRunning) {
      const runningPoints = liveBreakdownSteps.reduce((sum, s) => sum + s.points, 0);
      panel.innerHTML = `
        <div class="report-header">
          <h3>🔬 Live Habitat Checkpoints</h3>
          <div class="live-score-pill">${runningPoints}%</div>
        </div>
        <div class="breakdown-list">
          ${liveBreakdownSteps
            .map((item) => renderBreakdownItemHTML(item))
            .join('')}
        </div>
      `;
      return;
    }

    if (lastTestResult && lastTestResult.habitatId === habitat.id) {
      const res = lastTestResult;
      const scoreClass = res.totalScore >= 80 ? 'high' : res.totalScore >= 60 ? 'med' : 'low';
      panel.innerHTML = `
        <div class="score-banner score-${scoreClass}">
          <div class="score-circle">
            <span class="score-num">${res.totalScore}%</span>
            <span class="score-sub">SURVIVAL</span>
          </div>
          <div class="score-verdict">
            <h3>${res.rankEmoji} ${res.rankTitle}</h3>
            <p>${
              res.passedTarget
                ? `✅ Target of ${res.targetScore}% reached in ${habitat.name}!`
                : `🎯 Goal: Reach ${res.targetScore}%+ in ${habitat.name} (Need +${res.targetScore - res.totalScore}% more)`
            }</p>
          </div>
        </div>

        <h4 class="section-sub-heading">Trait-by-Trait Adaptation Report:</h4>
        <div class="breakdown-list">
          ${res.breakdown.map((item) => renderBreakdownItemHTML(item)).join('')}
        </div>

        <div class="report-footer-actions">
          <button class="secondary-btn" id="breedBetterFromReportBtn">
            🧬 Breed for Better ${habitat.shortName} Traits
          </button>
        </div>
      `;

      document.getElementById('breedBetterFromReportBtn').addEventListener('click', () => {
        Audio.playClick();
        state.selectedParentA = animal.id;
        Storage.saveState(state);
        switchTab('breed');
      });
      return;
    }

    // Default Pre-Test Habitat Guide view
    panel.innerHTML = `
      <div class="habitat-info-box">
        <div class="hab-badge-title">${habitat.icon} ${habitat.name}</div>
        <p class="hab-summary">${habitat.summary}</p>
        <div class="hab-goal-callout">
          🎯 <strong>Habitat Goal:</strong> Achieve a <strong>${habitat.targetScore}% or higher</strong> Survival Score!
          <br/><small>(Your Best Score: <strong>${state.bestHabitatScores[habitat.id] || 0}%</strong>)</small>
        </div>
        <div class="hab-ideal-box">
          <h4>💡 What Helps Animals Survive Here?</h4>
          <p>${habitat.idealTraitsNote}</p>
          <ul class="challenge-preview-list">
            ${habitat.challenges
              .map((c) => `<li><span>${c.icon}</span> <strong>${c.name}</strong> (Tests ${TRAITS[c.trait].shortName})</li>`)
              .join('')}
          </ul>
        </div>
        <p class="press-run-hint">👉 Press <strong>"Run Survival Test!"</strong> to watch <strong>${animal.nickname}</strong> in action!</p>
      </div>
    `;
  }

  function renderBreakdownItemHTML(item) {
    const statusBadge =
      item.status === 'good' ? '✅ Great Match' : item.status === 'ok' ? '⚠️ Okay' : '❌ Poor Match';
    return `
      <div class="breakdown-item status-${item.status}">
        <div class="breakdown-top">
          <span class="breakdown-trait">
            ${item.valueBadge} <strong>${item.valueLabel}</strong>
            ${item.inheritedFrom ? `<span class="inherit-mini-badge parent-${item.inheritedFrom.toLowerCase()}">From Parent ${item.inheritedFrom}</span>` : ''}
          </span>
          <span class="breakdown-points">${statusBadge} (+${item.points}/25)</span>
        </div>
        <p class="breakdown-reason">${item.reason}</p>
      </div>
    `;
  }

  // ==================== ANIMAL PICKER MODAL ====================

  function openAnimalPickerModal(targetRole) {
    const modal = document.getElementById('animalPickerModal');
    const titleEl = document.getElementById('pickerModalTitle');
    const gridEl = document.getElementById('pickerModalGrid');

    if (targetRole === 'parentA') {
      titleEl.textContent = '🅰️ Choose Parent A';
    } else if (targetRole === 'parentB') {
      titleEl.textContent = '🅱️ Choose Parent B';
    } else {
      titleEl.textContent = '🌍 Choose Animal to Test in Habitat';
    }

    gridEl.innerHTML = state.animals
      .map((animal) => {
        const isCurrent =
          (targetRole === 'parentA' && state.selectedParentA === animal.id) ||
          (targetRole === 'parentB' && state.selectedParentB === animal.id) ||
          (targetRole === 'test' && state.selectedTestAnimalId === animal.id);

        return `
          <div class="picker-card ${isCurrent ? 'selected' : ''}" data-id="${animal.id}">
            <div class="picker-art">${Art.renderAnimalSVG(animal, { size: 90, animated: false })}</div>
            <strong>${animal.nickname}</strong>
            <span class="picker-species">${animal.speciesName}</span>
            <div class="picker-traits">
              ${['coat', 'ears', 'color', 'special']
                .map((k) => {
                  const v = TRAITS[k].values[animal.traits[k]];
                  return `<span class="mini-chip">${v.badge} ${v.shortLabel}</span>`;
                })
                .join('')}
            </div>
            <button class="select-animal-btn">${isCurrent ? '✓ Selected' : 'Select'}</button>
          </div>
        `;
      })
      .join('');

    gridEl.querySelectorAll('.picker-card').forEach((card) => {
      card.addEventListener('click', () => {
        const chosenId = card.dataset.id;
        Audio.playPop();
        if (targetRole === 'parentA') {
          state.selectedParentA = chosenId;
          if (state.selectedParentB === chosenId && state.animals.length > 1) {
            const alt = state.animals.find((a) => a.id !== chosenId);
            if (alt) state.selectedParentB = alt.id;
          }
          Storage.saveState(state);
          renderBreedTab();
        } else if (targetRole === 'parentB') {
          state.selectedParentB = chosenId;
          if (state.selectedParentA === chosenId && state.animals.length > 1) {
            const alt = state.animals.find((a) => a.id !== chosenId);
            if (alt) state.selectedParentA = alt.id;
          }
          Storage.saveState(state);
          renderBreedTab();
        } else {
          state.selectedTestAnimalId = chosenId;
          lastTestResult = null;
          Storage.saveState(state);
          renderTestTab();
        }
        modal.hidden = true;
      });
    });

    modal.hidden = false;
  }

  // ==================== FIELD GUIDE & QUESTS MODAL ====================

  function openGuideModal() {
    const modal = document.getElementById('guideModal');
    const body = document.getElementById('guideModalBody');

    const questsHTML = QUEST_GOALS.map((q) => {
      let done = false;
      if (q.habitat === 'any') {
        done =
          Math.max(
            state.bestHabitatScores.forest,
            state.bestHabitatScores.desert,
            state.bestHabitatScores.snow
          ) >= q.requiredScore;
      } else {
        done = (state.bestHabitatScores[q.habitat] || 0) >= q.requiredScore;
      }
      return `
        <div class="quest-card ${done ? 'quest-done' : ''}">
          <div class="quest-status-icon">${done ? '✅' : '🎯'}</div>
          <div>
            <h4>${q.title} <span class="reward-tag">${q.rewardText}</span></h4>
            <p>${q.description}</p>
          </div>
        </div>
      `;
    }).join('');

    body.innerHTML = `
      <div class="guide-section">
        <h4>🏆 Biologist Missions &amp; Progression</h4>
        <div class="quests-list">${questsHTML}</div>
      </div>

      <div class="guide-section">
        <h4>🧬 How Trait Quest Works</h4>
        <div class="edu-pillars-grid">
          <div class="pillar-box">
            <strong>1. Variation 🔍</strong>
            <p>Even individuals of the same species can have slightly different coat thickness, ear size, or colour!</p>
          </div>
          <div class="pillar-box">
            <strong>2. Classification 🗂️</strong>
            <p>Scientists group animals by shared physical traits to understand how their bodies work.</p>
          </div>
          <div class="pillar-box">
            <strong>3. Inheritance 🐣</strong>
            <p>Offspring inherit a mix of traits from Parent A and Parent B.</p>
          </div>
          <div class="pillar-box">
            <strong>4. Adaptation 🌍</strong>
            <p>Traits that match a habitat's climate and terrain help the animal survive better!</p>
          </div>
        </div>
      </div>

      <div class="guide-section reset-zone">
        <span>Animals Collected: <strong>${state.animals.length}</strong> • Offspring Bred: <strong>${state.offspringBredCount || 0}</strong></span>
        <button class="danger-btn" id="resetSaveBtn">🗑️ Reset Game Progress</button>
      </div>
    `;

    document.getElementById('resetSaveBtn').addEventListener('click', () => {
      if (confirm('Reset all animals and habitat progress back to the start?')) {
        state = Storage.resetState();
        lastBredOffspring = null;
        lastTestResult = null;
        startNewExpedition('forest', false);
        renderHeader();
        switchTab('collect');
        modal.hidden = true;
        showToast('Game progress reset!', 'info');
      }
    });

    modal.hidden = false;
  }

  // ==================== TOAST NOTIFICATIONS ====================

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 350);
    }, 3400);
  }

  // ==================== PWA SERVICE WORKER & INSTALL ====================

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
          // Service worker registration optional on file:// protocol
        });
      });
    }
  }

  function setupPwaInstallPrompt() {
    const installBtn = document.getElementById('installPwaBtn');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      installBtn.hidden = false;
    });

    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.hidden = true;
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
