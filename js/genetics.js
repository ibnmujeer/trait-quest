/**
 * Trait Quest - Genetics, Variation, Inheritance & Adaptation Engine
 * Handles generating wild animals with natural individual variation,
 * breeding two parents to pass down traits, and scoring habitat survival.
 */

window.TraitQuestGenetics = (() => {
  const { TRAITS, SPECIES, HABITATS, NICKNAMES } = window.TraitQuestData;

  function weightedPick(weightsObj) {
    const entries = Object.entries(weightsObj);
    const total = entries.reduce((acc, [, w]) => acc + w, 0);
    let r = Math.random() * total;
    for (const [key, weight] of entries) {
      r -= weight;
      if (r <= 0) return key;
    }
    return entries[0][0];
  }

  function randomNickname() {
    return NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
  }

  /**
   * Generates a wild animal of a given species with natural trait variations.
   * Multiple individuals of the same species will have slightly different traits!
   */
  function generateWildAnimal(speciesId, forcedTraitOverride = null) {
    const species = SPECIES.find((s) => s.id === speciesId) || SPECIES[0];
    const traits = {
      coat: weightedPick(species.traitWeights.coat),
      ears: weightedPick(species.traitWeights.ears),
      color: weightedPick(species.traitWeights.color),
      special: weightedPick(species.traitWeights.special)
    };

    if (forcedTraitOverride) {
      Object.assign(traits, forcedTraitOverride);
    }

    return {
      id: 'ani_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7),
      nickname: randomNickname(),
      speciesId: species.id,
      speciesName: species.name,
      bodyType: species.bodyType,
      generation: 1,
      isOffspring: false,
      parentIds: null,
      traitSources: null,
      traits,
      bestScores: { forest: 0, desert: 0, snow: 0 },
      classifiedTraits: {},
      createdAt: Date.now()
    };
  }

  /**
   * Generates a curated starter sanctuary team so players immediately see
   * variation across individuals and have fun parents ready to classify, breed, or test!
   */
  function createStarterAnimals() {
    return [
      {
        id: 'starter_deer_1',
        nickname: 'Bramble',
        speciesId: 'deer',
        speciesName: 'Red Deer',
        bodyType: 'deer',
        generation: 1,
        isOffspring: false,
        parentIds: null,
        traitSources: null,
        traits: { coat: 'medium', ears: 'medium', color: 'brown', special: 'agile' },
        bestScores: { forest: 0, desert: 0, snow: 0 },
        classifiedTraits: {},
        createdAt: Date.now() - 4000
      },
      {
        id: 'starter_fox_1',
        nickname: 'Sunny',
        speciesId: 'redFox',
        speciesName: 'Red Fox',
        bodyType: 'fox',
        generation: 1,
        isOffspring: false,
        parentIds: null,
        traitSources: null,
        traits: { coat: 'thin', ears: 'large', color: 'sandy', special: 'agile' },
        bestScores: { forest: 0, desert: 0, snow: 0 },
        classifiedTraits: {},
        createdAt: Date.now() - 3000
      },
      {
        id: 'starter_rabbit_1',
        nickname: 'Clover',
        speciesId: 'rabbit',
        speciesName: 'Woodland Rabbit',
        bodyType: 'rabbit',
        generation: 1,
        isOffspring: false,
        parentIds: null,
        traitSources: null,
        traits: { coat: 'thick', ears: 'large', color: 'brown', special: 'snowPaws' },
        bestScores: { forest: 0, desert: 0, snow: 0 },
        classifiedTraits: {},
        createdAt: Date.now() - 2000
      }
    ];
  }

  /**
   * Generates 3 wild encounter candidates for a given habitat expedition.
   * Ensures visible variation among the 3 animals (including at least 2 of the same species
   * with different traits to directly illustrate intra-species variation!).
   */
  function generateWildExpedition(habitatId, unlockedHabitats) {
    // Pool of species native to this habitat, plus an occasional visitor from another habitat
    const nativeSpecies = SPECIES.filter((s) => s.nativeHabitat === habitatId);
    const allAvailableSpecies = SPECIES.filter((s) => unlockedHabitats[s.nativeHabitat] || s.nativeHabitat === habitatId);

    const primarySpecies = nativeSpecies[Math.floor(Math.random() * nativeSpecies.length)] || SPECIES[0];
    const secondarySpecies = allAvailableSpecies[Math.floor(Math.random() * allAvailableSpecies.length)] || SPECIES[1];

    // Candidate 1 & Candidate 2 share the same species but are guaranteed to differ in at least 2 traits!
    const animal1 = generateWildAnimal(primarySpecies.id);
    const animal2 = generateWildAnimal(primarySpecies.id);

    // Ensure animal2 has a noticeably different variation from animal1
    const coatKeys = ['thin', 'medium', 'thick'].filter((k) => k !== animal1.traits.coat);
    const earKeys = ['small', 'medium', 'large'].filter((k) => k !== animal1.traits.ears);
    animal2.traits.coat = coatKeys[Math.floor(Math.random() * coatKeys.length)];
    animal2.traits.ears = earKeys[Math.floor(Math.random() * earKeys.length)];
    if (animal2.nickname === animal1.nickname) {
      animal2.nickname = 'Pip';
    }

    // Candidate 3 is another species with an exciting trait variation
    const animal3 = generateWildAnimal(secondarySpecies.id);

    return [animal1, animal2, animal3];
  }

  /**
   * Breeds two parent animals (Parent A and Parent B).
   * Guarantees the offspring inherits a genuine mix of traits from BOTH parents
   * (2 traits from Parent A and 2 traits from Parent B, randomly assigned)
   * and records exactly which parent each trait came from!
   */
  function breedOffspring(parentA, parentB) {
    const traitKeys = ['coat', 'ears', 'color', 'special'];
    // Shuffle the 4 trait keys so 2 come from Parent A and 2 come from Parent B
    const shuffled = [...traitKeys].sort(() => Math.random() - 0.5);
    const fromA = new Set([shuffled[0], shuffled[1]]);

    const offspringTraits = {};
    const traitSources = {};

    traitKeys.forEach((key) => {
      if (fromA.has(key)) {
        offspringTraits[key] = parentA.traits[key];
        traitSources[key] = 'A';
      } else {
        offspringTraits[key] = parentB.traits[key];
        traitSources[key] = 'B';
      }
    });

    // Pick species appearance from one of the parents
    const inheritSpeciesFromA = Math.random() < 0.5;
    const baseParent = inheritSpeciesFromA ? parentA : parentB;
    const speciesLabel =
      parentA.speciesId === parentB.speciesId
        ? parentA.speciesName
        : `${parentA.speciesName.split(' ').pop()}-${parentB.speciesName.split(' ').pop()} Mix`;

    const nextGen = Math.max(parentA.generation || 1, parentB.generation || 1) + 1;

    return {
      id: 'off_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      nickname: randomNickname(),
      speciesId: baseParent.speciesId,
      speciesName: speciesLabel,
      bodyType: baseParent.bodyType,
      generation: nextGen,
      isOffspring: true,
      parentIds: { a: parentA.id, b: parentB.id },
      parentNames: { a: parentA.nickname, b: parentB.nickname },
      traitSources,
      traits: offspringTraits,
      bestScores: { forest: 0, desert: 0, snow: 0 },
      classifiedTraits: {},
      createdAt: Date.now()
    };
  }

  /**
   * Evaluates how well an animal's 4 traits match a specific habitat.
   * Returns a total score (0–100%) and per-trait breakdown with kid-friendly explanations.
   */
  function evaluateSurvival(animal, habitatId) {
    const habitat = HABITATS[habitatId] || HABITATS.forest;
    const breakdown = [];
    let totalScore = 0;

    ['coat', 'ears', 'color', 'special'].forEach((traitKey) => {
      const traitVal = animal.traits[traitKey];
      const traitMeta = TRAITS[traitKey];
      const valMeta = traitMeta.values[traitVal];
      const evalRule = habitat.weights[traitKey][traitVal];

      totalScore += evalRule.points;
      breakdown.push({
        traitKey,
        traitName: traitMeta.name,
        traitIcon: traitMeta.icon,
        valueId: traitVal,
        valueLabel: valMeta.label,
        valueBadge: valMeta.badge,
        points: evalRule.points,
        maxPoints: 25,
        status: evalRule.status, // 'good' | 'ok' | 'bad'
        reason: evalRule.reason,
        inheritedFrom: animal.traitSources ? animal.traitSources[traitKey] : null
      });
    });

    let rankTitle = 'Needs Better Adaptation';
    let rankEmoji = '🌱';
    if (totalScore >= 95) {
      rankTitle = 'Master Habitat Champion!';
      rankEmoji = '👑';
    } else if (totalScore >= 80) {
      rankTitle = 'Superb Survivor!';
      rankEmoji = '🌟';
    } else if (totalScore >= 65) {
      rankTitle = 'Capable Explorer!';
      rankEmoji = '👍';
    }

    return {
      habitatId: habitat.id,
      habitatName: habitat.name,
      totalScore,
      targetScore: habitat.targetScore,
      passedTarget: totalScore >= habitat.targetScore,
      rankTitle,
      rankEmoji,
      breakdown
    };
  }

  return {
    generateWildAnimal,
    createStarterAnimals,
    generateWildExpedition,
    breedOffspring,
    evaluateSurvival
  };
})();
