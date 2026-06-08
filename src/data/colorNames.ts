export interface NamedColor {
  name: string;
  hex: string;
  category: 'Red' | 'Pink' | 'Orange' | 'Yellow' | 'Purple' | 'Green' | 'Blue' | 'Brown' | 'Gray' | 'White';
  rgb: string;
}

interface BasicBaseColor {
  name: string;
  hex: string;
  category: 'Red' | 'Pink' | 'Orange' | 'Yellow' | 'Purple' | 'Green' | 'Blue' | 'Brown' | 'Gray' | 'White';
}

const BASE_COLORS: BasicBaseColor[] = [
  // REDS (10 base)
  { name: "Crimson", hex: "#DC143C", category: "Red" },
  { name: "Scarlet", hex: "#FF2400", category: "Red" },
  { name: "Ruby", hex: "#E0115F", category: "Red" },
  { name: "FireBrick", hex: "#B22222", category: "Red" },
  { name: "IndianRed", hex: "#CD5C5C", category: "Red" },
  { name: "Cinnabar", hex: "#E34234", category: "Red" },
  { name: "Vermilion", hex: "#E34234", category: "Red" },
  { name: "Burgundy", hex: "#800020", category: "Red" },
  { name: "Terracotta", hex: "#E2725B", category: "Red" },
  { name: "Cardinal", hex: "#C41E3A", category: "Red" },

  // PINKS (10 base)
  { name: "HotPink", hex: "#FF69B4", category: "Pink" },
  { name: "DeepPink", hex: "#FF1493", category: "Pink" },
  { name: "OrchidPink", hex: "#F2BDCD", category: "Pink" },
  { name: "Flamingo", hex: "#FC8EAC", category: "Pink" },
  { name: "Bubblegum", hex: "#FFC1CC", category: "Pink" },
  { name: "Rose", hex: "#FF007F", category: "Pink" },
  { name: "Blush", hex: "#DE5D83", category: "Pink" },
  { name: "Cerise", hex: "#DE3163", category: "Pink" },
  { name: "Watermelon", hex: "#FC6C85", category: "Pink" },
  { name: "Crepe", hex: "#F2B8C6", category: "Pink" },

  // ORANGES (10 base)
  { name: "Tangerine", hex: "#F28500", category: "Orange" },
  { name: "Pumpkin", hex: "#FF7518", category: "Orange" },
  { name: "Amber", hex: "#FFBF00", category: "Orange" },
  { name: "Coral", hex: "#FF7F50", category: "Orange" },
  { name: "Apricot", hex: "#FBCEB1", category: "Orange" },
  { name: "Ginger", hex: "#B06500", category: "Orange" },
  { name: "Persimmon", hex: "#EC5800", category: "Orange" },
  { name: "Clay", hex: "#C46210", category: "Orange" },
  { name: "Marigold", hex: "#EAA221", category: "Orange" },
  { name: "Saffron", hex: "#F4C430", category: "Orange" },

  // YELLOWS (10 base)
  { name: "Lemon", hex: "#FFF700", category: "Yellow" },
  { name: "Daffodil", hex: "#FFFF31", category: "Yellow" },
  { name: "Canary", hex: "#FFFF9F", category: "Yellow" },
  { name: "Goldenrod", hex: "#DAA520", category: "Yellow" },
  { name: "Cream", hex: "#FFFDD0", category: "Yellow" },
  { name: "Mustard", hex: "#FFDB58", category: "Yellow" },
  { name: "Flax", hex: "#EEDC82", category: "Yellow" },
  { name: "Buttercup", hex: "#F4C430", category: "Yellow" },
  { name: "Sand", hex: "#C2B280", category: "Yellow" },
  { name: "Banana", hex: "#FFE135", category: "Yellow" },

  // PURPLES (10 base)
  { name: "Lavender", hex: "#E6E6FA", category: "Purple" },
  { name: "Thistle", hex: "#D8BFD8", category: "Purple" },
  { name: "Plum", hex: "#DDA0DD", category: "Purple" },
  { name: "Amethyst", hex: "#9966CC", category: "Purple" },
  { name: "Grape", hex: "#6F2DA8", category: "Purple" },
  { name: "Wisteria", hex: "#C9A0DC", category: "Purple" },
  { name: "Indigo", hex: "#4B0082", category: "Purple" },
  { name: "Mulberry", hex: "#C54B8C", category: "Purple" },
  { name: "Orchid", hex: "#DA70D6", category: "Purple" },
  { name: "Eggplant", hex: "#614051", category: "Purple" },

  // GREENS (10 base)
  { name: "Emerald", hex: "#50C878", category: "Green" },
  { name: "Jade", hex: "#00A86B", category: "Green" },
  { name: "Forest", hex: "#228B22", category: "Green" },
  { name: "Sage", hex: "#BCB88A", category: "Green" },
  { name: "Olive", hex: "#808000", category: "Green" },
  { name: "Mint", hex: "#98FF98", category: "Green" },
  { name: "Pine", hex: "#01796F", category: "Green" },
  { name: "Seafoam", hex: "#9FE2BF", category: "Green" },
  { name: "Clover", hex: "#009E60", category: "Green" },
  { name: "Basil", hex: "#879F84", category: "Green" },

  // BLUES (10 base)
  { name: "Cyan", hex: "#00FFFF", category: "Blue" },
  { name: "Azure", hex: "#007FFF", category: "Blue" },
  { name: "Cobalt", hex: "#0047AB", category: "Blue" },
  { name: "Teal", hex: "#008080", category: "Blue" },
  { name: "Turquoise", hex: "#40E0D0", category: "Blue" },
  { name: "Navy", hex: "#000080", category: "Blue" },
  { name: "Sapphire", hex: "#0F52BA", category: "Blue" },
  { name: "Cerulean", hex: "#007BA7", category: "Blue" },
  { name: "Lapis", hex: "#26619C", category: "Blue" },
  { name: "Denim", hex: "#1560BD", category: "Blue" },

  // BROWNS (10 base)
  { name: "Chocolate", hex: "#D2691E", category: "Brown" },
  { name: "Caramel", hex: "#FFD59A", category: "Brown" },
  { name: "Walnut", hex: "#773F1A", category: "Brown" },
  { name: "Chestnut", hex: "#954535", category: "Brown" },
  { name: "Sienna", hex: "#A0522D", category: "Brown" },
  { name: "Espresso", hex: "#4E3629", category: "Brown" },
  { name: "Mahogany", hex: "#C04000", category: "Brown" },
  { name: "Bronze", hex: "#CD7F32", category: "Brown" },
  { name: "Mocha", hex: "#765C48", category: "Brown" },
  { name: "Sepia", hex: "#704214", category: "Brown" },

  // GRAYS (10 base)
  { name: "Silver", hex: "#C0C0C0", category: "Gray" },
  { name: "Charcoal", hex: "#36454F", category: "Gray" },
  { name: "Slate", hex: "#708090", category: "Gray" },
  { name: "Platinum", hex: "#E5E4E2", category: "Gray" },
  { name: "Steel", hex: "#4682B4", category: "Gray" },
  { name: "Smoke", hex: "#738678", category: "Gray" },
  { name: "Ash", hex: "#B2BEB5", category: "Gray" },
  { name: "Granite", hex: "#818589", category: "Gray" },
  { name: "Pewter", hex: "#96A8A8", category: "Gray" },
  { name: "Pebble", hex: "#CCCCCC", category: "Gray" },

  // WHITES (10 base)
  { name: "Snow", hex: "#FFFAFA", category: "White" },
  { name: "Ivory", hex: "#FFFFF0", category: "White" },
  { name: "Linen", hex: "#FAF0E6", category: "White" },
  { name: "Pearl", hex: "#F0EAD6", category: "White" },
  { name: "Alabaster", hex: "#F2F0EA", category: "White" },
  { name: "Porcelain", hex: "#FFFCF4", category: "White" },
  { name: "Chiffon", hex: "#FBFAF5", category: "White" },
  { name: "GhostWhite", hex: "#F8F8FF", category: "White" },
  { name: "AliceBlue", hex: "#F0F8FF", category: "White" },
  { name: "Parchment", hex: "#FCF5E3", category: "White" }
];

