/**
 * Utility functions for flatpalette color operations and configurations
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function hexToRgbString(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'rgb(0, 0, 0)';
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };
  let { r, g, b } = rgb;
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hexToHslString(hex: string): string {
  const hsl = hexToHsl(hex);
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/**
 * Returns whether dark text (black) or light text (white) should be used on a background color hex
 */
export function getContrastColor(hex: string): '#000000' | '#ffffff' {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  // Standard YIQ formula for contrast luminance score
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
}

/**
 * Convert HSL elements back to Hex string
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Generates 5 harmonious colors based on a seed hex and harmony type
 */
export function generateHarmony(seedHex: string, type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'split-complementary'): string[] {
  const { h, s, l } = hexToHsl(seedHex);
  const colors: string[] = [];

  switch (type) {
    case 'monochromatic':
      // Adjust lightness
      colors.push(hslToHex(h, s, Math.max(10, l - 30)));
      colors.push(hslToHex(h, s, Math.max(15, l - 15)));
      colors.push(seedHex);
      colors.push(hslToHex(h, s, Math.min(95, l + 15)));
      colors.push(hslToHex(h, s, Math.min(98, l + 30)));
      break;

    case 'analogous':
      // Shift hue
      colors.push(hslToHex((h + 300) % 360, s, l));
      colors.push(hslToHex((h + 330) % 360, s, l));
      colors.push(seedHex);
      colors.push(hslToHex((h + 30) % 360, s, l));
      colors.push(hslToHex((h + 60) % 360, s, l));
      break;

    case 'complementary':
      // Direct opposite + split lightness
      const oppositeH = (h + 180) % 360;
      colors.push(hslToHex(h, s, Math.max(20, l - 20)));
      colors.push(seedHex);
      colors.push(hslToHex(h, s, Math.min(90, l + 20)));
      colors.push(hslToHex(oppositeH, s, l));
      colors.push(hslToHex(oppositeH, s, Math.min(90, l + 20)));
      break;

    case 'triadic':
      // Hue splits of 120deg
      const triH1 = (h + 120) % 360;
      const triH2 = (h + 240) % 360;
      colors.push(hslToHex(h, s, Math.max(20, l - 15)));
      colors.push(seedHex);
      colors.push(hslToHex(triH1, s, l));
      colors.push(hslToHex(triH2, s, l));
      colors.push(hslToHex(triH2, s, Math.min(90, l + 20)));
      break;

    case 'split-complementary':
      // Hue splits of 150deg and 210deg
      const splitH1 = (h + 150) % 360;
      const splitH2 = (h + 210) % 360;
      colors.push(hslToHex(h, s, Math.max(20, l - 15)));
      colors.push(seedHex);
      colors.push(hslToHex(splitH1, s, l));
      colors.push(hslToHex(splitH2, s, l));
      colors.push(hslToHex(splitH2, s, Math.min(90, l + 15)));
      break;

    default:
      colors.push(seedHex);
      colors.push(hslToHex((h + 45) % 360, s, l));
      colors.push(hslToHex((h + 90) % 360, s, l));
      colors.push(hslToHex((h + 135) % 360, s, l));
      colors.push(hslToHex((h + 180) % 360, s, l));
  }

  // Ensure they are precisely unique and format-aligned hex cords
  return colors.map(c => c.toLowerCase());
}

/**
 * Returns Tailwind CSS configuration file code string
 */
export function buildTailwindConfig(title: string, colors: string[]): string {
  const safeName = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        '${safeName}': {
          base: '${colors[0]}',
          shimmer: '${colors[1]}',
          accent: '${colors[2]}',
          highlight: '${colors[3]}',
          glow: '${colors[4]}',
        },
      },
    },
  },
};`;
}

/**
 * Returns CSS Variables code string
 */
export function buildCssVariables(title: string, colors: string[]): string {
  const prefix = `--td-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  return `:root {
  ${prefix}-bg: ${colors[0]};
  ${prefix}-shadow: ${colors[1]};
  ${prefix}-primary: ${colors[2]};
  ${prefix}-secondary: ${colors[3]};
  ${prefix}-highlight: ${colors[4]};
}`;
}

/**
 * Returns JSON code string
 */
export function buildJsonCode(title: string, colors: string[]): string {
  const data = {
    paletteName: title,
    colors: {
      color1: colors[0],
      color2: colors[1],
      color3: colors[2],
      color4: colors[3],
      color5: colors[4]
    },
    rgb: colors.map(hex => hexToRgbString(hex)),
    hsl: colors.map(hex => hexToHslString(hex))
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Generates a random Hex color code
 */
export function generateRandomHex(): string {
  const letters = '0123456789abcdef';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
