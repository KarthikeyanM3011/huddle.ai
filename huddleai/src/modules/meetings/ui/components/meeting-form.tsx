"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Video, Bot, Plus, Calendar, Clock, Play } from "lucide-react";
import { meetingsInsertSchema, type MeetingsInsert } from "../../schema";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface MeetingFormProps {
  defaultValues?: Partial<MeetingsInsert>;
  onSubmit: (data: MeetingsInsert) => Promise<void>;
  onStartNow?: (data: MeetingsInsert) => Promise<void>;
  submitText?: string;
  isLoading?: boolean;
}

export function MeetingForm({
  defaultValues,
  onSubmit,
  onStartNow,
  submitText = "Schedule Meeting",
  isLoading = false,
}: MeetingFormProps) {
  const [error, setError] = useState<string>("");
  const [startNow, setStartNow] = useState(false);
  const trpc = useTRPC();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MeetingsInsert>({
    resolver: zodResolver(meetingsInsertSchema),
    defaultValues,
  });

  const { data: agentsData } = useQuery(
    trpc.agents.getMany.queryOptions({ page: 1, pageSize: 100, search: '' })
  );

  const selectedAgentId = watch("agentId");

  const handleFormSubmit = async (data: MeetingsInsert) => {
    try {
      setError("");
      const submitData = {
        ...data,
        startNow,
        scheduledStartTime: startNow ? new Date() : data.scheduledStartTime,
      };

      if (startNow && onStartNow) {
        await onStartNow(submitData);
      } else {
        await onSubmit(submitData);
      }

      if (!defaultValues) {
        reset();
        setStartNow(false);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  const handleCreateAgent = () => {
    router.push("/dashboard/agents");
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinDateTime = () => {
    const now = new Date();
    return formatDateTimeLocal(now);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-medium">
            Meeting Name
          </Label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="name"
              placeholder="Enter meeting name (e.g., Weekly Team Sync)"
              className="pl-10"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="agentId" className="text-gray-700 font-medium">
            Select Agent
          </Label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Select
                value={selectedAgentId || ""}
                onValueChange={(value) => setValue("agentId", value)}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-gray-400" />
                    <SelectValue placeholder="Choose an agent for this meeting" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {agentsData?.agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <span>{agent.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCreateAgent}
              className="flex-shrink-0 hover:bg-blue-50 hover:border-blue-200"
              title="Create a new agent"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {errors.agentId && (
            <p className="text-sm text-red-600">{errors.agentId.message}</p>
          )}
          {(!agentsData?.agents.length || agentsData.agents.length === 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                No agents available. Create your first agent to schedule meetings.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <Switch
              id="start-now"
              checked={startNow}
              onCheckedChange={setStartNow}
            />
            <div className="flex-1">
              <Label htmlFor="start-now" className="text-green-800 font-medium cursor-pointer">
                Start meeting now
              </Label>
              <p className="text-sm text-green-600">
                Skip scheduling and start the meeting immediately
              </p>
            </div>
            <Play className="w-5 h-5 text-green-600" />
          </div>

          {!startNow && (
            <div className="space-y-2">
              <Label htmlFor="scheduledStartTime" className="text-gray-700 font-medium">
                Schedule Date & Time
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="scheduledStartTime"
                  type="datetime-local"
                  min={getMinDateTime()}
                  className="pl-10"
                  {...register("scheduledStartTime", {
                    setValueAs: (value) => value ? new Date(value) : undefined
                  })}
                />
              </div>
              {errors.scheduledStartTime && (
                <p className="text-sm text-red-600">{errors.scheduledStartTime.message}</p>
              )}
              {!startNow && !watch("scheduledStartTime") && (
                <p className="text-sm text-amber-600">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Select a date and time to schedule the meeting, or enable "Start now" option
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !agentsData?.agents.length}
        className={`w-full transition-all duration-200 ${
          startNow
            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            {startNow ? "Starting..." : defaultValues ? "Updating..." : "Scheduling..."}
          </div>
        ) : (
          <div className="flex items-center">
            {startNow ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Meeting Now
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                {submitText}
              </>
            )}
          </div>
        )}
      </Button>
    </form>
  );
}