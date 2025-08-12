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
import { AgentForm } from "../components/agent-form";
import { Bot, Edit, Trash2, ArrowLeft, Calendar, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { type AgentsInsert } from "../../schema";

interface AgentDetailViewProps {
  agentId: string;
}

export const AgentDetailView = ({ agentId }: AgentDetailViewProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const { data: agent } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId })
  );

  const updateAgentMutation = useMutation({
    ...trpc.agents.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Agent updated successfully!");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update agent");
    },
  });

  const deleteAgentMutation = useMutation({
    ...trpc.agents.remove.mutationOptions(),
    onSuccess: () => {
      toast.success("Agent deleted successfully!");
      router.push("/dashboard/agents");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete agent");
      setIsDeleteDialogOpen(false);
    },
  });

  const handleUpdateAgent = async (data: AgentsInsert) => {
    updateAgentMutation.mutate({
      id: agentId,
      data,
    });
  };

  const handleDeleteAgent = async () => {
    deleteAgentMutation.mutate({ id: agentId });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/agents")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agents
          </Button>
          <div className="w-px h-6 bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {agent.meetingsCount} meetings
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Created {new Date(agent.createdAt).toLocaleDateString()}
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
                <span>Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {agent.instructions}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Meetings Completed</p>
                    <p className="text-sm text-gray-600">Total interactions with users</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {agent.meetingsCount}
                  </div>
                </div>
                
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">More detailed analytics coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <Bot className="w-5 h-5" />
                <span>Agent Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-blue-800">Agent ID</label>
                <p className="text-sm text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded mt-1">
                  {agent.id}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-blue-800">Created</label>
                <p className="text-sm text-blue-700 mt-1">
                  {new Date(agent.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-blue-800">Last Updated</label>
                <p className="text-sm text-blue-700 mt-1">
                  {new Date(agent.updatedAt).toLocaleString()}
                </p>
              </div>
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
                Edit Agent Details
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Agent
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ResponsiveDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Agent"
        description="Update your agent's information and instructions."
      >
        <AgentForm
          defaultValues={{
            name: agent.name,
            instructions: agent.instructions,
          }}
          onSubmit={handleUpdateAgent}
          submitText="Update Agent"
          isLoading={updateAgentMutation.isPending}
        />
      </ResponsiveDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{agent.name}"? This action cannot be undone.
              All associated data and configurations will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAgentMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              disabled={deleteAgentMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteAgentMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Deleting...
                </div>
              ) : (
                "Delete Agent"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};