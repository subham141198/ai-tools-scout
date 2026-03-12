import { genkit } from 'genkit';
import  openAI  from '@genkit-ai/compat-oai';

export const ai = genkit({
  plugins: [
    openAI({
      name: 'groq', 
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    }),
  ],
});