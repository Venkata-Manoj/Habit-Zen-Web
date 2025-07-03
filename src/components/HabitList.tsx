'use client';

import { useState } from 'react';
import type { Habit } from '@/lib/types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, MoreHorizontal, Trash2, Edit, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

type HabitListProps = {
  habits: Habit[];
  isLoading: boolean;
  isCompleted: (habitId: string, dateStr: string) => boolean;
  toggleCompletion: (habitId: string, date: Date) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  updateHabit: (habit: Habit) => void;
};

// --- Reminder Dialog ---
function ReminderDialog({ habit, updateHabit, isOpen, setIsOpen }: { habit: Habit, updateHabit: (habit: Habit) => void, isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const [time, setTime] = useState(habit.reminderTime || '');
  const { toast } = useToast();

  const handleSave = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({ variant: "destructive", title: "Permission needed", description: "Please allow notifications to set reminders." });
        return;
      }
    }
    updateHabit({ ...habit, reminderTime: time || null });
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Reminder for "{habit.title}"</DialogTitle>
          <DialogDescription>Set a time for your daily reminder.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input type="time" value={time || ''} onChange={(e) => setTime(e.target.value)} />
        </div>
        <DialogFooter>
          {habit.reminderTime && <Button variant="ghost" onClick={() => { updateHabit({ ...habit, reminderTime: null }); setIsOpen(false); }}>Remove Reminder</Button>}
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Habit Item ---
function HabitItem({ habit, isCompleted, toggleCompletion, onEdit, setHabitToDelete, setHabitForReminder }: { habit: Habit, isCompleted: boolean, toggleCompletion: (habitId: string, date: Date) => void, onEdit: (habit: Habit) => void, setHabitToDelete: (habit: Habit) => void, setHabitForReminder: (habit: Habit) => void }) {
  const today = new Date();
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-4 flex items-center gap-4">
          <Checkbox
            id={`habit-${habit.id}`}
            checked={isCompleted}
            onCheckedChange={() => toggleCompletion(habit.id, today)}
            className="h-6 w-6"
          />
          <div className="flex-grow">
            <label htmlFor={`habit-${habit.id}`} className="font-medium text-lg cursor-pointer">{habit.title}</label>
            {habit.description && <p className="text-sm text-muted-foreground">{habit.description}</p>}
            {habit.reminderTime && (
              <div className="text-xs text-primary flex items-center gap-1 mt-1">
                <Bell className="h-3 w-3" />
                <span>{format(new Date(`1970-01-01T${habit.reminderTime}`), 'p')}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setHabitForReminder(habit)}>
                <Bell className="mr-2 h-4 w-4" /> Set Reminder
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onEdit(habit)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setHabitToDelete(habit)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Main List Component ---
export function HabitList({ habits, isLoading, isCompleted, toggleCompletion, onEdit, onDelete, updateHabit }: HabitListProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [habitForReminder, setHabitForReminder] = useState<Habit | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <AnimatePresence>
        {habits.length > 0 ? (
          habits.map(habit => (
            <HabitItem
              key={habit.id}
              habit={habit}
              isCompleted={isCompleted(habit.id, todayStr)}
              toggleCompletion={toggleCompletion}
              onEdit={onEdit}
              setHabitToDelete={setHabitToDelete}
              setHabitForReminder={setHabitForReminder}
            />
          ))
        ) : (
          <Card className="text-center p-8 border-dashed">
            <h3 className="text-xl font-medium">No habits yet!</h3>
            <p className="text-muted-foreground mt-2">Click "New Habit" to get started on your journey.</p>
          </Card>
        )}
      </AnimatePresence>

      {habitForReminder && (
        <ReminderDialog
          habit={habitForReminder}
          updateHabit={updateHabit}
          isOpen={!!habitForReminder}
          setIsOpen={() => setHabitForReminder(null)}
        />
      )}

      {habitToDelete && (
        <AlertDialog open={!!habitToDelete} onOpenChange={() => setHabitToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the habit "{habitToDelete.title}" and all its completion data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(habitToDelete.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
