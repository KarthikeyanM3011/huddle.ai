"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Calendar, Clock, Bot, User, MapPin, Play } from "lucide-react";
import { CalendarEvent } from "@/modules/calendar/schema"
import { useState } from "react";
import { useRouter } from "next/navigation";

interface EventCardProps {
  event: CalendarEvent;
  compact?: boolean;
}

interface EventModalProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  completed: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const EventModal = ({ event, isOpen, onClose }: EventModalProps) => {
  const router = useRouter();
  const statusColor = statusColors[event.status as keyof typeof statusColors];
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuration = () => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const handleStartMeeting = () => {
    if (event.meetingId) {
      router.push(`/call/${event.meetingId}`);
    }
  };

  const handleViewMeeting = () => {
    if (event.meetingId) {
      router.push(`/dashboard/meetings/${event.meetingId}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              {event.type === 'meeting' ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <Calendar className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {event.title}
              </DialogTitle>
              <Badge 
                variant="secondary" 
                className={`text-xs mt-2 ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="font-medium text-gray-900">{formatDate(event.startTime)}</p>
                <p className="text-sm">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-600">
              <Clock className="w-5 h-5" />
              <div>
                <p className="font-medium text-gray-900">Duration</p>
                <p className="text-sm">{getDuration()}</p>
              </div>
            </div>

            {event.agentName && (
              <div className="flex items-center space-x-3 text-gray-600">
                <Bot className="w-5 h-5" />
                <div>
                  <p className="font-medium text-gray-900">AI Agent</p>
                  <p className="text-sm">{event.agentName}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 text-gray-600">
              <MapPin className="w-5 h-5" />
              <div>
                <p className="font-medium text-gray-900">Type</p>
                <p className="text-sm capitalize">{event.type}</p>
              </div>
            </div>

          </div>

          {event.type === 'meeting' && event.meetingId && (
            <div className="flex space-x-3 pt-4 border-t">
              {event.status === 'upcoming' && (
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleStartMeeting}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Meeting
                </Button>
              )}
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleViewMeeting}
              >
                <Video className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const EventCard = ({ event, compact = false }: EventCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statusColor = statusColors[event.status as keyof typeof statusColors];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (compact) {
    return (
      <>
        <div 
          className={`text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${statusColor.bg} ${statusColor.text} truncate`}
          onClick={() => setIsModalOpen(true)}
          title={event.title}
        >
          <div className="flex items-center space-x-1">
            {event.type === 'meeting' ? (
              <Video className="w-3 h-3 flex-shrink-0" />
            ) : (
              <Calendar className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="truncate">{event.title}</span>
          </div>
          <div className="text-xs opacity-75 mt-0.5">
            {formatTime(event.startTime)}
          </div>
        </div>
        <EventModal 
          event={event} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </>
    );
  }

  return (
    <>
      <Card 
        className={`cursor-pointer hover:shadow-md transition-shadow ${statusColor.bg} border-2 ${statusColor.border}`}
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColor.text === 'text-blue-700' ? 'bg-blue-600' : statusColor.text === 'text-red-700' ? 'bg-red-600' : 'bg-gray-600'}`}>
              {event.type === 'meeting' ? (
                <Video className="w-4 h-4 text-white" />
              ) : (
                <Calendar className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1">
              <CardTitle className={`text-sm font-semibold ${statusColor.text}`}>
                {event.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-xs ${statusColor.text} opacity-75`}>
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </div>
          {event.agentName && (
            <div className={`text-xs ${statusColor.text} opacity-75 mt-1 flex items-center`}>
              <Bot className="w-3 h-3 mr-1" />
              {event.agentName}
            </div>
          )}
        </CardContent>
      </Card>
      <EventModal 
        event={event} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};