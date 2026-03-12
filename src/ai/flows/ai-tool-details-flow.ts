
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating comprehensive 
 * details for any AI tool using Llama 3 via Groq.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiToolDetailsInputSchema = z.object({
  slug: z.string().describe('The slug or name of the AI tool to research.'),
});

const AiToolDetailsOutputSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  websiteUrl: z.string().url(),
  pricingModel: z.enum(['Free', 'Paid', 'Freemium', 'Open Source']),
  rating: z.number(),
  features: z.array(z.string()),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  professionCategories: z.array(z.string()),
  workCategories: z.array(z.string()),
  logoUrl: z.string(),
});

export type AiToolDetailsOutput = z.infer<typeof AiToolDetailsOutputSchema>;

export async function aiToolDetails(input: { slug: string }): Promise<AiToolDetailsOutput> {
  return aiToolDetailsFlow(input);
}

const aiToolDetailsPrompt = ai.definePrompt({
  name: 'aiToolDetailsPrompt',
  input: { schema: AiToolDetailsInputSchema },
  output: { schema: AiToolDetailsOutputSchema },
  config: {
    model: 'groq/llama-3.3-70b-versatile',
  },
  prompt: `You are an expert tech reviewer. Provide deep details about the AI tool: "{{slug}}"

Include:
1. The real name and tagline.
2. A comprehensive description.
3. The official website URL.
4. Specific key features (at least 5).
5. Honest pros and cons.
6. Target professions and work categories.
7. An estimated user rating (0-5).
8. A logo placeholder URL: 'https://picsum.photos/seed/{{slug}}/400/400'.

Format the response as a structured JSON object.`,
});

const aiToolDetailsFlow = ai.defineFlow(
  {
    name: 'aiToolDetailsFlow',
    inputSchema: AiToolDetailsInputSchema,
    outputSchema: AiToolDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await aiToolDetailsPrompt(input);
    if (!output) throw new Error('AI could not generate tool details.');
    return output;
  }
);
