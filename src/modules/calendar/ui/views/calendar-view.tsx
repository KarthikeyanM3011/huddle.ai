"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { CalendarView } from "../components/calendar-view";
import { MeetingScheduler } from "../components/meeting-scheduler";
import { EventDetailModal } from "../components/event-detail-modal";
import { NotificationSystem } from "../components/notification-system";
import { Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { type MeetingSchedule } from "../../schema";
import { useRouter } from "next/navigation";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    meetingId?: string;
    type: string;
    status: string;
    meetingStatus?: string;
    agentName?: string;
  };
}

export const CalendarPageView = () => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const scheduleMeetingMutation = useMutation({
    ...trpc.calendar.scheduleeMeeting.mutationOptions(),
    onSuccess: (result) => {
      toast.success("Meeting scheduled successfully!");
      setIsScheduleDialogOpen(false);
      setSelectedDate(null);
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      
      // If it's a random meeting, redirect to call immediately
      if (result.meeting.status === 'upcoming' && result.meeting.scheduledStartTime) {
        const now = new Date();
        const scheduledTime = new Date(result.meeting.scheduledStartTime);
        const timeDiff = scheduledTime.getTime() - now.getTime();
        
        // If scheduled for within 2 minutes, redirect to call
        if (timeDiff <= 2 * 60 * 1000) {
          router.push(`/call/${result.meeting.id}`);
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to schedule meeting");
    },
  });

  const handleScheduleMeeting = async (data: MeetingSchedule) => {
    scheduleMeetingMutation.mutate(data);
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsScheduleDialogOpen(true);
  };

  const handleCloseEventModal = () => {
    setSelectedEvent(null);
  };

  const handleOpenScheduler = () => {
    setSelectedDate(new Date());
    setIsScheduleDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <NotificationSystem />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Schedule and manage your meetings and events</p>
        </div>
        <Button
          onClick={handleOpenScheduler}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      <CalendarView 
        onEventSelect={handleEventSelect}
        onDateSelect={handleDateSelect}
      />

      <ResponsiveDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        title="Schedule Meeting"
        description="Create a new meeting with your AI assistant."
      >
        <MeetingScheduler
          defaultDate={selectedDate || new Date()}
          onSubmit={handleScheduleMeeting}
          isLoading={scheduleMeetingMutation.isPending}
        />
      </ResponsiveDialog>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={handleCloseEventModal}
        />
      )}
    </div>
  );
};