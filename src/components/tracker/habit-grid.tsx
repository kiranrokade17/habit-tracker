"use client";

import * as React from "react";
import { format, getDaysInMonth, startOfMonth, addDays, isToday } from "date-fns";
import { Habit, HabitEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface HabitGridProps {
  currentDate: Date;
  habits: Habit[];
  entries: HabitEntry[];
  onToggleEntry: (habitId: string, date: string, completed: boolean) => void;
}

export function HabitGrid({ currentDate, habits, entries, onToggleEntry }: HabitGridProps) {
  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = startOfMonth(currentDate);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => addDays(startDay, i));

  // Calculate daily percentages
  const dailyStats = days.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayEntries = entries.filter(e => e.date === dayStr && e.completed);
    const percentage = habits.length > 0 ? Math.round((dayEntries.length / habits.length) * 100) : 0;
    return { day, percentage };
  });

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="flex border-b">
            <div className="w-48 flex-shrink-0 p-4 border-r bg-muted/30 flex items-center justify-between sticky left-0 z-20 backdrop-blur-md">
              <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Habits</span>
            </div>
            <div className="flex">
              {days.map((day) => (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "w-12 flex-shrink-0 flex flex-col items-center justify-center p-2 border-r transition-colors",
                    isToday(day) ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  <span className="text-[10px] uppercase font-medium">{format(day, "EEE")}</span>
                  <span className={cn("text-lg", isToday(day) ? "font-bold text-primary" : "font-medium")}>
                    {format(day, "d")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Habit Rows */}
          <div className="flex flex-col">
            {habits.map((habit, index) => (
              <div key={habit.id} className={cn("flex border-b group transition-colors hover:bg-muted/10", index % 2 === 0 ? "bg-transparent" : "bg-muted/5")}>
                <div className="w-48 flex-shrink-0 p-4 border-r flex items-center gap-3 sticky left-0 z-20 bg-card/90 backdrop-blur-md group-hover:bg-muted/50 transition-colors">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: habit.color || "hsl(var(--primary))" }} 
                  />
                  <span className="font-medium text-sm truncate" title={habit.name}>{habit.name}</span>
                </div>
                <div className="flex">
                  {days.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const entry = entries.find(e => e.habit_id === habit.id && e.date === dateStr);
                    const isCompleted = entry?.completed || false;
                    const isFuture = dateStr > format(new Date(), "yyyy-MM-dd");
                    
                    return (
                      <div key={day.toISOString()} className="w-12 flex-shrink-0 flex items-center justify-center border-r p-2 hover:bg-muted/20 transition-colors">
                        <button
                          disabled={isFuture}
                          onClick={() => onToggleEntry(habit.id, dateStr, !isCompleted)}
                          className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center transition-all duration-300 transform",
                            isFuture ? "opacity-30 cursor-not-allowed bg-muted/10 border border-muted/30" : "hover:scale-110",
                            !isFuture && isCompleted 
                              ? "bg-primary text-primary-foreground shadow-md scale-105" 
                              : !isFuture ? "bg-muted/30 hover:bg-muted text-transparent hover:text-muted-foreground/30 border border-muted" : ""
                          )}
                          style={isCompleted && habit.color ? { backgroundColor: habit.color } : {}}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Row */}
          <div className="flex bg-muted/20 border-t-2 border-primary/20">
            <div className="w-48 flex-shrink-0 p-4 border-r sticky left-0 z-20 bg-muted/50 backdrop-blur-md flex items-center">
              <span className="font-semibold text-sm text-foreground">Daily Progress</span>
            </div>
            <div className="flex">
              {dailyStats.map(({ day, percentage }) => (
                <div key={day.toISOString()} className="w-12 flex-shrink-0 flex flex-col items-center justify-center border-r p-2 relative group cursor-default">
                  <div className="h-full w-full absolute bottom-0 left-0 bg-primary/10 -z-10" style={{ height: `${percentage}%` }} />
                  <span className={cn(
                    "text-xs font-bold transition-colors",
                    percentage === 100 ? "text-green-500" : percentage >= 50 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
