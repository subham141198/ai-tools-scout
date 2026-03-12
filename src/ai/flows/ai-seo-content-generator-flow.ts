'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating SEO-optimized content
 * using Groq/Llama 3 for maximum speed and quota efficiency.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BaseInputSchema = z.object({
  context: z.enum(['tool', 'profession', 'workCategory']).describe('The context for content generation.'),
});

const ToolInputSchema = BaseInputSchema.extend({
  context: z.literal('tool'),
  toolName: z.string().describe('The name of the AI tool.'),
  toolWebsiteUrl: z.string().optional().describe('The website URL of the AI tool.'),
  toolShortDescription: z.string().optional().describe('A brief existing description of the AI tool.'),
  professionCategories: z.array(z.string()).optional().describe('Professions this tool is relevant for.'),
  workCategories: z.array(z.string()).optional().describe('Work types this tool is relevant for.'),
  keyFeatures: z.array(z.string()).optional().describe('Key features of the AI tool.'),
  competitors: z.array(z.string()).optional().describe('Names of similar or competing tools.'),
  targetAudience: z.array(z.string()).optional().describe('Specific types of users who would benefit most from this tool.'),
});

const ProfessionInputSchema = BaseInputSchema.extend({
  context: z.literal('profession'),
  professionName: z.string().describe('The name of the profession.'),
  professionShortDescription: z.string().optional().describe('A brief existing description of the profession.'),
  exampleTools: z.array(z.string()).optional().describe('Names of AI tools relevant to this profession.'),
  relevantTasks: z.array(z.string()).optional().describe('Common tasks or challenges in this profession that AI can help with.'),
});

const WorkCategoryInputSchema = BaseInputSchema.extend({
  context: z.literal('workCategory'),
  workCategoryName: z.string().describe('The name of the work category.'),
  workCategoryShortDescription: z.string().optional().describe('A brief existing description of the work category.'),
  exampleTools: z.array(z.string()).optional().describe('Names of AI tools relevant to this work category.'),
  useCases: z.array(z.string()).optional().describe('Common use cases or applications within this work category.'),
});

const AiSeoContentGeneratorInputSchema = z.discriminatedUnion('context', [
  ToolInputSchema,
  ProfessionInputSchema,
  WorkCategoryInputSchema,
]);

export type AiSeoContentGeneratorInput = z.infer<typeof AiSeoContentGeneratorInputSchema>;

const AiSeoContentGeneratorOutputSchema = z.object({
  seoTitle: z.string().describe('An SEO-optimized title for the page, typically 50-60 characters.'),
  metaDescription: z.string().describe('An SEO-optimized meta description for the page, typically 150-160 characters.'),
  longDescription: z.string().describe('A detailed, SEO-optimized description of at least 800 words.'),
});
export type AiSeoContentGeneratorOutput = z.infer<typeof AiSeoContentGeneratorOutputSchema>;

export async function aiSeoContentGenerator(input: AiSeoContentGeneratorInput): Promise<AiSeoContentGeneratorOutput> {
  return aiSeoContentGeneratorFlow(input);
}

const aiSeoContentGeneratorPrompt = ai.definePrompt({
  name: 'aiSeoContentGeneratorPrompt',
  input: { schema: AiSeoContentGeneratorInputSchema },
  output: { schema: AiSeoContentGeneratorOutputSchema },
  config: {
    model: 'groq/llama-3.3-70b-versatile',
  },
  prompt: `You are an expert SEO content writer. Generate high-quality SEO content for an AI platform.

Your task is to generate:
1. An SEO-optimized Title (50-60 characters).
2. An SEO-optimized Meta Description (150-160 characters).
3. A Long Description of at least 800 words.

{{#if toolName}}
Generate content for AI Tool: {{{toolName}}}
{{#if toolShortDescription}}Overview: {{{toolShortDescription}}}{{/if}}
{{/if}}

{{#if professionName}}
Generate content for Profession: {{{professionName}}}
{{/if}}

{{#if workCategoryName}}
Generate content for Work Category: {{{workCategoryName}}}
{{/if}}

Ensure the long description is highly detailed and informative.
`,
});

const aiSeoContentGeneratorFlow = ai.defineFlow(
  {
    name: 'aiSeoContentGeneratorFlow',
    inputSchema: AiSeoContentGeneratorInputSchema,
    outputSchema: AiSeoContentGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await aiSeoContentGeneratorPrompt(input);
    return output!;
  }
);
