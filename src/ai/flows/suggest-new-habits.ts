// 'use server'
'use server';

/**
 * @fileOverview AI agent that suggests new habits based on existing habits and goals.
 *
 * - suggestNewHabits - A function that suggests new habits.
 * - SuggestNewHabitsInput - The input type for the suggestNewHabits function.
 * - SuggestNewHabitsOutput - The return type for the suggestNewHabits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNewHabitsInputSchema = z.object({
  existingHabits: z
    .array(z.string())
    .describe('A list of the user\'s existing habits.'),
  goals: z.string().describe('The user\'s goals and objectives.'),
});
export type SuggestNewHabitsInput = z.infer<typeof SuggestNewHabitsInputSchema>;

const SuggestNewHabitsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of suggested new habits related to the user\'s existing habits and goals.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI\'s reasoning for suggesting these habits, explaining how they align with the user\'s existing habits and goals.'
    ),
});
export type SuggestNewHabitsOutput = z.infer<typeof SuggestNewHabitsOutputSchema>;

export async function suggestNewHabits(
  input: SuggestNewHabitsInput
): Promise<SuggestNewHabitsOutput> {
  return suggestNewHabitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNewHabitsPrompt',
  input: {schema: SuggestNewHabitsInputSchema},
  output: {schema: SuggestNewHabitsOutputSchema},
  prompt: `You are a habit suggestion expert. Consider a user's existing habits and goals to suggest new habits that would be relevant and helpful. The suggestion should align the new habits with their existing habits and goals.

Existing Habits:
{{#each existingHabits}}- {{this}}\n{{/each}}

Goals: {{goals}}

Suggest some new habits and explain your reasoning.`,
});

const suggestNewHabitsFlow = ai.defineFlow(
  {
    name: 'suggestNewHabitsFlow',
    inputSchema: SuggestNewHabitsInputSchema,
    outputSchema: SuggestNewHabitsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
