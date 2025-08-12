"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Sparkles } from "lucide-react";
import { agentsInsertSchema, type AgentsInsert } from "../../schema";

interface AgentFormProps {
  defaultValues?: Partial<AgentsInsert>;
  onSubmit: (data: AgentsInsert) => Promise<void>;
  submitText?: string;
  isLoading?: boolean;
}

export function AgentForm({
  defaultValues,
  onSubmit,
  submitText = "Create Agent",
  isLoading = false,
}: AgentFormProps) {
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AgentsInsert>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: AgentsInsert) => {
    try {
      setError("");
      await onSubmit(data);
      if (!defaultValues) {
        reset();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
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
            Agent Name
          </Label>
          <div className="relative">
            <Bot className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="name"
              placeholder="Enter agent name (e.g., Sales Assistant)"
              className="pl-10"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions" className="text-gray-700 font-medium">
            Instructions
          </Label>
          <div className="relative">
            <Sparkles className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Textarea
              id="instructions"
              placeholder="Describe what this agent should do, its personality, and any specific guidelines..."
              className="pl-10 min-h-32 resize-none"
              {...register("instructions")}
            />
          </div>
          {errors.instructions && (
            <p className="text-sm text-red-600">{errors.instructions.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Provide clear instructions to help your agent understand its role and responsibilities.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            {defaultValues ? "Updating..." : "Creating..."}
          </div>
        ) : (
          submitText
        )}
      </Button>
    </form>
  );
}