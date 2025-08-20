@@ .. @@
 'use client';

 import { authClient } from '@/lib/auth-client';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { 
   Bot, 
   Calendar,
   ArrowRight,
   Plus
 } from 'lucide-react';
 import { useRouter } from 'next/navigation';

 export default function Dashboard() {
   const { data: session } = authClient.useSession();
   const router = useRouter();

   if (!session) {
     return null;
   }

   const quickActions = [
     {
       title: 'Schedule Meeting',
       description: 'Create a new meeting with AI assistance',
       icon: Calendar,
       action: () => router.push('/dashboard/meetings'),
       color: 'from-blue-500 to-indigo-600'
     },
     {
       title: 'Create Agent',
       description: 'Build a new AI agent for your workflow',
       icon: Bot,
       action: () => router.push('/dashboard/agents'),
       color: 'from-purple-500 to-violet-600'
     },
+    {
+      title: 'View Calendar',
+      description: 'Manage your schedule and events',
+      icon: Calendar,
+      action: () => router.push('/dashboard/calendar'),
+      color: 'from-green-500 to-emerald-600'
+    },
   ];

   return (
     <div className="p-6 space-y-6">
       <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white">
         <div className="relative">
           <div className="flex items-center justify-between">
             <div>
               <h1 className="text-2xl font-bold mb-1">
                 Welcome back, {session.user.name?.split(' ')[0]}! 👋
               </h1>
               <p className="text-blue-100">
                 Ready to supercharge your productivity with AI?
               </p>
             </div>
           </div>
           <div className="mt-4 flex gap-3">
             <Button 
               onClick={() => router.push('/dashboard/meetings')}
               className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-200"
               variant="outline"
               size="sm"
             >
               <Plus className="w-4 h-4 mr-2" />
               New Meeting
             </Button>
             <Button 
               onClick={() => router.push('/dashboard/agents')}
               className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-200"
               variant="outline"
               size="sm"
             >
               <Bot className="w-4 h-4 mr-2" />
               Create Agent
             </Button>
+            <Button 
+              onClick={() => router.push('/dashboard/calendar')}
+              className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-200"
+              variant="outline"
+              size="sm"
+            >
+              <Calendar className="w-4 h-4 mr-2" />
+              Calendar
+            </Button>
           </div>
         </div>
       </div>

-      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
+      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {quickActions.map((action) => {
           const IconComponent = action.icon;
           return (
             <Card 
               key={action.title} 
               className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] group cursor-pointer"
               onClick={action.action}
             >
               <CardContent className="p-4">
                 <div className="flex items-start gap-4">
                   <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0`}>
                     <IconComponent className="w-5 h-5 text-white" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                       {action.title}
                     </h3>
                     <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                       {action.description}
                     </p>
                   </div>
                   <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                 </div>
               </CardContent>
             </Card>
           );
         })}
       </div>
     </div>
   );
 }