"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { HabitEntry, Habit } from "@/lib/types";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";

interface WeeklyChartProps {
  entries: HabitEntry[];
  habits: Habit[];
}

export function WeeklyChart({ entries, habits }: WeeklyChartProps) {
  const totalHabits = habits.length;
  const today = startOfDay(new Date());
  
  // Last 7 days
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  const data = last7Days.map(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    const completedThatDay = entries.filter(e => e.date === dateStr && e.completed).length;
    
    return {
      day: format(day, "EEE"),
      completed: completedThatDay,
      total: totalHabits,
      percentage: totalHabits > 0 ? Math.round((completedThatDay / totalHabits) * 100) : 0
    };
  });

  return (
    <div className="w-full h-full flex flex-col p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Weekly Consistency</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
              domain={[0, totalHabits]} 
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border rounded-lg shadow-lg p-3">
                      <p className="font-medium text-sm">{payload[0].payload.day}</p>
                      <p className="text-2xl font-bold text-primary">
                        {payload[0].value} <span className="text-sm text-muted-foreground font-normal">/ {totalHabits}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{payload[0].payload.percentage}% complete</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="completed" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
