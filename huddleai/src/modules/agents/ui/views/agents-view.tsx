"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { AgentForm } from "../components/agent-form";
import { useAgentFilters } from "../../hooks/use-agent-filters";
import { Bot, Plus, Search, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { type AgentsInsert } from "../../schema";

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

export const AgentsView = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useAgentFilters();
  
  // Debounce search input by 500ms
  const debouncedSearch = useDebounce(searchInput, 2000);

  // Update URL search param when debounced search changes
  useEffect(() => {
    setFilters({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch, setFilters]);

  // Initialize search input from URL on mount
  useEffect(() => {
    setSearchInput(filters.search);
  }, []);

  const { data: agentsData, isLoading, refetch } = useQuery(
    trpc.agents.getMany.queryOptions(filters)
  );

  const createAgentMutation = useMutation({
    ...trpc.agents.create.mutationOptions(),
    onSuccess: () => {
      toast.success("Agent created successfully!");
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create agent");
    },
  });

  const handleCreateAgent = async (data: AgentsInsert) => {
    createAgentMutation.mutate(data);
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

  const handleAgentClick = (agentId: string) => {
    router.push(`/dashboard/agents/${agentId}`);
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

  const agents = agentsData?.agents || [];
  const pagination = agentsData?.pagination;

  if (!agents.length && !filters.search) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
            <p className="text-gray-600">Create and manage your AI assistants</p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Agent
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center">
              <Bot className="w-12 h-12 text-blue-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Create Your First AI Agent
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Build intelligent assistants tailored to your needs. Define their personality, 
            capabilities, and let them help automate your workflows.
          </p>
          
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Agent
          </Button>
        </div>

        <ResponsiveDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          title="Create New Agent"
          description="Build an AI assistant tailored to your specific needs and workflows."
        >
          <AgentForm
            onSubmit={handleCreateAgent}
            isLoading={createAgentMutation.isPending}
          />
        </ResponsiveDialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
          <p className="text-gray-600">
            {pagination?.total} agent{pagination?.total !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Agent
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <form onSubmit={handleSearchSubmit}>
            <Input
              placeholder="Search agents... (Press Enter to search)"
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
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <Search className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No agents found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search terms or create a new agent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card 
              key={agent.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-gray-200/50"
              onClick={() => handleAgentClick(agent.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {agent.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {agent.meetingsCount} meetings
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {agent.instructions}
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  Created {new Date(agent.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
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
        title="Create New Agent"
        description="Build an AI assistant tailored to your specific needs and workflows."
      >
        <AgentForm
          onSubmit={handleCreateAgent}
          isLoading={createAgentMutation.isPending}
        />
      </ResponsiveDialog>
    </div>
  );
};