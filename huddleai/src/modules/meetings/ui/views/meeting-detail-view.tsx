"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MeetingForm } from "../components/meeting-form";
import { Video, Edit, Trash2, ArrowLeft, Calendar, Clock, Sparkles, Bot, Play, Square, X } from "lucide-react";
import { toast } from "sonner";
import { type MeetingsInsert } from "../../schema";

interface MeetingDetailViewProps {
  meetingId: string;
}

const statusColors = {
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Calendar },
  active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: Play },
  completed: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: Square },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: X },
  processing: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
};

const statusLabels = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  processing: 'Processing',
};

export const MeetingDetailView = ({ meetingId }: MeetingDetailViewProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const { data: meeting } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  const updateMeetingMutation = useMutation({
    ...trpc.meetings.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Meeting updated successfully!");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update meeting");
    },
  });

  const deleteMeetingMutation = useMutation({
    ...trpc.meetings.remove.mutationOptions(),
    onSuccess: () => {
      toast.success("Meeting deleted successfully!");
      router.push("/dashboard/meetings");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete meeting");
      setIsDeleteDialogOpen(false);
    },
  });

  const handleUpdateMeeting = async (data: MeetingsInsert) => {
    updateMeetingMutation.mutate({
      id: meetingId,
      data,
    });
  };

  const handleDeleteMeeting = async () => {
    deleteMeetingMutation.mutate({ id: meetingId });
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return null;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const statusColor = statusColors[meeting.status as keyof typeof statusColors];
  const StatusIcon = statusColor.icon;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/meetings")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Meetings
          </Button>
          <div className="w-px h-6 bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{meeting.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                variant="secondary" 
                className={`text-xs ${statusColor.bg} ${statusColor.text} ${statusColor.border} border flex items-center space-x-1`}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{statusLabels[meeting.status as keyof typeof statusLabels]}</span>
              </Badge>
              {meeting.duration && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(meeting.duration)}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Created {new Date(meeting.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="hover:bg-blue-50 hover:border-blue-200"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Meeting Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {meeting.instructions}
                </p>
              </div>
            </CardContent>
          </Card>

          {meeting.summary && (
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <span>Meeting Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {meeting.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {(meeting.transcriptUrl || meeting.recordingUrl) && (
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle>Meeting Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {meeting.transcriptUrl && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(meeting.transcriptUrl!, '_blank')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    View Transcript
                  </Button>
                )}
                
                {meeting.recordingUrl && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(meeting.recordingUrl!, '_blank')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    View Recording
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className={`${statusColor.bg} border-2 ${statusColor.border}`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${statusColor.text}`}>
                <StatusIcon className="w-5 h-5" />
                <span>Meeting Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`text-center py-4 ${statusColor.text}`}>
                <div className="text-2xl font-bold mb-1">
                  {statusLabels[meeting.status as keyof typeof statusLabels]}
                </div>
                {meeting.status === 'completed' && meeting.duration && (
                  <div className="text-sm opacity-75">
                    Duration: {formatDuration(meeting.duration)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {meeting.status === 'upcoming' && (
                  <>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Meeting
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      disabled
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Meeting
                    </Button>
                  </>
                )}

                {meeting.status === 'active' && (
                  <Button
                    variant="outline"
                    className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600"
                    disabled
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End Meeting
                  </Button>
                )}

                {(meeting.status === 'cancelled' || meeting.status === 'completed') && (
                  <div className="text-center text-sm text-gray-500 py-4">
                    Meeting has been {meeting.status}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <Bot className="w-5 h-5" />
                <span>Agent Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-blue-800">Agent Name</label>
                <p className="text-sm text-blue-700 mt-1 font-medium">
                  {meeting.agentName}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Calendar className="w-5 h-5" />
                <span>Meeting Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-800">Meeting ID</label>
                <p className="text-sm text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                  {meeting.id}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-800">Created</label>
                <p className="text-sm text-gray-700 mt-1">
                  {new Date(meeting.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-800">Last Updated</label>
                <p className="text-sm text-gray-700 mt-1">
                  {new Date(meeting.updatedAt).toLocaleString()}
                </p>
              </div>

              {meeting.startedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-800">Started At</label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date(meeting.startedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {meeting.endedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-800">Ended At</label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date(meeting.endedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Meeting Details
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ResponsiveDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Meeting"
        description="Update your meeting information and instructions."
      >
        <MeetingForm
          defaultValues={{
            name: meeting.name,
            agentId: meeting.agentId,
            instructions: meeting.instructions,
          }}
          onSubmit={handleUpdateMeeting}
          submitText="Update Meeting"
          isLoading={updateMeetingMutation.isPending}
        />
      </ResponsiveDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{meeting.name}"? This action cannot be undone.
              All associated data including recordings and transcripts will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMeetingMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMeeting}
              disabled={deleteMeetingMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMeetingMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Deleting...
                </div>
              ) : (
                "Delete Meeting"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};