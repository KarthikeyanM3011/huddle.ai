@@ .. @@
   const createMeetingMutation = useMutation({
     ...trpc.meetings.create.mutationOptions(),
     onSuccess: () => {
       toast.success("Meeting scheduled successfully!");
       setIsCreateDialogOpen(false);
       queryClient.invalidateQueries({ queryKey: ['meetings'] });
+      queryClient.invalidateQueries({ queryKey: ['calendar'] });
     },
     onError: (error: any) => {
       toast.error(error.message || "Failed to schedule meeting");
     },
   });

   const handleCreateMeeting = async (data: MeetingsInsert) => {
     createMeetingMutation.mutate(data);
   };