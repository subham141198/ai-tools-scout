'use server';
/**
 * @fileOverview This file defines a Genkit flow for discovering trending AI tools.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TrendingToolSchema = z.object({
  id: z
    .string()
    .describe("Unique slug identifier for the AI tool"),

  name: z
    .string()
    .describe("Name of the AI tool"),

  tagline: z
    .string()
    .describe("Short catchy one-line tagline"),

  description: z
    .string()
    .describe("Short description of what the AI tool does"),

  websiteUrl: z
    .string()
    .url()
    .describe("Official website URL"),

  pricingModel: z
    .enum(["free", "freemium", "paid", "subscription", "enterprise"])
    .describe("Pricing model of the tool"),

  rating: z
    .number()
    .min(0)
    .max(5)
    .describe("Estimated user rating from 0 to 5"),

  logoUrl: z
    .string()
    .url()
    .describe("URL of the tool logo"),

  professionCategories: z
    .array(z.string())
    .min(1)
    .describe("Professions that benefit from this tool"),

  workCategories: z
    .array(z.string())
    .min(1)
    .describe("Work tasks this AI tool helps with")
});

const AiTrendingToolsOutputSchema = z.object({
  tools: z
    .array(TrendingToolSchema)
    .min(1)
    .max(10)
    .describe("List of trending AI tools currently popular"),

  marketSummary: z
    .string()
    .describe("Short summary of global AI tool trends")
});
export type AiTrendingToolsOutput = z.infer<typeof AiTrendingToolsOutputSchema>;

export async function aiTrendingTools(): Promise<AiTrendingToolsOutput> {
  return aiTrendingToolsFlow();
}

const aiTrendingToolsPrompt = ai.definePrompt({
  name: 'aiTrendingToolsPrompt',
  model: 'groq/llama-3.1-8b-instant',
  output: { schema: AiTrendingToolsOutputSchema },
  prompt: `
You are a world-class AI market researcher for "Ainexa".

Return ONLY valid JSON matching the provided schema.

Find exactly 6 trending AI tools currently popular worldwide.

Rules:
- Use real AI tools.
- Do not include explanations.
- Return valid JSON only.
- Ensure the "tools" array exists and contains exactly 6 items.

For each tool include:
- id (slug format like "chatgpt")
- name
- tagline
- description
- websiteUrl
- pricingModel (free | freemium | paid | subscription | enterprise)
- rating (0-5)
- logoUrl using: https://picsum.photos/seed/<slug>/400/400
- professionCategories
- workCategories

Also include:
"marketSummary" explaining current AI market trends.
`,
});

const aiTrendingToolsFlow = ai.defineFlow(
  {
    name: 'aiTrendingToolsFlow',
    inputSchema: z.void(),
    outputSchema: AiTrendingToolsOutputSchema,
  },
  async () => {
    const { output } = await aiTrendingToolsPrompt();
    console.log(output);
    if (!output || !output.tools || output.tools.length === 0) throw new Error('AI could not identify trending tools.');
    return output;
  }
);
