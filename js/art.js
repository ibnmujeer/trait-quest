/**
 * Trait Quest - Cute Kawaii Chibi Vector Art Engine
 * Inspired by storybook chibi woodland illustrations:
 * - Warm dark-brown rounded outlines (#5A3219)
 * - Soft pastel/earthy fills with cream cheeks & chest patches
 * - Cute wide-set button eyes, rosy cheeks, tiny nose & sweet 'w' smile
 * - Decorative floating stars & dots around each animal
 * - Guaranteed to stay 100% inside the 220x220 viewBox with generous padding so nothing ever clips!
 */

window.TraitQuestArt = (() => {
  const { SPECIES } = window.TraitQuestData;

  function getColorPalette(colorKey) {
    const palettes = {
      brown: {
        outline: '#542D14',
        main: '#C87D46',
        dark: '#9C5728',
        cream: '#FCE5C8',
        innerEar: '#F4A28C',
        blush: '#F29479',
        antler: '#7F4F24',
        hoof: '#4A2810',
        star: '#E08E45',
        dot: '#A46A3E'
      },
      sandy: {
        outline: '#5C3412',
        main: '#F49D4B',
        dark: '#D47628',
        cream: '#FFF1D6',
        innerEar: '#F9B49C',
        blush: '#F48C72',
        antler: '#8C5828',
        hoof: '#5C3412',
        star: '#F59E0B',
        dot: '#C88A4B'
      },
      white: {
        outline: '#475569',
        main: '#F1F5F9',
        dark: '#CBD5E1',
        cream: '#FFFFFF',
        innerEar: '#FBCFE8',
        blush: '#F9A8D4',
        antler: '#64748B',
        hoof: '#334155',
        star: '#38BDF8',
        dot: '#94A3B8'
      }
    };
    return palettes[colorKey] || palettes.brown;
  }

  /**
   * Renders the decorative kawaii stars and tiny dots around the character
   * (strictly inside x: 24..196, y: 24..190)
   */
  function renderKawaiiSparkles(pal) {
    return `
      <g class="kawaii-sparkles" opacity="0.88">
        <!-- Top-left mini star -->
        <path d="M34 42 L36 47 L41 48 L37 51 L38 56 L34 53 L30 56 L31 51 L27 48 L32 47 Z" fill="${pal.star}" />
        <!-- Top-right mini star -->
        <path d="M184 40 L186 45 L191 46 L187 49 L188 54 L184 51 L180 54 L181 49 L177 46 L182 45 Z" fill="${pal.star}" />
        <!-- Bottom-left mini star -->
        <path d="M32 162 L34 166 L38 167 L35 170 L36 174 L32 171 L28 174 L29 170 L26 167 L30 166 Z" fill="${pal.star}" />
        <!-- Cute floating dots -->
        <circle cx="28" cy="105" r="3" fill="${pal.dot}" />
        <circle cx="190" cy="96" r="3.2" fill="${pal.dot}" />
        <circle cx="182" cy="166" r="3" fill="${pal.star}" />
        <circle cx="48" cy="28" r="2.5" fill="${pal.dot}" />
      </g>
    `;
  }

  /**
   * Cute kawaii face: wide-set dark eyes, soft blush cheeks, tiny oval nose & 'w' smile
   */
  function renderKawaiiFace(cx, cy, pal, opts = {}) {
    const eyeSpread = opts.eyeSpread || 18;
    const eyeY = cy - 2;
    const noseY = cy + 6;

    return `
      <!-- Cute Rosy Blush Cheeks -->
      <ellipse cx="${cx - eyeSpread - 5}" cy="${cy + 5}" rx="5.5" ry="3.2" fill="${pal.blush}" opacity="0.65" />
      <ellipse cx="${cx + eyeSpread + 5}" cy="${cy + 5}" rx="5.5" ry="3.2" fill="${pal.blush}" opacity="0.65" />

      <!-- Button Eyes -->
      <circle cx="${cx - eyeSpread}" cy="${eyeY}" r="4.3" fill="${pal.outline}" />
      <circle cx="${cx - eyeSpread - 1.3}" cy="${eyeY - 1.3}" r="1.4" fill="#FFFFFF" />
      <circle cx="${cx + eyeSpread}" cy="${eyeY}" r="4.3" fill="${pal.outline}" />
      <circle cx="${cx + eyeSpread - 1.3}" cy="${eyeY - 1.3}" r="1.4" fill="#FFFFFF" />

      <!-- Tiny Nose & 'w' Mouth -->
      <ellipse cx="${cx}" cy="${noseY}" rx="4.2" ry="3" fill="${pal.outline}" />
      <path d="M${cx - 5.5} ${noseY + 5} Q${cx - 2.7} ${noseY + 8.5} ${cx} ${noseY + 5} Q${cx + 2.7} ${noseY + 8.5} ${cx + 5.5} ${noseY + 5}" fill="none" stroke="${pal.outline}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
    `;
  }

  /**
   * 1. KAWAII FOX (Red Fox, Desert Fennec Fox, Arctic Fox)
   * Matches the cute sitting fox in the reference sheet with cream cheek tufts,
   * V-shaped orange brow, fluffy chest diamond, and curled white-tipped tail.
   */
  function renderKawaiiFox(pal, traits) {
    const earScale = traits.ears === 'large' ? 1.24 : traits.ears === 'small' ? 0.72 : 1.0;
    const bodyW = traits.coat === 'thick' ? 32 : traits.coat === 'thin' ? 24 : 28;
    const isThick = traits.coat === 'thick';
    const pawRx = traits.special === 'snowPaws' ? 11 : 6.5;

    return `
      <!-- Curled Fluffy Tail with Cream Tip (stays inside x=115..182) -->
      <g>
        <path d="M122 166 C158 170, 178 144, 168 114 C162 118, 152 120, 146 126 C138 134, 130 148, 122 158 Z" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.6" stroke-linejoin="round" />
        <path d="M168 114 C160 116, 152 120, 147 127 C154 132, 163 132, 170 128 C172 122, 170 117, 168 114 Z" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.4" stroke-linejoin="round" />
      </g>

      <!-- Water Saver Back Pouch/Hump if water trait -->
      ${traits.special === 'water' ? `
        <ellipse cx="128" cy="134" rx="16" ry="14" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.4" />
      ` : ''}

      <!-- Sitting Chibi Body -->
      <path d="M${104 - bodyW} 168 C${100 - bodyW} 134, ${88} 118, 104 118 C120 118, ${108 + bodyW} 134, ${104 + bodyW} 168 Z" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.6" stroke-linejoin="round" />

      <!-- Cream Chest Fur Diamond (Fluffier if thick coat) -->
      <path d="M104 116 L${isThick ? 82 : 88} 136 Q104 ${isThick ? 166 : 156} ${isThick ? 126 : 120} 136 Z" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.2" stroke-linejoin="round" />
      ${isThick ? `<path d="M84 134 L78 140 L88 144 M124 134 L130 140 L120 144" fill="none" stroke="${pal.outline}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ''}

      <!-- Front Seated Legs & Cute Paws -->
      <path d="M92 142 L90 168 M116 142 L118 168" stroke="${pal.outline}" stroke-width="3.4" stroke-linecap="round" />
      <ellipse cx="82" cy="169" rx="${pawRx}" ry="5.5" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.2" />
      <ellipse cx="95" cy="171" rx="${pawRx * 0.9}" ry="5.5" fill="${pal.hoof}" stroke="${pal.outline}" stroke-width="3.2" />
      <ellipse cx="113" cy="171" rx="${pawRx * 0.9}" ry="5.5" fill="${pal.hoof}" stroke="${pal.outline}" stroke-width="3.2" />
      <ellipse cx="126" cy="169" rx="${pawRx}" ry="5.5" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.2" />

      <!-- Fox Ears (Scaled safely around head) -->
      <g transform="translate(73, 66) scale(${earScale})">
        <path d="M-16 10 C-22 -14, -14 -28, -4 -30 C6 -28, 12 -14, 12 4 Z" fill="${pal.main}" stroke="${pal.outline}" stroke-width="${3.6 / earScale}" stroke-linejoin="round" />
        <path d="M-10 6 C-14 -10, -9 -20, -3 -21 C3 -19, 6 -10, 6 2 Z" fill="${pal.cream}" />
        <path d="M-9 -16 C-6 -24, -1 -24, 3 -16 Z" fill="${pal.dark}" />
      </g>
      <g transform="translate(135, 66) scale(${earScale})">
        <path d="M16 10 C22 -14, 14 -28, 4 -30 C-6 -28, -12 -14, -12 4 Z" fill="${pal.main}" stroke="${pal.outline}" stroke-width="${3.6 / earScale}" stroke-linejoin="round" />
        <path d="M10 6 C14 -10, 9 -20, 3 -21 C-3 -19, -6 -10, -6 2 Z" fill="${pal.cream}" />
        <path d="M9 -16 C6 -24, 1 -24, -3 -16 Z" fill="${pal.dark}" />
      </g>

      <!-- Chibi Fox Head with Side Cheek Tufts -->
      <path d="M104 54 C76 54, 62 72, 60 88 L52 95 L62 103 C70 115, 86 120, 104 120 C122 120, 138 115, 146 103 L156 95 L148 88 C146 72, 132 54, 104 54 Z" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.6" stroke-linejoin="round" />

      <!-- Cream Lower Face & Cheek Fluff (Creates the cute V-brow!) -->
      <path d="M60 90 C72 82, 92 86, 104 98 C116 86, 136 82, 148 90 L154 95 L145 103 C136 115, 122 120, 104 120 C86 120, 72 115, 63 103 L54 95 Z" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.2" stroke-linejoin="round" />

      ${renderKawaiiFace(104, 95, pal, { eyeSpread: 19 })}
    `;
  }

  /**
   * 2. KAWAII RABBIT / JERBOA
   * Matches the cute pastel bunny in the reference sheet with upright rounded ears,
   * soft pear body, inward-curved front paws, and fluffy cotton tail on the side.
   */
  function renderKawaiiRabbit(pal, traits) {
    const earScale = traits.ears === 'large' ? 1.22 : traits.ears === 'small' ? 0.65 : 0.95;
    const bodyRx = traits.coat === 'thick' ? 34 : traits.coat === 'thin' ? 25 : 29;
    const isThick = traits.coat === 'thick';
    const pawRx = traits.special === 'snowPaws' ? 13 : 8;

    return `
      <!-- Cute Fluffy Pom-Pom Tail on Right Side -->
      <circle cx="${106 + bodyRx}" cy="158" r="${isThick ? 12 : 9}" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.5" />

      <!-- Upright Rounded Bunny Ears (Safely within y=22..85) -->
      <g transform="translate(88, 66) scale(${earScale})">
        <path d="M-12 6 C-18 -20, -14 -38, -4 -38 C6 -38, 8 -20, 4 6 Z" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="${3.6 / earScale}" stroke-linejoin="round" />
        <path d="M-7 2 C-11 -16, -9 -28, -3 -28 C2 -28, 3 -16, 0 2 Z" fill="${pal.innerEar}" />
      </g>
      <g transform="translate(120, 66) scale(${earScale})">
        <path d="M12 6 C18 -20, 14 -38, 4 -38 C-6 -38, -8 -20, -4 6 Z" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="${3.6 / earScale}" stroke-linejoin="round" />
        <path d="M7 2 C11 -16, 9 -28, 3 -28 C-2 -28, -3 -16, 0 2 Z" fill="${pal.innerEar}" />
      </g>

      <!-- Rounded Pear-Shaped Chibi Body -->
      <path d="M${104 - bodyRx} 166 C${100 - bodyRx} 130, 84 114, 104 114 C124 114, ${108 + bodyRx} 130, ${104 + bodyRx} 166 C${104 + bodyRx} 172, ${104 - bodyRx} 172, ${104 - bodyRx} 166 Z" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.6" stroke-linejoin="round" />

      <!-- Darker Belly Patch or Fluffy Chest Ruff -->
      <ellipse cx="104" cy="148" rx="${bodyRx * 0.52}" ry="16" fill="${pal.main}" opacity="0.65" />
      ${isThick ? `
        <path d="M84 122 Q94 132 104 124 Q114 132 124 122" fill="none" stroke="${pal.outline}" stroke-width="3" stroke-linecap="round" />
      ` : ''}

      <!-- Cute Curved Front Paws on Chest -->
      <path d="M90 134 C86 144, 92 152, 98 146" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.2" stroke-linecap="round" />
      <path d="M118 134 C122 144, 116 152, 110 146" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.2" stroke-linecap="round" />

      <!-- Bottom Feet -->
      <ellipse cx="84" cy="169" rx="${pawRx}" ry="5.5" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.4" />
      <ellipse cx="124" cy="169" rx="${pawRx}" ry="5.5" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.4" />

      <!-- Big Chubby Bunny Head -->
      <ellipse cx="104" cy="92" rx="35" ry="29" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.6" />
      <!-- Subtle top head color patch -->
      <path d="M74 78 Q104 90 134 78 C128 66, 116 63, 104 63 C92 63, 80 66, 74 78 Z" fill="${pal.main}" opacity="0.45" />

      ${renderKawaiiFace(104, 94, pal, { eyeSpread: 16 })}
    `;
  }

  /**
   * 3. KAWAII SPOTTED DEER
   * Matches the cute deer in the reference sheet with rounded branched antlers,
   * side-pointing ears, cream chest & face, and white fawn spots on the back!
   */
  function renderKawaiiDeer(pal, traits) {
    const earScale = traits.ears === 'large' ? 1.25 : traits.ears === 'small' ? 0.72 : 1.0;
    const bodyRy = traits.coat === 'thick' ? 23 : traits.coat === 'thin' ? 17 : 20;
    const isThick = traits.coat === 'thick';
    const legH = traits.special === 'agile' ? 28 : 22;
    const hoofW = traits.special === 'snowPaws' ? 9.5 : 5.5;

    return `
      <!-- Cute Perky Tail -->
      <path d="M144 128 C156 118, 160 128, 150 138 Z" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.4" stroke-linejoin="round" />

      <!-- 4 Standing Legs & Hooves -->
      <rect x="86" y="142" width="9" height="${legH}" rx="4.5" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.2" />
      <rect x="98" y="144" width="9" height="${legH}" rx="4.5" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.2" />
      <rect x="122" y="142" width="9" height="${legH}" rx="4.5" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.2" />
      <rect x="134" y="144" width="9" height="${legH}" rx="4.5" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.2" />

      <ellipse cx="90.5" cy="${142 + legH}" rx="${hoofW}" ry="4.5" fill="${pal.hoof}" stroke="${pal.outline}" stroke-width="2.8" />
      <ellipse cx="102.5" cy="${144 + legH}" rx="${hoofW}" ry="4.5" fill="${pal.hoof}" stroke="${pal.outline}" stroke-width="2.8" />
      <ellipse cx="126.5" cy="${142 + legH}" rx="${hoofW}" ry="4.5" fill="${pal.hoof}" stroke="${pal.outline}" stroke-width="2.8" />
      <ellipse cx="138.5" cy="${144 + legH}" rx="${hoofW}" ry="4.5" fill="${pal.hoof}" stroke="${pal.outline}" stroke-width="2.8" />

      <!-- Water Hump if water trait -->
      ${traits.special === 'water' ? `
        <ellipse cx="124" cy="118" rx="15" ry="12" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.4" />
      ` : ''}

      <!-- Deer Body -->
      <ellipse cx="116" cy="134" rx="32" ry="${bodyRy}" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.6" />

      <!-- Cream Chest / Neck Front -->
      <path d="M84 108 L84 138 C84 146, 98 148, 104 140 L102 108 Z" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.2" stroke-linejoin="round" />
      ${isThick ? `
        <ellipse cx="95" cy="122" rx="16" ry="11" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3" />
      ` : ''}

      <!-- Cute Fawn Spots on Back -->
      <circle cx="114" cy="126" r="3.2" fill="${pal.cream}" />
      <circle cx="126" cy="124" r="3.5" fill="${pal.cream}" />
      <circle cx="136" cy="130" r="3" fill="${pal.cream}" />
      <circle cx="120" cy="135" r="3" fill="${pal.cream}" />

      <!-- Cute Rounded Antlers (Safely inside y=30..65) -->
      <path d="M82 62 C74 48, 74 36, 80 34 M76 46 L66 42" fill="none" stroke="${pal.antler}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M106 62 C114 48, 114 36, 108 34 M112 46 L122 42" fill="none" stroke="${pal.antler}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Side-Outward Deer Ears -->
      <g transform="translate(66, 72) scale(${earScale})">
        <ellipse cx="-12" cy="-2" rx="14" ry="7.5" transform="rotate(-18)" fill="${pal.main}" stroke="${pal.outline}" stroke-width="${3.4 / earScale}" />
        <ellipse cx="-11" cy="-2" rx="8" ry="4" transform="rotate(-18)" fill="${pal.innerEar}" />
      </g>
      <g transform="translate(122, 72) scale(${earScale})">
        <ellipse cx="12" cy="-2" rx="14" ry="7.5" transform="rotate(18)" fill="${pal.main}" stroke="${pal.outline}" stroke-width="${3.4 / earScale}" />
        <ellipse cx="11" cy="-2" rx="8" ry="4" transform="rotate(18)" fill="${pal.innerEar}" />
      </g>

      <!-- Chibi Deer Head -->
      <ellipse cx="94" cy="84" rx="31" ry="25" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.6" />
      <!-- Cream Lower Face / Muzzle Mask -->
      <path d="M65 88 C74 80, 86 84, 94 92 C102 84, 114 80, 123 88 C120 102, 108 109, 94 109 C80 109, 68 102, 65 88 Z" fill="${pal.cream}" />

      <!-- Tiny Forehead Dots -->
      <circle cx="88" cy="67" r="2.2" fill="${pal.cream}" />
      <circle cx="100" cy="67" r="2.2" fill="${pal.cream}" />
      <circle cx="94" cy="72" r="2.2" fill="${pal.cream}" />

      ${renderKawaiiFace(94, 88, pal, { eyeSpread: 16 })}
    `;
  }

  /**
   * 4. KAWAII DROMEDARY CAMEL
   * Cute chibi desert camel with a big rounded hump, cozy neck ruff, and wide padded feet.
   */
  function renderKawaiiCamel(pal, traits) {
    const earScale = traits.ears === 'large' ? 1.3 : traits.ears === 'small' ? 0.72 : 1.0;
    const humpH = traits.special === 'water' ? 24 : 16;
    const isThick = traits.coat === 'thick';
    const pawW = traits.special === 'snowPaws' ? 11 : 7.5;

    return `
      <!-- Cute Tufted Tail -->
      <path d="M150 130 Q162 136 158 148" fill="none" stroke="${pal.outline}" stroke-width="3.4" stroke-linecap="round" />
      <circle cx="158" cy="150" r="4.5" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="2.8" />

      <!-- 4 Standing Legs & Padded Feet -->
      <rect x="86" y="142" width="10" height="24" rx="5" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.2" />
      <rect x="100" y="144" width="10" height="24" rx="5" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.2" />
      <rect x="124" y="142" width="10" height="24" rx="5" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.2" />
      <rect x="136" y="144" width="10" height="24" rx="5" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.2" />

      <ellipse cx="91" cy="167" rx="${pawW}" ry="4.5" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3" />
      <ellipse cx="105" cy="169" rx="${pawW}" ry="4.5" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3" />
      <ellipse cx="129" cy="167" rx="${pawW}" ry="4.5" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3" />
      <ellipse cx="141" cy="169" rx="${pawW}" ry="4.5" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3" />

      <!-- Rounded Water-Storing Hump on Back -->
      <ellipse cx="124" cy="${122 - (humpH - 16) * 0.5}" rx="21" ry="${humpH}" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.6" />

      <!-- Camel Body -->
      <ellipse cx="118" cy="134" rx="34" ry="${isThick ? 24 : 20}" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.6" />
      <ellipse cx="116" cy="138" rx="22" ry="12" fill="${pal.cream}" opacity="0.75" />

      <!-- Curved Neck & Fluffy Chest -->
      <path d="M80 96 Q80 134 102 140 L108 122 Q94 118 96 94 Z" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.6" stroke-linejoin="round" />
      ${isThick ? `<ellipse cx="94" cy="122" rx="16" ry="12" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3.2" />` : ''}

      <!-- Rounded Chibi Camel Ears -->
      <g transform="translate(66, 68) scale(${earScale})">
        <circle cx="-8" cy="-4" r="9.5" fill="${pal.main}" stroke="${pal.outline}" stroke-width="${3.4 / earScale}" />
        <circle cx="-8" cy="-4" r="5" fill="${pal.innerEar}" />
      </g>
      <g transform="translate(114, 68) scale(${earScale})">
        <circle cx="8" cy="-4" r="9.5" fill="${pal.main}" stroke="${pal.outline}" stroke-width="${3.4 / earScale}" />
        <circle cx="8" cy="-4" r="5" fill="${pal.innerEar}" />
      </g>

      <!-- Chibi Camel Head -->
      <ellipse cx="90" cy="82" rx="29" ry="24" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.6" />
      <ellipse cx="90" cy="90" rx="20" ry="13" fill="${pal.cream}" />
      <!-- Cute Fluffy Forehead Curl -->
      <path d="M82 58 Q90 52 98 58" fill="none" stroke="${pal.outline}" stroke-width="3.4" stroke-linecap="round" />

      ${renderKawaiiFace(90, 84, pal, { eyeSpread: 15 })}
    `;
  }

  /**
   * 5. KAWAII EMPEROR PENGUIN
   * Matches the cute round owl/bird silhouette in the reference sheet with heart-shaped
   * cream face mask, plump belly with feather scallops, side flippers, and orange feet!
   */
  function renderKawaiiPenguin(pal, traits) {
    const earScale = traits.ears === 'large' ? 1.3 : traits.ears === 'small' ? 0.7 : 1.0;
    const bodyRx = traits.coat === 'thick' ? 38 : traits.coat === 'thin' ? 28 : 33;
    const isThick = traits.coat === 'thick';
    const footRx = traits.special === 'snowPaws' ? 13 : 8.5;

    return `
      <!-- Cute Orange Webbed Feet -->
      <ellipse cx="88" cy="170" rx="${footRx}" ry="5.5" fill="#F59E0B" stroke="${pal.outline}" stroke-width="3.4" />
      <ellipse cx="120" cy="170" rx="${footRx}" ry="5.5" fill="#F59E0B" stroke="${pal.outline}" stroke-width="3.4" />

      <!-- Side Ear-Crest Feathers (Scaled by Ear Trait) -->
      <g transform="translate(72, 68) scale(${earScale})">
        <path d="M-4 4 C-18 -2, -20 -12, -8 -12 C-2 -12, 2 -6, 2 2 Z" fill="#FBBF24" stroke="${pal.outline}" stroke-width="${3.4 / earScale}" stroke-linejoin="round" />
      </g>
      <g transform="translate(136, 68) scale(${earScale})">
        <path d="M4 4 C18 -2, 20 -12, 8 -12 C2 -12, -2 -6, -2 2 Z" fill="#FBBF24" stroke="${pal.outline}" stroke-width="${3.4 / earScale}" stroke-linejoin="round" />
      </g>

      <!-- Plump Chibi Penguin Body + Head -->
      <ellipse cx="104" cy="122" rx="${bodyRx}" ry="46" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.6" />
      <ellipse cx="104" cy="84" rx="33" ry="28" fill="${pal.dark}" stroke="${pal.outline}" stroke-width="3.6" />

      <!-- Cream Heart-Shaped Face & Round Belly -->
      <ellipse cx="104" cy="132" rx="${bodyRx * 0.72}" ry="33" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3" />
      <path d="M77 84 C77 70, 94 70, 104 80 C114 70, 131 70, 131 84 C131 98, 118 105, 104 105 C90 105, 77 98, 77 84 Z" fill="${pal.cream}" stroke="${pal.outline}" stroke-width="3" stroke-linejoin="round" />

      <!-- Cute Feather Scallop Lines on Belly (like the owl in the reference art!) -->
      <g fill="none" stroke="${pal.outline}" stroke-width="2.4" stroke-linecap="round">
        <path d="M94 122 Q98 127 102 122" />
        <path d="M106 122 Q110 127 114 122" />
        <path d="M89 132 Q93 137 97 132" />
        <path d="M101 132 Q105 137 109 132" />
        <path d="M113 132 Q117 137 121 132" />
        ${isThick ? `
          <path d="M94 142 Q98 147 102 142" />
          <path d="M106 142 Q110 147 114 142" />
        ` : ''}
      </g>

      <!-- Side Flippers -->
      <path d="M${104 - bodyRx + 3} 106 C${86 - bodyRx} 122, ${88 - bodyRx} 146, ${104 - bodyRx + 6} 148 Z" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.5" stroke-linejoin="round" />
      <path d="M${104 + bodyRx - 3} 106 C${122 + bodyRx} 122, ${120 + bodyRx} 146, ${104 + bodyRx - 6} 148 Z" fill="${pal.main}" stroke="${pal.outline}" stroke-width="3.5" stroke-linejoin="round" />

      <!-- Blush & Eyes -->
      <ellipse cx="83" cy="90" rx="5.5" ry="3.2" fill="${pal.blush}" opacity="0.7" />
      <ellipse cx="125" cy="90" rx="5.5" ry="3.2" fill="${pal.blush}" opacity="0.7" />
      <circle cx="89" cy="84" r="4.3" fill="${pal.outline}" />
      <circle cx="87.8" cy="82.8" r="1.4" fill="#FFFFFF" />
      <circle cx="119" cy="84" r="4.3" fill="${pal.outline}" />
      <circle cx="117.8" cy="82.8" r="1.4" fill="#FFFFFF" />

      <!-- Cute Little Diamond Beak -->
      <path d="M98 89 L104 85 L110 89 L104 96 Z" fill="#F59E0B" stroke="${pal.outline}" stroke-width="2.8" stroke-linejoin="round" />
    `;
  }

  /**
   * Renders a complete, self-contained SVG string for an animal
   */
  function renderAnimalSVG(animal, opts = {}) {
    const species = SPECIES.find((s) => s.id === animal.speciesId) || SPECIES[0];
    const bodyType = animal.bodyType || species.bodyType || 'fox';
    const traits = animal.traits || { coat: 'medium', ears: 'medium', color: 'brown', special: 'agile' };
    const pal = getColorPalette(traits.color);
    const size = opts.size || 150;

    let characterArt = '';
    if (bodyType === 'penguin') {
      characterArt = renderKawaiiPenguin(pal, traits);
    } else if (bodyType === 'camel') {
      characterArt = renderKawaiiCamel(pal, traits);
    } else if (bodyType === 'deer') {
      characterArt = renderKawaiiDeer(pal, traits);
    } else if (bodyType === 'rabbit') {
      characterArt = renderKawaiiRabbit(pal, traits);
    } else {
      characterArt = renderKawaiiFox(pal, traits);
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 200" width="${size}" height="${size}" class="animal-svg kawaii-chibi-svg ${opts.animated !== false ? 'animal-breathe' : ''}" aria-label="${species.name}">
        <!-- Soft Ground Shadow -->
        <ellipse cx="108" cy="176" rx="46" ry="8" fill="rgba(84, 45, 20, 0.12)" />
        ${renderKawaiiSparkles(pal)}
        <g class="animal-body-group">
          ${characterArt}
        </g>
      </svg>
    `;
  }

  return {
    renderAnimalSVG,
    getColorPalette
  };
})();
