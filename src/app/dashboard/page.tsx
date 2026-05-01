"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useRouter } from "next/navigation";
import { HabitGrid } from "@/components/tracker/habit-grid";
import { MonthHeader } from "@/components/tracker/month-header";
import { ProgressSummary } from "@/components/tracker/progress-summary";
import { ManageHabitsDialog } from "@/components/tracker/manage-habits-dialog";
import { UserProfile } from "@/components/tracker/user-profile";
import { WeeklyChart } from "@/components/tracker/weekly-chart";
import { GeminiFeedback } from "@/components/tracker/gemini-feedback";
import { ThemeToggle } from "@/components/theme-toggle";
import { Habit, HabitEntry } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const fetchData = async () => {
    const startStr = format(startOfMonth(currentDate), "yyyy-MM-dd");
    const endStr = format(endOfMonth(currentDate), "yyyy-MM-dd");

    // Fetch Habits
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true });

    if (habitsData) setHabits(habitsData);

    // Fetch Entries for the month
    const { data: entriesData } = await supabase
      .from('habit_entries')
      .select('*')
      .gte('date', startStr)
      .lte('date', endStr);

    if (entriesData) setEntries(entriesData);
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserEmail(session.user.email ?? null);
      setIsAuthLoading(false);
      fetchData();
    };

    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, router, supabase]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleToggleEntry = async (habitId: string, dateStr: string, completed: boolean) => {
    // Optimistic update
    setEntries(prev => {
      const filtered = prev.filter(e => !(e.habit_id === habitId && e.date === dateStr));
      if (completed) {
        return [...filtered, {
          id: `temp-${habitId}-${dateStr}`,
          habit_id: habitId,
          date: dateStr,
          completed: true,
          user_id: ''
        }];
      }
      return filtered;
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (completed) {
      await supabase.from('habit_entries').upsert({
        habit_id: habitId,
        date: dateStr,
        completed: true,
        user_id: session.user.id
      }, { onConflict: 'habit_id, date' });
    } else {
      await supabase.from('habit_entries').delete().match({
        habit_id: habitId,
        date: dateStr
      });
    }
    
    // Refresh to get actual IDs
    fetchData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Calculate current day stats
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const completedToday = entries.filter(e => e.date === todayStr && e.completed).length;

  // Monthly Goal Progress calculation (Option 2)
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const totalPossible = habits.length * daysInMonth;
  const completedThisMonth = entries.filter(e => e.completed).length;
  // Calculate how much of the monthly goal is completed so far (0% to 100%)
  const monthlyPercentage = totalPossible === 0 ? 0 : Math.min(Math.round((completedThisMonth / totalPossible) * 100), 100);

  let currentStreak = 0;
  const checkDate = new Date();
  while (true) {
    const dStr = format(checkDate, "yyyy-MM-dd");
    const hasCompleted = entries.some(e => e.date === dStr && e.completed);
    if (hasCompleted) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If today is not completed yet, check yesterday before breaking streak
      if (currentStreak === 0 && dStr === todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  // Calculate perfect days (days where ALL habits are completed)
  let perfectDays = 0;
  if (habits.length > 0) {
    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
      if (entry.completed) {
        acc[entry.date] = (acc[entry.date] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    perfectDays = Object.values(entriesByDate).filter(count => count === habits.length).length;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <ManageHabitsDialog habits={habits} onRefresh={fetchData} />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {userEmail && <UserProfile email={userEmail} onLogout={handleLogout} />}
        </div>
      </div>

      <MonthHeader currentDate={currentDate} onDateChange={setCurrentDate} />
      
      <ProgressSummary 
        totalHabits={habits.length} 
        completedToday={completedToday} 
        monthlyPercentage={monthlyPercentage} 
        currentStreak={currentStreak} 
        perfectDays={perfectDays}
      />

      <div className="mt-8 mb-12">
        <HabitGrid 
          currentDate={currentDate} 
          habits={habits} 
          entries={entries} 
          onToggleEntry={handleToggleEntry} 
        />
      </div>
      
      {/* Analytics & AI Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="h-80 rounded-xl border bg-card/50 shadow-sm overflow-hidden">
          <WeeklyChart entries={entries} habits={habits} />
        </div>
        <div className="h-80 rounded-xl border shadow-sm overflow-hidden">
          <GeminiFeedback habits={habits} entries={entries} />
        </div>
      </div>
    </div>
  );
}
