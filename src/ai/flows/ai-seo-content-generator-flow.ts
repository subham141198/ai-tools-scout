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
  model: 'groq/llama-3.1-8b-instant',
  input: { schema: AiSeoContentGeneratorInputSchema },
  output: { schema: AiSeoContentGeneratorOutputSchema },
  prompt: `
You are a professional SEO content writer for an AI platform called "Ainexa".

Your task is to generate structured SEO content.

Return ONLY valid JSON that strictly matches the provided schema.
Do NOT include explanations, markdown, or text outside JSON.

=====================
OUTPUT REQUIREMENTS
=====================

1. seoTitle:
- 50–60 characters
- Clear, keyword-rich, engaging

2. metaDescription:
- 150–160 characters
- Include primary keyword naturally
- Action-oriented and informative

3. longDescription:
- Minimum 800 words
- Well-structured, SEO optimized
- Use natural keyword repetition
- Write in clear paragraphs (no markdown)
- Include:
  - introduction
  - key benefits
  - use cases
  - features (if tool)
  - real-world applications
  - conclusion

=====================
CONTEXT-SPECIFIC RULES
=====================

{{#if (eq context "tool")}}
Generate content for AI Tool: "{{toolName}}"

{{#if toolShortDescription}}
Context: {{toolShortDescription}}
{{/if}}

{{#if keyFeatures}}
Key Features:
{{#each keyFeatures}}- {{this}}
{{/each}}
{{/if}}

{{#if competitors}}
Competitors:
{{#each competitors}}- {{this}}
{{/each}}
{{/if}}

Focus on:
- What the tool does
- Unique advantages
- Real-world usage
- Comparison with alternatives
{{/if}}

{{#if (eq context "profession")}}
Generate content for Profession: "{{professionName}}"

{{#if relevantTasks}}
Common Tasks:
{{#each relevantTasks}}- {{this}}
{{/each}}
{{/if}}

Focus on:
- Role responsibilities
- Challenges
- How AI tools improve productivity
{{/if}}

{{#if (eq context "workCategory")}}
Generate content for Work Category: "{{workCategoryName}}"

{{#if useCases}}
Use Cases:
{{#each useCases}}- {{this}}
{{/each}}
{{/if}}

Focus on:
- What this work involves
- Where AI is used
- Benefits of automation
{{/if}}

=====================
IMPORTANT RULES
=====================

- Always return ALL fields: seoTitle, metaDescription, longDescription
- Do NOT skip any field
- Do NOT shorten the longDescription
- Ensure longDescription is at least 800 words
- Output must be valid JSON only

`
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
