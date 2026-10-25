/**
 * Trait Quest - Core Game Data
 * Defines real animal species, trait categories, variation rules, habitats, and missions.
 */

window.TraitQuestData = (() => {
  // 4 core visible & inheritable traits
  const TRAITS = {
    coat: {
      id: 'coat',
      name: 'Coat & Insulation',
      shortName: 'Coat',
      icon: '🧥',
      values: {
        thin: {
          id: 'thin',
          label: 'Thin Coat',
          shortLabel: 'Thin',
          badge: '🌬️',
          desc: 'Stays cool in hot sun, loses heat quickly'
        },
        medium: {
          id: 'medium',
          label: 'Medium Fur',
          shortLabel: 'Medium',
          badge: '🍂',
          desc: 'Balanced warmth for mild woodland seasons'
        },
        thick: {
          id: 'thick',
          label: 'Thick Fluffy Fur',
          shortLabel: 'Thick',
          badge: '❄️',
          desc: 'Traps body heat in freezing blizzards'
        }
      }
    },
    ears: {
      id: 'ears',
      name: 'Ear Size',
      shortName: 'Ears',
      icon: '👂',
      values: {
        small: {
          id: 'small',
          label: 'Small Ears',
          shortLabel: 'Small',
          badge: '🧊',
          desc: 'Prevents heat loss in icy winds'
        },
        medium: {
          id: 'medium',
          label: 'Medium Ears',
          shortLabel: 'Medium',
          badge: '🌿',
          desc: 'Good hearing without losing too much warmth'
        },
        large: {
          id: 'large',
          label: 'Large Cooling Ears',
          shortLabel: 'Large',
          badge: '☀️',
          desc: 'Radiates excess heat & hears distant sounds'
        }
      }
    },
    color: {
      id: 'color',
      name: 'Camouflage Colour',
      shortName: 'Colour',
      icon: '🎨',
      values: {
        brown: {
          id: 'brown',
          label: 'Woodland Brown',
          shortLabel: 'Brown',
          badge: '🌲',
          hex: '#8D5B4C',
          lightHex: '#BC8F7F',
          desc: 'Blends into tree trunks, soil, and forest shade'
        },
        sandy: {
          id: 'sandy',
          label: 'Desert Gold',
          shortLabel: 'Sandy',
          badge: '🏜️',
          hex: '#E2A856',
          lightHex: '#F7D794',
          desc: 'Matches golden sand dunes and reflects sunlight'
        },
        white: {
          id: 'white',
          label: 'Snowy White',
          shortLabel: 'White',
          badge: '🏔️',
          hex: '#ECF3F9',
          lightHex: '#FFFFFF',
          desc: 'Hides cleanly against snowdrifts and ice'
        }
      }
    },
    special: {
      id: 'special',
      name: 'Body Adaptation',
      shortName: 'Adaptation',
      icon: '⚡',
      values: {
        agile: {
          id: 'agile',
          label: 'Agile Leaper',
          shortLabel: 'Agile Legs',
          badge: '🦌',
          desc: 'Springs swiftly over fallen logs and bushes'
        },
        water: {
          id: 'water',
          label: 'Water Saver',
          shortLabel: 'Water Saver',
          badge: '💧',
          desc: 'Conserves moisture to survive dry desert heat'
        },
        snowPaws: {
          id: 'snowPaws',
          label: 'Snow-Shoe Feet',
          shortLabel: 'Snow Feet',
          badge: '🐾',
          desc: 'Wide padded feet walk on top of deep snow'
        }
      }
    }
  };

  // 8 Real Animal Species with natural variation pools
  const SPECIES = [
    {
      id: 'deer',
      name: 'Red Deer',
      scientific: 'Cervus elaphus',
      nativeHabitat: 'forest',
      bodyType: 'deer',
      fact: 'Red deer have strong, agile legs for leaping fallen logs and mottled brown coats that blend into woodland shadows.',
      traitWeights: {
        coat: { medium: 0.65, thick: 0.2, thin: 0.15 },
        ears: { medium: 0.65, large: 0.25, small: 0.1 },
        color: { brown: 0.75, sandy: 0.2, white: 0.05 },
        special: { agile: 0.8, snowPaws: 0.1, water: 0.1 }
      }
    },
    {
      id: 'rabbit',
      name: 'Woodland Rabbit',
      scientific: 'Oryctolagus cuniculus',
      nativeHabitat: 'forest',
      bodyType: 'rabbit',
      fact: 'Rabbits use sensitive ears to listen for danger and powerful hind legs to bound quickly through forest brush.',
      traitWeights: {
        coat: { medium: 0.6, thin: 0.2, thick: 0.2 },
        ears: { large: 0.55, medium: 0.35, small: 0.1 },
        color: { brown: 0.65, sandy: 0.25, white: 0.1 },
        special: { agile: 0.7, water: 0.15, snowPaws: 0.15 }
      }
    },
    {
      id: 'redFox',
      name: 'Red Fox',
      scientific: 'Vulpes vulpes',
      nativeHabitat: 'forest',
      bodyType: 'fox',
      fact: 'Red foxes live across forests and meadows. Some individuals grow thicker winter coats or lighter sandy fur!',
      traitWeights: {
        coat: { medium: 0.55, thick: 0.3, thin: 0.15 },
        ears: { medium: 0.55, large: 0.3, small: 0.15 },
        color: { brown: 0.55, sandy: 0.35, white: 0.1 },
        special: { agile: 0.65, snowPaws: 0.2, water: 0.15 }
      }
    },
    {
      id: 'fennecFox',
      name: 'Desert Fennec Fox',
      scientific: 'Vulpes zerda',
      nativeHabitat: 'desert',
      bodyType: 'fox',
      fact: 'The Fennec Fox has huge ears packed with blood vessels that release body heat in the scorching Sahara Desert.',
      traitWeights: {
        coat: { thin: 0.7, medium: 0.25, thick: 0.05 },
        ears: { large: 0.8, medium: 0.15, small: 0.05 },
        color: { sandy: 0.8, brown: 0.15, white: 0.05 },
        special: { water: 0.7, agile: 0.25, snowPaws: 0.05 }
      }
    },
    {
      id: 'camel',
      name: 'Dromedary Camel',
      scientific: 'Camelus dromedarius',
      nativeHabitat: 'desert',
      bodyType: 'camel',
      fact: 'Camels store energy-rich fat in their humps and lose very little water, letting them travel days across hot dunes.',
      traitWeights: {
        coat: { thin: 0.75, medium: 0.2, thick: 0.05 },
        ears: { medium: 0.4, large: 0.4, small: 0.2 },
        color: { sandy: 0.8, brown: 0.18, white: 0.02 },
        special: { water: 0.85, agile: 0.1, snowPaws: 0.05 }
      }
    },
    {
      id: 'jerboa',
      name: 'Desert Jerboa',
      scientific: 'Jaculus jaculus',
      nativeHabitat: 'desert',
      bodyType: 'rabbit',
      fact: 'Jerboas are tiny hopping desert rodents that get almost all the water they need straight from seeds and plants!',
      traitWeights: {
        coat: { thin: 0.7, medium: 0.25, thick: 0.05 },
        ears: { large: 0.75, medium: 0.2, small: 0.05 },
        color: { sandy: 0.75, brown: 0.2, white: 0.05 },
        special: { water: 0.6, agile: 0.35, snowPaws: 0.05 }
      }
    },
    {
      id: 'arcticFox',
      name: 'Arctic Fox',
      scientific: 'Vulpes lagopus',
      nativeHabitat: 'snow',
      bodyType: 'fox',
      fact: 'Arctic foxes have round, compact ears and dense fluffy white coats that keep them warm down to -50°C!',
      traitWeights: {
        coat: { thick: 0.8, medium: 0.15, thin: 0.05 },
        ears: { small: 0.8, medium: 0.15, large: 0.05 },
        color: { white: 0.8, brown: 0.15, sandy: 0.05 },
        special: { snowPaws: 0.75, agile: 0.15, water: 0.1 }
      }
    },
    {
      id: 'penguin',
      name: 'Emperor Penguin',
      scientific: 'Aptenodytes forsteri',
      nativeHabitat: 'snow',
      bodyType: 'penguin',
      fact: 'Penguins have tightly packed feathers, windproof insulation, and sturdy feet built for marching across Antarctic ice.',
      traitWeights: {
        coat: { thick: 0.85, medium: 0.12, thin: 0.03 },
        ears: { small: 0.9, medium: 0.08, large: 0.02 },
        color: { white: 0.8, brown: 0.15, sandy: 0.05 },
        special: { snowPaws: 0.85, water: 0.1, agile: 0.05 }
      }
    }
  ];

  // 3 Distinct Habitats with clear survival rules & scoring rubrics
  const HABITATS = {
    forest: {
      id: 'forest',
      name: 'Whispering Forest',
      shortName: 'Forest',
      icon: '🌲',
      themeColor: '#2E7D32',
      bgGradient: ['#A8E6CF', '#388E3C'],
      unlockedByDefault: true,
      unlockRequirementText: 'Unlocked from the start!',
      targetScore: 75,
      summary: 'Mild seasonal temperatures, dense tree trunks, and fallen logs.',
      idealTraitsNote: 'Best with Medium Fur, Medium Ears, Woodland Brown colour, and Agile Legs.',
      weights: {
        coat: {
          medium: { points: 25, status: 'good', reason: 'Medium fur keeps the right temperature in cool forest shade.' },
          thick: { points: 16, status: 'ok', reason: 'Thick fur is a bit warm when running through the woods.' },
          thin: { points: 14, status: 'ok', reason: 'Thin coat gets chilly on crisp forest mornings.' }
        },
        ears: {
          medium: { points: 25, status: 'good', reason: 'Medium ears hear rustling leaves without snagging on branches.' },
          large: { points: 20, status: 'ok', reason: 'Large ears hear well, though twigs can brush against them.' },
          small: { points: 15, status: 'ok', reason: 'Small ears miss some quiet woodland sounds.' }
        },
        color: {
          brown: { points: 25, status: 'good', reason: 'Woodland Brown blends right into tree bark and forest soil!' },
          sandy: { points: 15, status: 'ok', reason: 'Sandy gold stands out slightly except in dry autumn leaves.' },
          white: { points: 6, status: 'bad', reason: 'Snowy White glows brightly against dark green trees!' }
        },
        special: {
          agile: { points: 25, status: 'good', reason: 'Agile Legs leap cleanly over fallen logs, roots, and streams!' },
          water: { points: 14, status: 'ok', reason: 'Water saving is fine, though streams are already plentiful.' },
          snowPaws: { points: 14, status: 'ok', reason: 'Wide snow feet are slightly clumsy on rocky forest trails.' }
        }
      },
      challenges: [
        { name: 'Temperature Check', trait: 'coat', icon: '🌡️' },
        { name: 'Listening & Brush Check', trait: 'ears', icon: '👂' },
        { name: 'Woodland Camouflage', trait: 'color', icon: '🌲' },
        { name: 'Log-Leaping Obstacle', trait: 'special', icon: '🪵' }
      ]
    },
    desert: {
      id: 'desert',
      name: 'Sunbaked Desert',
      shortName: 'Desert',
      icon: '🏜️',
      themeColor: '#D97706',
      bgGradient: ['#FDE68A', '#D97706'],
      unlockedByDefault: false,
      unlockRequirementText: 'Score 75%+ in Whispering Forest to unlock!',
      targetScore: 80,
      summary: 'Blazing sunshine, golden sand dunes, and scarce water.',
      idealTraitsNote: 'Best with Thin Coat, Large Cooling Ears, Desert Gold colour, and Water Saver.',
      weights: {
        coat: {
          thin: { points: 25, status: 'good', reason: 'Thin coat lets intense body heat escape quickly!' },
          medium: { points: 13, status: 'ok', reason: 'Medium fur feels hot under the midday desert sun.' },
          thick: { points: 4, status: 'bad', reason: 'Thick fluffy fur causes overheating in scorching heat!' }
        },
        ears: {
          large: { points: 25, status: 'good', reason: 'Large ears radiate heat like natural air conditioners!' },
          medium: { points: 15, status: 'ok', reason: 'Medium ears release only a moderate amount of heat.' },
          small: { points: 7, status: 'bad', reason: 'Small ears trap too much body heat inside.' }
        },
        color: {
          sandy: { points: 25, status: 'good', reason: 'Desert Gold matches the sand dunes and reflects sunlight!' },
          brown: { points: 15, status: 'ok', reason: 'Woodland Brown blends with rocks but absorbs more heat.' },
          white: { points: 10, status: 'bad', reason: 'Bright white is easy to spot against golden sand dunes.' }
        },
        special: {
          water: { points: 25, status: 'good', reason: 'Water Saver keeps the animal hydrated between rare oases!' },
          agile: { points: 14, status: 'ok', reason: 'Agile legs work, but dry air quickly tires the animal out.' },
          snowPaws: { points: 15, status: 'ok', reason: 'Wide feet walk on sand, but without water storage it gets thirsty.' }
        }
      },
      challenges: [
        { name: 'Heatwave Cooling', trait: 'coat', icon: '☀️' },
        { name: 'Heat Radiation Check', trait: 'ears', icon: '👂' },
        { name: 'Sand Dune Camouflage', trait: 'color', icon: '🏜️' },
        { name: 'Dry Oasis Journey', trait: 'special', icon: '💧' }
      ]
    },
    snow: {
      id: 'snow',
      name: 'Frozen Tundra',
      shortName: 'Snow',
      icon: '🏔️',
      themeColor: '#0284C7',
      bgGradient: ['#E0F2FE', '#0284C7'],
      unlockedByDefault: false,
      unlockRequirementText: 'Score 80%+ in Sunbaked Desert to unlock!',
      targetScore: 85,
      summary: 'Sub-zero blizzards, deep powdery snowdrifts, and icy winds.',
      idealTraitsNote: 'Best with Thick Fluffy Fur, Small Ears, Snowy White colour, and Snow-Shoe Feet.',
      weights: {
        coat: {
          thick: { points: 25, status: 'good', reason: 'Thick fluffy fur traps warm air during freezing blizzards!' },
          medium: { points: 13, status: 'ok', reason: 'Medium fur shivers when icy arctic winds blow.' },
          thin: { points: 4, status: 'bad', reason: 'Thin coat freezes rapidly in sub-zero snowstorms!' }
        },
        ears: {
          small: { points: 25, status: 'good', reason: 'Small round ears stay warm and prevent frostbite!' },
          medium: { points: 15, status: 'ok', reason: 'Medium ears lose some warmth to the freezing air.' },
          large: { points: 6, status: 'bad', reason: 'Large ears lose body heat fast in icy winds!' }
        },
        color: {
          white: { points: 25, status: 'good', reason: 'Snowy White is almost invisible against snow and ice!' },
          sandy: { points: 10, status: 'bad', reason: 'Sandy gold stands out clearly against white snowfields.' },
          brown: { points: 8, status: 'bad', reason: 'Dark brown coat is spotted immediately on white snow!' }
        },
        special: {
          snowPaws: { points: 25, status: 'good', reason: 'Snow-Shoe Feet spread weight so it glides across deep snow!' },
          agile: { points: 12, status: 'ok', reason: 'Narrow legs sink deep into soft snowdrifts.' },
          water: { points: 10, status: 'bad', reason: 'Water saving does not help walk through deep snowdrifts.' }
        }
      },
      challenges: [
        { name: 'Blizzard Insulation', trait: 'coat', icon: '❄️' },
        { name: 'Frostbite Protection', trait: 'ears', icon: '🧊' },
        { name: 'Snowdrift Camouflage', trait: 'color', icon: '🏔️' },
        { name: 'Deep Snow Crossing', trait: 'special', icon: '🐾' }
      ]
    }
  };

  // Friendly name prefixes/suffixes for wild & bred animals
  const NICKNAMES = [
    'Pip', 'Bramble', 'Sunny', 'Willow', 'Pebble', 'Clover', 'Frosty', 'Dune',
    'Maple', 'Breeze', 'Ziggy', 'Acorn', 'Snowdrop', 'Amber', 'Juniper', 'Rusty',
    'Mochi', 'Hazel', 'Comet', 'Fern', 'Kiko', 'Tumble', 'Cinnamon', 'Blizzard',
    'Skye', 'Nutmeg', 'Sandy', 'Aspen', 'Pippin', 'echo', 'Berry', 'Spark'
  ];

  // Classification sorting missions to make the Classify tab an interactive game!
  const CLASSIFY_CHALLENGES = [
    {
      id: 'sort_coat',
      title: 'Sort by Coat Thickness',
      prompt: 'Drag or tap each animal into the matching Coat group to study how insulation varies!',
      traitKey: 'coat',
      bins: [
        { value: 'thin', label: 'Thin Coat 🌬️', color: '#FEF3C7', border: '#F59E0B' },
        { value: 'medium', label: 'Medium Fur 🍂', color: '#DCFCE7', border: '#10B981' },
        { value: 'thick', label: 'Thick Fur ❄️', color: '#E0F2FE', border: '#0284C7' }
      ]
    },
    {
      id: 'sort_ears',
      title: 'Sort by Ear Size',
      prompt: 'Group your animals by Ear Size! Big ears cool the body; small ears save warmth.',
      traitKey: 'ears',
      bins: [
        { value: 'small', label: 'Small Ears 🧊', color: '#E0F2FE', border: '#0284C7' },
        { value: 'medium', label: 'Medium Ears 🌿', color: '#DCFCE7', border: '#10B981' },
        { value: 'large', label: 'Large Ears ☀️', color: '#FEF3C7', border: '#F59E0B' }
      ]
    },
    {
      id: 'sort_color',
      title: 'Sort by Camouflage Colour',
      prompt: 'Classify animals by their coat colour to see where each one can hide best!',
      traitKey: 'color',
      bins: [
        { value: 'brown', label: 'Woodland Brown 🌲', color: '#EFEBE9', border: '#795548' },
        { value: 'sandy', label: 'Desert Gold 🏜️', color: '#FEF3C7', border: '#D97706' },
        { value: 'white', label: 'Snowy White 🏔️', color: '#F1F5F9', border: '#64748B' }
      ]
    },
    {
      id: 'sort_special',
      title: 'Sort by Body Adaptation',
      prompt: 'Group animals by their special survival feature!',
      traitKey: 'special',
      bins: [
        { value: 'agile', label: 'Agile Legs 🦌', color: '#DCFCE7', border: '#10B981' },
        { value: 'water', label: 'Water Saver 💧', color: '#FEF3C7', border: '#F59E0B' },
        { value: 'snowPaws', label: 'Snow Feet 🐾', color: '#E0F2FE', border: '#0284C7' }
      ]
    }
  ];

  // Guided quests that teach variation, classification, inheritance, and adaptation step-by-step
  const QUEST_GOALS = [
    {
      id: 'quest_forest_75',
      title: 'Forest Explorer',
      description: 'Test or breed an animal that scores 75% or higher in the Whispering Forest to unlock the Desert!',
      habitat: 'forest',
      requiredScore: 75,
      rewardText: 'Unlocks Sunbaked Desert 🏜️'
    },
    {
      id: 'quest_desert_80',
      title: 'Desert Adapter',
      description: 'Create or find an animal that survives 80% or higher in the Sunbaked Desert to unlock the Frozen Tundra!',
      habitat: 'desert',
      requiredScore: 80,
      rewardText: 'Unlocks Frozen Tundra 🏔️'
    },
    {
      id: 'quest_snow_85',
      title: 'Arctic Survivor',
      description: 'Breed an animal with thick fur, small ears, white coat, or snow feet that survives 85% or higher in the Frozen Tundra!',
      habitat: 'snow',
      requiredScore: 85,
      rewardText: 'Unlocks Master Biologist Badge 🏆'
    },
    {
      id: 'quest_perfect_100',
      title: 'Perfect 100% Adaptation',
      description: 'Breed a champion offspring that reaches a 100% Survival Score in any habitat!',
      habitat: 'any',
      requiredScore: 100,
      rewardText: 'Golden Adaptation Crown 👑'
    }
  ];

  return {
    TRAITS,
    SPECIES,
    HABITATS,
    NICKNAMES,
    CLASSIFY_CHALLENGES,
    QUEST_GOALS
  };
})();
