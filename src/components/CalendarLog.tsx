'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import type { Habit, HabitCompletion } from '@/lib/types';
import { Badge } from './ui/badge';
import { CheckCircle2 } from 'lucide-react';

type CalendarLogProps = {
  completions: HabitCompletion[];
  habits: Habit[];
};

export function CalendarLog({ completions, habits }: CalendarLogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const completedDates = completions.map(c => parseISO(c.date));
  
  const selectedDayCompletions = date ? completions.filter(c => c.date === format(date, 'yyyy-MM-dd')) : [];
  
  const getHabitTitle = (habitId: string) => {
    return habits.find(h => h.id === habitId)?.title || 'Unknown Habit';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Log</CardTitle>
        <CardDescription>Your habit completion history.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{ completed: completedDates }}
          modifiersStyles={{
            completed: { 
              color: 'hsl(var(--primary-foreground))',
              backgroundColor: 'hsl(var(--primary))',
            },
          }}
        />
        <div className="pt-2">
          <h4 className="font-medium mb-3">
            {date ? `Log for ${format(date, 'MMMM d, yyyy')}` : 'Select a date'}
          </h4>
          <div className="space-y-3 p-4 bg-secondary/50 rounded-lg min-h-[100px]">
            {selectedDayCompletions.length > 0 ? (
              <>
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  You completed {selectedDayCompletions.length} habit{selectedDayCompletions.length > 1 ? 's' : ''}!
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedDayCompletions.map(c => (
                    <Badge key={c.habitId} variant="default">
                      {getHabitTitle(c.habitId)}
                    </Badge>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground pt-2">No habits completed on this day. Keep going!</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
