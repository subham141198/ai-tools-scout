'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating comprehensive
 * details for any AI tool.
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

  pricingModel: z.enum([
    "free",
    "freemium",
    "paid",
    "subscription",
    "enterprise"
  ]),

  rating: z.number().min(0).max(5),

  features: z.array(z.string()).min(3),

  pros: z.array(z.string()).min(1),

  cons: z.array(z.string()).min(1),

  professionCategories: z.array(z.string()).min(1),

  workCategories: z.array(z.string()).min(1),

  logoUrl: z.string().url()
});

export type AiToolDetailsOutput = z.infer<typeof AiToolDetailsOutputSchema>;

export async function aiToolDetails(input: { slug: string }): Promise<AiToolDetailsOutput> {
  return aiToolDetailsFlow(input);
}

const aiToolDetailsPrompt = ai.definePrompt({
  name: 'aiToolDetailsPrompt',
  model: 'groq/llama-3.1-8b-instant',
  input: { schema: AiToolDetailsInputSchema },
  output: { schema: AiToolDetailsOutputSchema },
  prompt: `
You are an expert AI technology researcher working for the platform "Ainexa".

Research the AI tool identified by the slug: "{{slug}}".

Return ONLY valid JSON that strictly matches the provided schema.
Do NOT include explanations, markdown, or extra text.

Rules:
- Use real and accurate information when possible.
- If the exact tool cannot be found, infer reasonable details based on the slug.
- Ensure all fields required by the schema are present.
- Arrays must contain at least one item.

Fields to generate:
- name: Full product name
- tagline: Short one-line slogan
- description: Detailed explanation of what the tool does
- websiteUrl: Official website URL
- pricingModel: One of "free", "freemium", "paid", "subscription", or "enterprise"
- rating: Estimated rating between 0 and 5
- features: At least 5 key product features
- pros: Honest advantages of the tool
- cons: Honest limitations or drawbacks
- professionCategories: Professions that benefit from the tool
- workCategories: Tasks or work types the tool helps with
- logoUrl: Use the placeholder URL format:
  https://picsum.photos/seed/{{slug}}/400/400

Return JSON only.
`
});

const aiToolDetailsFlow = ai.defineFlow(
  {
    name: 'aiToolDetailsFlow',
    inputSchema: AiToolDetailsInputSchema,
    outputSchema: AiToolDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await aiToolDetailsPrompt(input);
    console.log(output);
    if (!output || !output.name || !output.tagline || !output.description || !output.websiteUrl || !output.pricingModel || !output.rating || !output.features || !output.pros || !output.cons || !output.professionCategories || !output.workCategories || !output.logoUrl) throw new Error('AI could not generate tool details.');
    return output;
  }
);
