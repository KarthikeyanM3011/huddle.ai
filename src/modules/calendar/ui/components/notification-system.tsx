"use client";

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';
import { Bell, Video, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function NotificationSystem() {
  const [hasPermission, setHasPermission] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: upcomingReminders = [] } = useQuery({
    ...trpc.calendar.getUpcomingReminders.queryOptions(),
    refetchInterval: 30000, // Check every 30 seconds
  });

  const markReminderSentMutation = useMutation({
    ...trpc.calendar.markReminderSent.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'getUpcomingReminders'] });
    },
  });

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          setHasPermission(permission === 'granted');
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!hasPermission || !upcomingReminders.length) return;

    upcomingReminders.forEach((reminder) => {
      const timeUntilMeeting = new Date(reminder.startTime).getTime() - new Date().getTime();
      
      // If meeting is within 10 minutes and reminder hasn't been sent
      if (timeUntilMeeting <= 10 * 60 * 1000 && timeUntilMeeting > 0 && !reminder.reminderSent) {
        // Show browser notification
        new Notification(`Meeting Reminder`, {
          body: `Meeting '${reminder.title}' starts in ${Math.round(timeUntilMeeting / (60 * 1000))} minutes`,
          icon: '/favicon.ico',
          tag: `meeting-${reminder.id}`,
        });

        // Show toast notification
        toast.info(
          `Meeting '${reminder.title}' starts in ${Math.round(timeUntilMeeting / (60 * 1000))} minutes`,
          {
            duration: 10000,
            action: reminder.meetingId ? {
              label: 'Join Now',
              onClick: () => window.open(`/call/${reminder.meetingId}`, '_blank'),
            } : undefined,
          }
        );

        // Mark reminder as sent
        markReminderSentMutation.mutate({ eventId: reminder.id });
      }
    });
  }, [upcomingReminders, hasPermission, markReminderSentMutation]);

  return null; // This component doesn't render anything visible
}