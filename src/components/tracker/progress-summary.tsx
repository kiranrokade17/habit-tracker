"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle2, Flame, Target } from "lucide-react";

interface ProgressSummaryProps {
  totalHabits: number;
  completedToday: number;
  monthlyPercentage: number;
  currentStreak: number;
  perfectDays: number;
}

export function ProgressSummary({ totalHabits, completedToday, monthlyPercentage, currentStreak, perfectDays }: ProgressSummaryProps) {
  const cards = [
    {
      title: "Today's Progress",
      value: `${completedToday} / ${totalHabits}`,
      description: "Habits completed",
      icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      progress: totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0
    },
    {
      title: "Monthly Goal Progress",
      value: `${monthlyPercentage}%`,
      description: "Goal reached",
      icon: Activity,
      color: "text-green-500",
      bg: "bg-green-500/10",
      progress: monthlyPercentage
    },
    {
      title: "Current Streak",
      value: `${currentStreak} Days`,
      description: "Keep it up!",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      progress: currentStreak > 0 ? Math.min((currentStreak / 30) * 100, 100) : 0
    },
    {
      title: "Perfect Days",
      value: `${perfectDays}`,
      description: "All habits done",
      icon: CheckCircle2,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      progress: perfectDays > 0 ? Math.min((perfectDays / 30) * 100, 100) : 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
      {cards.map((card, i) => (
        <Card key={i} className="bg-card/50 backdrop-blur-sm border-muted/40 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bg}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              {card.description}
            </p>
            <Progress value={card.progress} className="h-1.5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
