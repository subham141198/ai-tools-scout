import { genkit } from 'genkit';
import { groq } from 'genkitx-groq';

/**
 * Global Genkit instance configured exclusively with Groq.
 * Using Llama 3 models via Groq for high-speed, free-tier friendly intelligence.
 * The groq plugin is passed as a reference to resolve initialization errors.
 */
export const ai = genkit({
  plugins: [
    groq,
  ],
});
