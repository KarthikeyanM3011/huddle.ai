@@ .. @@
 "use client";

 import { useState } from "react";
 import { useForm } from "react-hook-form";
 import { zodResolver } from "@hookform/resolvers/zod";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
 import { Alert, AlertDescription } from "@/components/ui/alert";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
-import { Video, Sparkles, Bot, Plus } from "lucide-react";
+import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
+import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
+import { Video, Sparkles, Bot, Plus, Calendar, Clock, Zap } from "lucide-react";
 import { meetingsInsertSchema, type MeetingsInsert } from "../../schema";
 import { useTRPC } from "@/trpc/client";
 import { useQuery } from "@tanstack/react-query";
 import { useRouter } from "next/navigation";

 interface MeetingFormProps {
+  defaultDate?: Date;
   defaultValues?: Partial<MeetingsInsert>;
   onSubmit: (data: MeetingsInsert) => Promise<void>;
   submitText?: string;
   isLoading?: boolean;
 }

+const durationOptions = [
+  { value: 15, label: '15 minutes' },
+  { value: 30, label: '30 minutes' },
+  { value: 60, label: '1 hour' },
+  { value: 120, label: '2 hours' },
+  { value: 240, label: '4 hours' },
+];
+
 export function MeetingForm({
+  defaultDate,
   defaultValues,
   onSubmit,
   submitText = "Schedule Meeting",
   isLoading = false,
 }: MeetingFormProps) {
   const [error, setError] = useState<string>("");
+  const [meetingType, setMeetingType] = useState<'scheduled' | 'random'>('random');
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
-    defaultValues,
+    defaultValues: {
+      ...defaultValues,
+      type: 'random',
+      estimatedDuration: 30,
+      scheduledStartTime: defaultDate || new Date(),
+    },
   });

   const { data: agentsData } = useQuery(
     trpc.agents.getMany.queryOptions({ page: 1, pageSize: 100, search: '' })
   );

   const selectedAgentId = watch("agentId");
+  const selectedDuration = watch("estimatedDuration");

   const handleFormSubmit = async (data: MeetingsInsert) => {
     try {
       setError("");
+      
+      if (meetingType === 'random') {
+        data.scheduledStartTime = new Date();
+        data.type = 'random';
+      } else {
+        data.type = 'scheduled';
+      }
+      
       await onSubmit(data);
       if (!defaultValues) {
         reset();
       }
     } catch (err: any) {
       setError(err.message || "Something went wrong");
     }
   };

   const handleCreateAgent = () => {
     router.push("/dashboard/agents");
   };

+  const formatDateTime = (date: Date) => {
+    return date.toISOString().slice(0, 16);
+  };
+
+  const handleDateTimeChange = (value: string) => {
+    setValue("scheduledStartTime", new Date(value));
+  };

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

