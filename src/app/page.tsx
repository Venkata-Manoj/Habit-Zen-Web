'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HabitList } from '@/components/HabitList';
import { CalendarLog } from '@/components/CalendarLog';
import { AiHabitSuggestions } from '@/components/AiHabitSuggestions';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { useHabits } from '@/hooks/use-habits';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Habit } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Home() {
  const {
    habits,
    completions,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    isLoading,
  } = useHabits();

  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({ description: 'Notifications enabled for reminders!' });
          }
        });
      }, 5000);
    }

    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const todayStr = format(now, 'yyyy-MM-dd');

      habits.forEach(habit => {
        if (habit.reminderTime && habit.reminderTime === currentTime && !isCompleted(habit.id, todayStr)) {
          new Notification('HabitZen Reminder', {
            body: `Don't forget to complete your habit: ${habit.title}`,
            icon: '/logo.png', // Assuming a logo exists in public
          });
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [habits, isCompleted, toast]);

  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const handleOpenAddDialog = () => {
    setHabitToEdit(null);
    setAddDialogOpen(true);
  };
  
  const handleOpenEditDialog = (habit: Habit) => {
    setHabitToEdit(habit);
    setAddDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-8 lg:grid-cols-5 xl:grid-cols-3">
          <div className="lg:col-span-3 xl:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold font-headline">My Habits</h2>
              <Button onClick={handleOpenAddDialog} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                New Habit
              </Button>
            </div>
            <HabitList
              habits={habits}
              isCompleted={isCompleted}
              toggleCompletion={toggleCompletion}
              onEdit={handleOpenEditDialog}
              onDelete={deleteHabit}
              updateHabit={updateHabit}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-1 space-y-8">
            <CalendarLog completions={completions} habits={habits} />
            <AiHabitSuggestions habits={habits} />
          </div>
        </div>
      </main>
      <footer className="w-full mt-auto py-4 text-center text-sm text-muted-foreground border-t">
        Designed by <a href="https://www.linkedin.com/in/venkata-manoj" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Manoj</a>
      </footer>
      <AddHabitDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setAddDialogOpen}
        onSave={habitToEdit ? updateHabit : addHabit}
        habitToEdit={habitToEdit}
      />
    </div>
  );
}
