"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export const CalendarHeader = ({
  currentDate,
  showCompleted,
  onShowCompletedChange,
  onPreviousMonth,
  onNextMonth,
  onToday
}: CalendarHeaderProps) => {
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 text-sm">Manage your meetings and events</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <Switch 
            id="show-completed"
            checked={showCompleted}
            onCheckedChange={onShowCompletedChange}
          />
          <Label htmlFor="show-completed" className="text-sm font-medium text-gray-700">
            Show Completed
          </Label>
        </div>

        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreviousMonth}
            className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="px-4 py-1 text-sm font-semibold text-gray-900 min-w-32 text-center">
            {formatMonthYear(currentDate)}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNextMonth}
            className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="text-sm"
        >
          Today
        </Button>
      </div>
    </div>
  );
};