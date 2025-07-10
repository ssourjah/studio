'use server';

/**
 * @fileOverview An AI agent for predicting task duration based on task details.
 *
 * - predictTaskDuration - A function that predicts the task duration.
 * - PredictTaskDurationInput - The input type for the predictTaskDuration function.
 * - PredictTaskDurationOutput - The return type for the predictTaskDuration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictTaskDurationInputSchema = z.object({
  taskType: z.string().describe('The type of the task (e.g., installation, re-installation, inspection, removal).'),
  description: z.string().describe('A detailed description of the task.'),
  location: z.string().describe('The location where the task needs to be performed.'),
  assignedTechnician: z.string().describe('The name or ID of the technician assigned to the task.'),
});
export type PredictTaskDurationInput = z.infer<typeof PredictTaskDurationInputSchema>;

const PredictTaskDurationOutputSchema = z.object({
  predictedDuration: z.string().describe('The predicted duration of the task in hours or days (e.g., "2 hours", "1.5 days").'),
  confidenceLevel: z.string().describe('A qualitative assessment of the confidence level in the prediction (e.g., "high", "medium", "low").'),
  reasoning: z.string().describe('The reasoning behind the predicted duration, considering the task details.'),
});
export type PredictTaskDurationOutput = z.infer<typeof PredictTaskDurationOutputSchema>;

export async function predictTaskDuration(input: PredictTaskDurationInput): Promise<PredictTaskDurationOutput> {
  return predictTaskDurationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictTaskDurationPrompt',
  input: {schema: PredictTaskDurationInputSchema},
  output: {schema: PredictTaskDurationOutputSchema},
  prompt: `You are an expert task duration estimator, skilled at predicting how long a task will take based on various factors.

  Given the following task details, provide a predicted duration, a confidence level, and the reasoning behind your estimate.

  Task Type: {{{taskType}}}
  Description: {{{description}}}
  Location: {{{location}}}
  Assigned Technician: {{{assignedTechnician}}}

  Consider factors such as task complexity, potential challenges at the location, and the technician's expertise.
  Format the predicted duration in a way that is easily understandable (e.g., "2 hours", "1.5 days").
  The confidence level should be one of "high", "medium", or "low".
`,
});

const predictTaskDurationFlow = ai.defineFlow(
  {
    name: 'predictTaskDurationFlow',
    inputSchema: PredictTaskDurationInputSchema,
    outputSchema: PredictTaskDurationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
