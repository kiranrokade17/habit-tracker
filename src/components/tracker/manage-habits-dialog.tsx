"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Habit } from "@/lib/types";
import { Plus, Trash2, Settings2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ManageHabitsDialogProps {
  habits: Habit[];
  onRefresh: () => void;
}

export function ManageHabitsDialog({ habits, onRefresh }: ManageHabitsDialogProps) {
  const [localHabits, setLocalHabits] = useState<Habit[]>(habits);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitColor, setNewHabitColor] = useState("#3b82f6");
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  // Sync local state when props change
  useEffect(() => {
    setLocalHabits(habits);
  }, [habits]);

  const handleAdd = async () => {
    if (!newHabitName.trim()) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('habits').insert({
      name: newHabitName,
      color: newHabitColor,
      user_id: session.user.id
    }).select().single();

    if (error) {
      console.error(error);
      return;
    }

    setNewHabitName("");
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('habits').delete().eq('id', id);
    onRefresh();
  };

  const handleUpdate = async (id: string, updates: Partial<Habit>) => {
    // Optimistic UI update
    setLocalHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    
    await supabase.from('habits').update(updates).eq('id', id);
    onRefresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        render={<Button variant="outline" size="sm" className="gap-2" />}
      >
        <Settings2 className="w-4 h-4" />
        Manage Habits
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle>Manage Habits</DialogTitle>
          <DialogDescription>
            Add, edit, or remove the habits you want to track.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-end gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="habit-name" className="sr-only">Habit Name</Label>
              <Input
                id="habit-name"
                placeholder="E.g., Read 10 pages"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="habit-color" className="sr-only">Color</Label>
              <Input
                id="habit-color"
                type="color"
                value={newHabitColor}
                onChange={(e) => setNewHabitColor(e.target.value)}
                className="w-12 p-1 cursor-pointer h-10"
              />
            </div>
            <Button onClick={handleAdd} type="button" size="icon">
              <Plus className="w-4 h-4" />
              <span className="sr-only">Add</span>
            </Button>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {localHabits.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                No habits added yet.
              </div>
            ) : (
              localHabits.map(habit => (
                <div key={habit.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
                  <div className="flex items-center gap-3 flex-1 mr-2">
                    <Input
                      type="color"
                      value={habit.color}
                      onChange={(e) => handleUpdate(habit.id, { color: e.target.value })}
                      className="w-8 h-8 p-0 border-0 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={habit.name}
                      onChange={(e) => handleUpdate(habit.id, { name: e.target.value })}
                      className="h-8 bg-transparent border-transparent hover:border-input focus-visible:ring-1"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(habit.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
