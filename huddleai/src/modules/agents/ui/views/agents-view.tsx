// src/modules/agents/ui/views/agents-view.tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, Settings, Play, Pause, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AgentsView = () => {
    const trpc = useTRPC();
    
    const { data: agents } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

    if (!agents || agents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                    <Bot className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No AI Agents Yet
                </h3>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto">
                    {JSON.stringify(agents, null, 2)}
            </pre>
        </div>
    );
};