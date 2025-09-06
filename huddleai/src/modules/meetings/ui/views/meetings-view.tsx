"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { MeetingForm } from "../components/meeting-form";
import { useMeetingFilters } from "../../hooks/use-meeting-filters";
import { Video, Plus, Search, Calendar, ArrowRight, Sparkles, Bot, Clock, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { type MeetingsInsert } from "../../schema";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const statusColors = {
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  completed: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  processing: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

const statusLabels = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  processing: 'Processing',
};

export const MeetingsView = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useMeetingFilters();
  
  const debouncedSearch = useDebounce(searchInput, 2000);

  useEffect(() => {
    setFilters({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch, setFilters]);

  useEffect(() => {
    setSearchInput(filters.search);
  }, []);

  const { data: meetingsData, isLoading } = useQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
      status: (
        filters.status === "upcoming" ||
        filters.status === "active" ||
        filters.status === "completed" ||
        filters.status === "cancelled" ||
        filters.status === "processing"
      )
        ? filters.status
        : undefined,
    })
  );

  const { data: agentsData } = useQuery(
    trpc.agents.getMany.queryOptions({ page: 1, pageSize: 100, search: '' })
  );

  const createMeetingMutation = useMutation({
    ...trpc.meetings.create.mutationOptions(),
    onSuccess: (data) => {
      if (data.startNow) {
        toast.success("Meeting started! Redirecting...");
        setTimeout(() => {
          router.push(`/call/${data.id}`);
        }, 1000);
      } else {
        toast.success("Meeting scheduled successfully!");
      }
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to schedule meeting");
    },
  });

  const handleCreateMeeting = async (data: MeetingsInsert) => {
    createMeetingMutation.mutate(data);
  };

  const handleStartNow = async (data: MeetingsInsert) => {
    createMeetingMutation.mutate({ ...data, startNow: true });
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput, page: 1 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setFilters({ search: searchInput, page: 1 });
    }
  };

  const handleMeetingClick = (meetingId: string) => {
    router.push(`/dashboard/meetings/${meetingId}`);
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ status: status === 'all' ? '' : status, page: 1 });
  };

  const handleAgentFilter = (agentId: string) => {
    setFilters({ agentId: agentId === 'all' ? '' : agentId, page: 1 });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilters({ search: "", status: "", agentId: "", page: 1 });
  };

  const handleClearStatus = () => {
    setFilters({ status: "", page: 1 });
  };

  const handleClearAgent = () => {
    setFilters({ agentId: "", page: 1 });
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return null;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatScheduledTime = (scheduledTime: string | null) => {
    if (!scheduledTime) return null;
    const date = new Date(scheduledTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }
    
    const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
    if (isTomorrow) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    }
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const meetings = meetingsData?.meetings || [];
  const pagination = meetingsData?.pagination;

  if (!meetings.length && !filters.search && !filters.status && !filters.agentId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
            <p className="text-gray-600">Schedule and manage AI-powered meetings</p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center">
              <Video className="w-12 h-12 text-blue-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Schedule Your First Meeting
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Create AI-powered meetings with your virtual assistants. 
            Set agendas, get summaries, and let AI help facilitate your discussions.
          </p>
          
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Your First Meeting
          </Button>
        </div>

        <ResponsiveDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          title="Schedule New Meeting"
          description="Create an AI-powered meeting with your virtual assistant."
        >
          <MeetingForm
            onSubmit={handleCreateMeeting}
            onStartNow={handleStartNow}
            isLoading={createMeetingMutation.isPending}
          />
        </ResponsiveDialog>
      </div>
    );
  }

  const hasActiveFilters = filters.search || filters.status || filters.agentId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">
            {pagination?.total} meeting{pagination?.total !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Meeting
        </Button>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <form onSubmit={handleSearchSubmit}>
              <Input
                placeholder="Search meetings... (Press Enter to search)"
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-20"
              />
            </form>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {searchInput !== filters.search && searchInput && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setFilters({ search: searchInput, page: 1 })}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Search
                </Button>
              )}
              {(searchInput || filters.search) && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearchInput("");
                    setFilters({ search: "", page: 1 });
                  }}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={filters.status || "all"} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-40">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.agentId || "all"} onValueChange={handleAgentFilter}>
              <SelectTrigger className="w-40">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="Agent" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agentsData?.agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.status && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Status: {statusLabels[filters.status as keyof typeof statusLabels]}</span>
                <button onClick={handleClearStatus} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.agentId && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Agent: {agentsData?.agents.find(a => a.id === filters.agentId)?.name}</span>
                <button onClick={handleClearAgent} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <Search className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No meetings found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters, or create a new meeting.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => {
            const statusColor = statusColors[meeting.status as keyof typeof statusColors];
            const scheduledTime = formatScheduledTime(meeting.scheduledStartTime);
            return (
              <Card 
                key={meeting.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-gray-200/50"
                onClick={() => handleMeetingClick(meeting.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {meeting.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}
                        >
                          {statusLabels[meeting.status as keyof typeof statusLabels]}
                        </Badge>
                        {meeting.duration && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration(meeting.duration)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Bot className="w-4 h-4" />
                      <span>Agent: {meeting.agentName}</span>
                    </div>
                    {scheduledTime && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <Calendar className="w-4 h-4" />
                        <span>Scheduled: {scheduledTime}</span>
                      </div>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {meeting.instructions}
                    </p>
                    <div className="text-xs text-gray-500">
                      Created {new Date(meeting.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ page: Math.max(1, filters.page - 1) })}
            disabled={filters.page === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ page: Math.min(pagination.totalPages, filters.page + 1) })}
            disabled={filters.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <ResponsiveDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Schedule New Meeting"
        description="Create an AI-powered meeting with your virtual assistant."
      >
        <MeetingForm
          onSubmit={handleCreateMeeting}
          onStartNow={handleStartNow}
          isLoading={createMeetingMutation.isPending}
        />
      </ResponsiveDialog>
    </div>
  );
};