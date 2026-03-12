import { genkit } from 'genkit';
import { groq } from 'genkitx-groq';

/**
 * Global Genkit instance configured exclusively with Groq.
 * Using Llama 3 models via Groq for high-speed, free-tier friendly intelligence.
 * 
 * NOTE: In Genkit 1.x, we pass the plugin function reference to the plugins array.
 */
export const ai = genkit({
  plugins: [
    groq,
  ],
  model: 'groq/llama-3.3-70b-versatile',
});
