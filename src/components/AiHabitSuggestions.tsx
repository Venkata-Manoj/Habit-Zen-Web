'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Lightbulb, Sparkles } from 'lucide-react';
import { suggestNewHabits } from '@/ai/flows/suggest-new-habits';
import type { Habit } from '@/lib/types';
import type { SuggestNewHabitsOutput } from '@/ai/flows/suggest-new-habits';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  goals: z.string().min(10, {
    message: 'Please describe your goals in at least 10 characters.',
  }).max(500),
});

type AiHabitSuggestionsProps = {
  habits: Habit[];
};

export function AiHabitSuggestions({ habits }: AiHabitSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestNewHabitsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await suggestNewHabits({
        existingHabits: habits.map(h => h.title),
        goals: values.goals,
      });
      setSuggestions(result);
    } catch (error) {
      console.error(error);
      // Handle error, e.g., show toast
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Habit Suggestions
        </CardTitle>
        <CardDescription>Get AI-powered ideas for new habits based on your goals.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I want to improve my physical health and reduce stress."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Get Suggestions'}
            </Button>
          </form>
        </Form>
        
        {isLoading && (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}

        {suggestions && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-lg">Here are some ideas:</h4>
            <ul className="space-y-2 list-disc pl-5">
              {suggestions.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
            <blockquote className="mt-6 border-l-2 pl-6 italic text-muted-foreground">
              <p className="font-semibold mb-2">Reasoning:</p>
              {suggestions.reasoning}
            </blockquote>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
