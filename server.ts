import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const ADJECTIVES_MAP: Record<string, string[]> = {
  vibrant: ["Radiant", "Spectrum", "Kinetica", "Dazzling", "Prismatic", "Vivid", "Luminous", "Dynamic"],
  cyberpunk: ["Holo", "Neon", "Synth", "Glitch", "Protocol", "Vector", "Grid", "Cyber", "Overdrive"],
  neon: ["Fluorescent", "Laser", "Static", "Glow", "Photon", "Beam", "Pulse", "Electric"],
  dark: ["Eclipse", "Obsidian", "Abyssal", "Sombre", "Phantom", "Sable", "Nocturnal", "Cosmic", "Lunar", "Stellar"],
  retro: ["Classic", "Analog", "Sunset", "Vapor", "Groovy", "Decade", "Epoch", "Relic", "Vintage"],
  pastel: ["Ethereal", "Whisper", "Velvet", "Satin", "Mellow", "Fluffy", "Feather", "Glimmer", "Cloudy"],
  minimal: ["Pure", "Stark", "Zen", "Sleek", "Subtle", "Quiet", "Airy", "Nordic", "Blank"],
  nature: ["Verdant", "Earthly", "Oceanic", "Mossy", "Floral", "Forest", "Pristine", "Solstice"],
  vintage: ["Rustic", "Sepia", "Cobalt", "Sienna", "Classic", "Heritage", "Antique", "Aged"],
  muted: ["Hazy", "Dusty", "Pebble", "Subdued", "Slate", "Shadowy", "Faded", "Ashen"],
  warm: ["Amber", "Cinder", "Solar", "Toasty", "Tuscan", "Autumnal", "Crimson", "Fiery"],
  modern: ["Urban", "Metro", "Sleek", "Minimalist", "Structure", "Aura", "Abstract", "Linear"],
  luxury: ["Gilded", "Royal", "Onyx", "Sovereign", "Ivory", "Premium", "Plush", "Empire", "Crown"]
};

const NOUNS_MAP: Record<string, string[]> = {
  vibrant: ["Pulse", "Flame", "Splash", "Burst", "Energy", "Blaze", "Carnival", "Rhythm"],
  cyberpunk: ["Net", "Matrix", "Oasis", "Terminal", "Chrome", "Signal", "Nexus", "Circuit"],
  neon: ["Core", "Beacon", "Discharge", "Flash", "Aura", "Spark", "Illumination"],
  dark: ["Void", "Shadow", "Nightfall", "Epitaph", "Nox", "Spectre", "Abyss", "Mystery"],
  retro: ["Vibe", "Cassette", "Vinyl", "Arcade", "Pixel", "Heritage", "Memory", "Loom"],
  pastel: ["Dream", "Mist", "Petal", "Breeze", "Sera", "Halo", "Cotton", "Chiffon"],
  minimal: ["Form", "Essence", "Space", "Concept", "Origin", "Stasis", "Canvas", "Focus"],
  nature: ["Tide", "Meadow", "Wild", "Bower", "Haven", "Canopy", "River", "Cove"],
  vintage: ["Patina", "Document", "Chronicle", "Keepsake", "Echo", "Reminiscence"],
  muted: ["Haze", "Dusk", "Silence", "Drift", "Fog", "Vapour", "Gravel"],
  warm: ["Embers", "Sunset", "Hearth", "Glow", "Solace", "Toast", "Bake"],
  modern: ["Facade", "Grid", "Concept", "Studio", "Gallery", "Curve", "Axis"],
  luxury: ["Velvet", "Onyx", "Jade", "Satin", "Prestige", "Majesty", "Gem", "Marble"]
};

