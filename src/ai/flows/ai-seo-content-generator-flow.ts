'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating SEO-optimized content
 * (titles, meta descriptions, and long descriptions) for AI tools, professions,
 * and work categories.
 *
 * - aiSeoContentGenerator - A wrapper function to call the Genkit flow.
 * - AiSeoContentGeneratorInput - The input type for the content generation.
 * - AiSeoContentGeneratorOutput - The output type for the generated content.
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
  longDescription: z.string().describe('A detailed, SEO-optimized description of at least 800 words, including relevant sections like features, benefits, use cases, pros, cons, etc., depending on the context.'),
});
export type AiSeoContentGeneratorOutput = z.infer<typeof AiSeoContentGeneratorOutputSchema>;

export async function aiSeoContentGenerator(input: AiSeoContentGeneratorInput): Promise<AiSeoContentGeneratorOutput> {
  return aiSeoContentGeneratorFlow(input);
}

const aiSeoContentGeneratorPrompt = ai.definePrompt({
  name: 'aiSeoContentGeneratorPrompt',
  input: { schema: AiSeoContentGeneratorInputSchema },
  output: { schema: AiSeoContentGeneratorOutputSchema },
  prompt: `You are an expert SEO content writer and marketing specialist for an AI tools discovery and comparison platform. Your goal is to generate highly optimized, engaging, and comprehensive content to improve search engine visibility and attract organic traffic.

Your task is to generate:
1. An SEO-optimized Title (50-60 characters, max 60).
2. An SEO-optimized Meta Description (150-160 characters, max 160).
3. A Long Description of at least 800 words.

Ensure all generated content is unique, highly relevant, avoids keyword stuffing, and naturally incorporates important keywords and phrases. Focus on providing value to the user and clearly explaining the topic.

---
{{#if toolName}}
Generate content for an AI Tool page. Use a formal yet engaging tone.

AI Tool Name: {{{toolName}}}
{{#if toolWebsiteUrl}}Website: {{{toolWebsiteUrl}}}{{/if}}
{{#if toolShortDescription}}Brief Overview: {{{toolShortDescription}}}{{/if}}
{{#if professionCategories}}Relevant Professions: {{#each professionCategories}}
- {{{this}}}
{{/each}}{{/if}}
{{#if workCategories}}Relevant Work Types: {{#each workCategories}}
- {{{this}}}
{{/each}}{{/if}}
{{#if keyFeatures}}Key Features (list of up to 5 main features):
{{#each keyFeatures}}
- {{{this}}}
{{/each}}{{/if}}
{{#if competitors}}Consider these as similar or competing tools: {{#each competitors}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if targetAudience}}Target Audience: {{#each targetAudience}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

For the long description (minimum 800 words), ensure it includes the following sections and addresses these points comprehensively:

1.  **What is {{toolName}}?** (Detailed explanation of its core function, technology, and what problems it solves).
2.  **Who Should Use {{toolName}}?** (Elaborate on the target audience and their specific needs/pain points that this tool addresses).
3.  **Key Features & Functionality** (Expand on each key feature, explaining how it works and its benefit).
4.  **Benefits of Using {{toolName}}** (Highlight the advantages, efficiencies, and outcomes users can expect).
5.  **Pros and Cons** (Provide a balanced view, mentioning strengths and potential limitations).
6.  **Use Cases** (Illustrate real-world examples and scenarios where {{toolName}} shines).
7.  **How Does {{toolName}} Compare to Alternatives?** (Briefly discuss its positioning relative to competitors mentioned, if any).
8.  **Pricing Model** (General information about typical AI tool pricing, if applicable, or encourage visiting the site).
9.  **Getting Started with {{toolName}}** (Basic steps for new users).
10. **The Future of AI in [Relevant Category/Profession]** (Connect the tool to broader industry trends).
{{/if}}

{{#if professionName}}
Generate content for an AI Tools Profession Category page. Use an informative and forward-looking tone.

Profession Name: {{{professionName}}}
{{#if professionShortDescription}}Brief Overview of the Profession: {{{professionShortDescription}}}{{/if}}
{{#if exampleTools}}Example AI Tools for this profession: {{#each exampleTools}}
- {{{this}}}
{{/each}}{{/if}}
{{#if relevantTasks}}Common Tasks/Challenges in this profession that AI can assist with: {{#each relevantTasks}}
- {{{this}}}
{{/each}}{{/if}}

For the long description (minimum 800 words), ensure it includes the following sections and addresses these points comprehensively:

1.  **The Role of AI in {{professionName}}** (Introduction to how AI is impacting this field).
2.  **Transforming Daily Tasks** (Detailed examples of how AI automates, enhances, or streamlines specific responsibilities).
3.  **Key AI Tools for {{professionName}}** (Discuss categories of AI tools and provide brief descriptions of the example tools provided, if any).
4.  **Benefits for {{professionName}} Professionals** (Elaborate on improved efficiency, accuracy, decision-making, and client outcomes).
5.  **Challenges & Considerations** (Address ethical concerns, job displacement myths, and the need for new skills).
6.  **Real-World Impact & Case Studies** (Hypothetical or general examples of AI success stories).
7.  **Future Trends & Outlook** (What does the future hold for {{professionName}} with AI?)
8.  **Becoming AI-Proficient in {{professionName}}** (Advice on adapting and leveraging AI).
{{/if}}

{{#if workCategoryName}}
Generate content for an AI Tools Work Category page. Use an analytical and practical tone.

Work Category Name: {{{workCategoryName}}}
{{#if workCategoryShortDescription}}Brief Overview of this Work Category: {{{workCategoryShortDescription}}}{{/if}}
{{#if exampleTools}}Example AI Tools in this category: {{#each exampleTools}}
- {{{this}}}
{{/each}}{{/if}}
{{#if useCases}}Key Use Cases/Applications within this work category: {{#each useCases}}
- {{{this}}}
{{/each}}{{/if}}

For the long description (minimum 800 words), ensure it includes the following sections and addresses these points comprehensively:

1.  **Understanding AI in {{workCategoryName}}** (Define the work category and introduce how AI applies).
2.  **Types of AI Tools for {{workCategoryName}}** (Categorize and describe various AI applications relevant to this work).
3.  **Specific Use Cases & Applications** (Detailed examples of how AI tools are used for tasks within this category, expanding on provided use cases).
4.  **Advantages of AI Integration** (Discuss benefits like automation, enhanced precision, data-driven insights, and scalability).
5.  **Challenges and Best Practices** (Address potential difficulties, ethical considerations, and tips for successful AI adoption).
6.  **Spotlight on Example Tools** (Briefly describe how the example tools provided fit into this category).
7.  **The Evolution of {{workCategoryName}} with AI** (Future prospects and emerging trends).
8.  **Choosing the Right AI Tools** (Guidance on evaluating and selecting AI solutions).
{{/if}}

Your output must be a JSON object matching the following schema. Do not include any other text outside the JSON.
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
