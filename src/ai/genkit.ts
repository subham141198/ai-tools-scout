import { genkit } from 'genkit';
import { groq } from 'genkitx-groq';

/**
 * Global Genkit instance configured with the Groq plugin.
 * We use Llama 3 models via Groq for high-speed performance.
 */
export const ai = genkit({
  plugins: [
    groq(),
  ],
});
