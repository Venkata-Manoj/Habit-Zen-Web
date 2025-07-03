'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, isToday } from 'date-fns';
import type { Habit, HabitCompletion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const HABITS_STORAGE_KEY = 'habitzen-habits';
const COMPLETIONS_STORAGE_KEY = 'habitzen-completions';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
      const storedCompletions = localStorage.getItem(COMPLETIONS_STORAGE_KEY);

      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      }
      if (storedCompletions) {
        setCompletions(JSON.parse(storedCompletions));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not load your data." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(COMPLETIONS_STORAGE_KEY, JSON.stringify(completions));
    }
  }, [completions, isLoading]);

  const addHabit = useCallback((newHabitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    toast({ title: "Success", description: "Habit added successfully." });
  }, [toast]);

  const updateHabit = useCallback((updatedHabit: Habit) => {
    setHabits(prev => prev.map(h => h.id === updatedHabit.id ? updatedHabit : h));
    toast({ title: "Success", description: "Habit updated successfully." });
  }, [toast]);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    setCompletions(prev => prev.filter(c => c.habitId !== habitId));
    toast({ title: "Success", description: "Habit deleted." });
  }, [toast]);

  const toggleCompletion = useCallback((habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setCompletions(prev => {
      const existingCompletion = prev.find(c => c.habitId === habitId && c.date === dateStr);
      if (existingCompletion) {
        return prev.filter(c => c.habitId !== habitId || c.date !== dateStr);
      } else {
        return [...prev, { habitId, date: dateStr }];
      }
    });
  }, []);

  const isCompleted = useCallback((habitId: string, dateStr: string) => {
    return completions.some(c => c.habitId === habitId && c.date === dateStr);
  }, [completions]);

  return {
    habits,
    completions,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
  };
}
