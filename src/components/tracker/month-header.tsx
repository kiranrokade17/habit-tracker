"use client";

import { format, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface MonthHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function MonthHeader({ currentDate, onDateChange }: MonthHeaderProps) {
  const nextMonth = () => onDateChange(addMonths(currentDate, 1));
  const prevMonth = () => onDateChange(subMonths(currentDate, 1));
  const today = () => onDateChange(new Date());

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {format(currentDate, "MMMM yyyy")}
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={today} className="hidden sm:flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Today
        </Button>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-md">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-md">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
