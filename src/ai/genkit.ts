import { genkit } from 'genkit';
import { groq } from 'genkitx-groq';

/**
 * Global Genkit instance configured exclusively with Groq.
 * Using Llama 3 models via Groq for high-speed, free-tier friendly intelligence.
 * 
 * In Genkit 1.x, the groq plugin from genkitx-groq is registered as an object.
 */
export const ai = genkit({
  plugins: [
    groq,
  ],
  model: 'groq/llama-3.3-70b-versatile',
});
