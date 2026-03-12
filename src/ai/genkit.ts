import { genkit } from 'genkit';
import { groq } from 'genkitx-groq';

/**
 * Global Genkit instance configured exclusively with Groq.
 * Using Llama 3 models via Groq for high-speed, free-tier friendly intelligence.
 */
export const ai = genkit({
  plugins: [
    groq,
  ],
  model: 'groq/llama-3.1-8b-instant',
});
