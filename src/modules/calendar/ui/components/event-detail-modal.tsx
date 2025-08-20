"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Video, Bot, Calendar, Clock, Play, Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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

interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

const statusColors = {
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  active: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  processing: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const statusLabels = {
  upcoming: 'Upcoming',
  scheduled: 'Scheduled',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  processing: 'Processing',
};

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteEventMutation = useMutation({
    ...trpc.calendar.deleteEvent.mutationOptions(),
    onSuccess: () => {
      toast.success("Event deleted successfully!");
      onClose();
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete event");
      setIsDeleteDialogOpen(false);
    },
  });

  if (!event) return null;

  const isMeeting = event.resource.type === 'meeting';
  const status = event.resource.meetingStatus || event.resource.status;
  const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.scheduled;

  const handleStartMeeting = () => {
    if (event.resource.meetingId) {
      router.push(`/call/${event.resource.meetingId}`);
    }
  };

  const handleViewMeeting = () => {
    if (event.resource.meetingId) {
      router.push(`/dashboard/meetings/${event.resource.meetingId}`);
    }
  };

  const handleDeleteEvent = () => {
    deleteEventMutation.mutate({ id: event.id });
  };

  const duration = Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60));

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isMeeting 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                    : 'bg-gradient-to-br from-cyan-500 to-teal-600'
                }`}>
                  {isMeeting ? (
                    <Video className="w-6 h-6 text-white" />
                  ) : (
                    <Calendar className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}
                    >
                      {statusLabels[status as keyof typeof statusLabels] || status}
                    </Badge>
                    {isMeeting && event.resource.agentName && (
                      <Badge variant="outline" className="text-xs">
                        <Bot className="w-3 h-3 mr-1" />
                        {event.resource.agentName}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {format(event.start, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')} ({duration} min)
                  </p>
                </div>
              </div>

              {isMeeting && (
                <div className="space-y-3">
                  {status === 'upcoming' || status === 'scheduled' ? (
                    <Button
                      onClick={handleStartMeeting}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Meeting
                    </Button>
                  ) : null}

                  <Button
                    onClick={handleViewMeeting}
                    variant="outline"
                    className="w-full"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    View Meeting Details
                  </Button>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="outline"
                  className="flex-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
              {isMeeting && " The associated meeting will also be removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEventMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={deleteEventMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteEventMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Deleting...
                </div>
              ) : (
                "Delete Event"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}