+        <Tabs value={meetingType} onValueChange={(value) => setMeetingType(value as 'scheduled' | 'random')}>
+          <TabsList className="grid w-full grid-cols-2">
+            <TabsTrigger value="random" className="flex items-center space-x-2">
+              <Zap className="w-4 h-4" />
+              <span>Start Now</span>
+            </TabsTrigger>
+            <TabsTrigger value="scheduled" className="flex items-center space-x-2">
+              <Calendar className="w-4 h-4" />
+              <span>Schedule</span>
+            </TabsTrigger>
+          </TabsList>
+
+          <TabsContent value="random" className="space-y-4 mt-4">
+            <Card className="bg-orange-50/50 border-orange-200/50">
+              <CardHeader className="pb-3">
+                <CardTitle className="text-sm font-medium text-orange-900 flex items-center space-x-2">
+                  <Zap className="w-4 h-4" />
+                  <span>Instant Meeting</span>
+                </CardTitle>
+              </CardHeader>
+              <CardContent className="space-y-4">
+                <div className="space-y-2">
+                  <Label htmlFor="estimatedDuration" className="text-gray-700 font-medium">
+                    Estimated Duration
+                  </Label>
+                  <Select
+                    value={selectedDuration?.toString() || "30"}
+                    onValueChange={(value) => setValue("estimatedDuration", parseInt(value))}
+                  >
+                    <SelectTrigger className="w-full">
+                      <div className="flex items-center space-x-2">
+                        <Clock className="w-4 h-4 text-gray-400" />
+                        <SelectValue placeholder="Select duration" />
+                      </div>
+                    </SelectTrigger>
+                    <SelectContent>
+                      {durationOptions.map((option) => (
+                        <SelectItem key={option.value} value={option.value.toString()}>
+                          {option.label}
+                        </SelectItem>
+                      ))}
+                    </SelectContent>
+                  </Select>
+                </div>
+                
+                <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
+                  <p className="text-sm text-orange-800">
+                    This meeting will start immediately and be logged on your calendar with the actual start/end times.
+                  </p>
+                </div>
+              </CardContent>
+            </Card>
+          </TabsContent>
+
+          <TabsContent value="scheduled" className="space-y-4 mt-4">
+            <Card className="bg-blue-50/50 border-blue-200/50">
+              <CardHeader className="pb-3">
+                <CardTitle className="text-sm font-medium text-blue-900 flex items-center space-x-2">
+                  <Calendar className="w-4 h-4" />
+                  <span>Schedule Details</span>
+                </CardTitle>
+              </CardHeader>
+              <CardContent className="space-y-4">
+                <div className="space-y-2">
+                  <Label htmlFor="scheduledStartTime" className="text-gray-700 font-medium">
+                    Date & Time
+                  </Label>
+                  <Input
+                    id="scheduledStartTime"
+                    type="datetime-local"
+                    value={formatDateTime(watch("scheduledStartTime") || new Date())}
+                    onChange={(e) => handleDateTimeChange(e.target.value)}
+                    className="w-full"
+                    min={formatDateTime(new Date())}
+                  />
+                  {errors.scheduledStartTime && (
+                    <p className="text-sm text-red-600">{errors.scheduledStartTime.message}</p>
+                  )}
+                </div>
+
+                <div className="space-y-2">
+                  <Label htmlFor="estimatedDuration" className="text-gray-700 font-medium">
+                    Duration
+                  </Label>
+                  <Select
+                    value={selectedDuration?.toString() || "30"}
+                    onValueChange={(value) => setValue("estimatedDuration", parseInt(value))}
+                  >
+                    <SelectTrigger className="w-full">
+                      <div className="flex items-center space-x-2">
+                        <Clock className="w-4 h-4 text-gray-400" />
+                        <SelectValue placeholder="Select duration" />
+                      </div>
+                    </SelectTrigger>
+                    <SelectContent>
+                      {durationOptions.map((option) => (
+                        <SelectItem key={option.value} value={option.value.toString()}>
+                          {option.label}
+                        </SelectItem>
+                      ))}
+                    </SelectContent>
+                  </Select>
+                  {errors.estimatedDuration && (
+                    <p className="text-sm text-red-600">{errors.estimatedDuration.message}</p>
+                  )}
+                </div>
+              </CardContent>
+            </Card>
+          </TabsContent>
+        </Tabs>
       </div>

       <Button
         type="submit"
         disabled={isLoading || !agentsData?.agents.length}
         className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
       >
         {isLoading ? (
           <div className="flex items-center">
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
-            {defaultValues ? "Updating..." : "Scheduling..."}
+            {defaultValues ? "Updating..." : meetingType === 'scheduled' ? "Scheduling..." : "Starting..."}
           </div>
         ) : (
           <div className="flex items-center">
-            <Video className="w-4 h-4 mr-2" />
-            {submitText}
+            {meetingType === 'scheduled' ? (
+              <>
+                <Calendar className="w-4 h-4 mr-2" />
+                {submitText}
+              </>
+            ) : (
+              <>
+                <Zap className="w-4 h-4 mr-2" />
+                Start Meeting Now
+              </>
+            )}
           </div>
         )}
       </Button>
     </form>
   );
 }