function generateFallbackTitle(colors: string[], tags: string[]): string {
  const normalizedTags = (tags || []).map(t => t.toLowerCase());

  // Adjectives pool
  const fallbackAdjectives = ["Ethereal", "Sonic", "Spectral", "Cosmic", "Velvet", "Prismatic", "Sleek", "Sublime", "Nordic", "Solar", "Twilight", "Radiant"];
  // Nouns pool
  const fallbackNouns = ["Oasis", "Aura", "Dream", "Horizon", "Pulse", "Echo", "Breeze", "Dusk", "Glow", "Nexus", "Zenith", "Abstract"];

  const adjsList: string[] = [];
  const nounsList: string[] = [];

  normalizedTags.forEach(tag => {
    if (ADJECTIVES_MAP[tag]) adjsList.push(...ADJECTIVES_MAP[tag]);
    if (NOUNS_MAP[tag]) nounsList.push(...NOUNS_MAP[tag]);
  });

  // Check color character if we don't have tags matching the lists
  if (adjsList.length === 0) {
    let darkCount = 0;
    let warmCount = 0;
    colors.forEach(hex => {
      const cleanHex = hex.replace("#", "");
      if (cleanHex.length === 6) {
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness < 80) darkCount++;
        if (r > g * 1.2 && r > b * 1.2) warmCount++;
      }
    });

    if (darkCount >= 3) {
      adjsList.push(...ADJECTIVES_MAP["dark"]);
      nounsList.push(...NOUNS_MAP["dark"]);
    } else if (warmCount >= 2) {
      adjsList.push(...ADJECTIVES_MAP["warm"]);
      nounsList.push(...NOUNS_MAP["warm"]);
    } else {
      adjsList.push(...fallbackAdjectives);
      nounsList.push(...fallbackNouns);
    }
  }

  const uniqueAdjs = Array.from(new Set(adjsList));
  const uniqueNouns = Array.from(new Set(nounsList));

  // Deterministically hash based on colors to give the palette a unique but consistent fallback name
  const hashString = colors.join("");
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    hash = hashString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const adjIndex = Math.abs(hash) % (uniqueAdjs.length || fallbackAdjectives.length);
  const nounIndex = Math.abs(hash >> 3) % (uniqueNouns.length || fallbackNouns.length);

  const adjSelected = uniqueAdjs.length > 0 ? uniqueAdjs[adjIndex] : fallbackAdjectives[adjIndex % fallbackAdjectives.length];
  const nounSelected = uniqueNouns.length > 0 ? uniqueNouns[nounIndex] : fallbackNouns[nounIndex % fallbackNouns.length];

  return `${adjSelected} ${nounSelected}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini title generation (secure server-side invocation)
  app.post("/api/gemini/suggest-title", async (req, res) => {
    try {
      const { colors, tags } = req.body;
      if (!colors || !Array.isArray(colors) || colors.length === 0) {
        return res.status(400).json({ error: "Colors are required to suggest a palette title." });
      }

      const prompt = `You are an elite graphic designer, brand strategist, and master of color theory.
Analyze this 5-color palette and its design style tags to suggest a single, highly creative, evocative, and elite title (2-4 words maximum). It should sound sophisticated, poetic, or futuristic (like "Golden Hour", "Cyberpunk Oasis", "Ethereal Mist", "Velvet Storm").

Palette Colors: ${colors.join(", ")}
Theme Style Tags: ${tags && tags.length > 0 ? tags.join(", ") : "Modern, Sleek"}

Respond with ONLY the suggested title name itself. DO NOT wrap it in quotes, DO NOT add punctuation, and DO NOT add any markdown, comments, or explanations. Just the plain-text title.`;

      // Try Preferred Models sequentially to bypass high demand 503 limits
      const preferredModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let title: string | null = null;
      let modelUsed = "";

      for (const model of preferredModels) {
        let attempts = 2;
        let delay = 600;
        while (attempts > 0 && !title) {
          try {
            console.log(`[AI Title Suggest] Trying model: ${model} (${attempts} attempts remaining)`);
            const response = await ai.models.generateContent({
              model: model,
              contents: prompt,
              config: {
                temperature: 0.85,
              }
            });

            if (response.text) {
              const parsed = response.text.trim().replace(/^["']|["']$/g, '');
              if (parsed && parsed.length > 1 && parsed.length < 50) {
                title = parsed;
                modelUsed = model;
                break;
              }
            }
          } catch (err: any) {
            console.warn(`[AI Title Suggest] Model ${model} returned error:`, err?.message || err);
            attempts--;
            if (attempts > 0) {
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // exponential backoff
            }
          }
        }
        if (title) break;
      }

      // If all Gemini endpoints fail, fall back seamlessly to our dynamic, beautifully styled programmatic word generator!
      if (!title) {
        console.warn(`[AI Title Suggest] All Gemini endpoints experiencing high demand (503) or offline. Shifting to elegant programmatic naming system.`);
        title = generateFallbackTitle(colors, tags);
        modelUsed = "Dynamic Fallback Engine";
      }

      res.json({ title, modelUsed });
    } catch (error: any) {
      console.error("Gemini Title Suggestion Error:", error);
      res.status(500).json({ error: error.message || "Failed to suggest title" });
    }
  });

  // Vite middleware for development or serving assets in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