// Hex parsing utilities
function hexToRgb(hex: string) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Named variation generator config
interface VariationModifier {
  suffix: string;
  rMod: number;
  gMod: number;
  bMod: number;
  lOffset?: number; // raw adder
}

const MODIFIERS: VariationModifier[] = [
  { suffix: "", rMod: 1.0, gMod: 1.0, bMod: 1.0 }, // Original base
  { suffix: "Deep", rMod: 0.65, gMod: 0.65, bMod: 0.65 },
  { suffix: "Light", rMod: 1.4, gMod: 1.4, bMod: 1.4, lOffset: 12 },
  { suffix: "Glow", rMod: 1.3, gMod: 1.3, bMod: 1.1, lOffset: 25 },
  { suffix: "Shadow", rMod: 0.35, gMod: 0.35, bMod: 0.35 },
  { suffix: "Cyber", rMod: 1.25, gMod: 1.0, bMod: 1.5 },
  { suffix: "Retro", rMod: 0.85, gMod: 0.8, bMod: 0.7 },
  { suffix: "Mist", rMod: 1.15, gMod: 1.2, bMod: 1.2, lOffset: 30 },
  { suffix: "Frost", rMod: 0.9, gMod: 1.2, bMod: 1.35 }
];

// Let's generate the comprehensive list of 900 designer colors
const generatedColors: NamedColor[] = [];

BASE_COLORS.forEach((base) => {
  const baseRgb = hexToRgb(base.hex);

  MODIFIERS.forEach((mod) => {
    // Generate distinct name
    const finalName = mod.suffix === "" ? base.name : `${base.name} ${mod.suffix}`;
    
    // Apply RGB scalar and offset modifications
    const offset = mod.lOffset || 0;
    const r = baseRgb.r * mod.rMod + offset;
    const g = baseRgb.g * mod.gMod + offset;
    const b = baseRgb.b * mod.bMod + offset;

    const finalHex = rgbToHex(r, g, b);
    const finalRgb = hexToRgb(finalHex);
    const rgbString = `${finalRgb.r}, ${finalRgb.g}, ${finalRgb.b}`;

    generatedColors.push({
      name: finalName,
      hex: finalHex,
      category: base.category,
      rgb: rgbString
    });
  });
});

export const DATA_NAMED_COLORS = generatedColors;
