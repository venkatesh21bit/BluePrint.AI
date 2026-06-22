import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { User, Mail, Zap, CheckCircle2, MessageSquareText, Blocks, Bot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userRecords = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  const user = userRecords[0];

  if (!user) {
    redirect('/auth/signin');
  }

  const CHAT_LIMIT = 3;
  const WORKSPACE_LIMIT = 1;
  const SIMULATION_LIMIT = 1;

  const chatPercentage = Math.min((user.chatCount / CHAT_LIMIT) * 100, 100);
  const workspacePercentage = Math.min((user.workspaceInitCount / WORKSPACE_LIMIT) * 100, 100);
  const simulationPercentage = Math.min((user.simulationCount / SIMULATION_LIMIT) * 100, 100);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-8 pt-12 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-2xl backdrop-blur-md">
          {session.user.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || "Avatar"} 
              className="w-24 h-24 rounded-full border-4 border-white/10 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-600/20 border-4 border-indigo-500/30 flex items-center justify-center">
              <User className="w-10 h-10 text-indigo-400" />
            </div>
          )}
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight">{session.user.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-neutral-400">
              <Mail className="w-4 h-4" />
              <span>{session.user.email}</span>
            </div>
            
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 shadow-sm">
              {user.isExclusive ? (
                <>
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  <span className="text-sm font-medium text-amber-500">Exclusive Member</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-neutral-500" />
                  <span className="text-sm font-medium text-neutral-400">Standard Account</span>
                </>
              )}
            </div>
          </div>

          {!user.isExclusive && (
            <div className="mt-6 md:mt-0 flex flex-col items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
              <span className="text-sm text-indigo-200 font-medium">Unlock Unlimited Access</span>
              <Link href="/pricing">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-0">
                  Upgrade Now 💎
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Usage Limits Section */}
        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl backdrop-blur-md">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Blocks className="w-5 h-5 text-indigo-400" />
            Usage Limits
          </h2>

          {user.isExclusive ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-black/20 rounded-xl border border-white/5">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Unlimited Access Unlocked</h3>
              <p className="text-neutral-400 max-w-sm">
                Thank you for being an Exclusive Member. You have unlimited access to all AI agents, workspace generations, and simulation engines.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Chat Limit */}
              <div className="bg-black/30 p-5 rounded-xl border border-white/5 flex flex-col">
                <div className="flex items-center gap-2 text-neutral-400 mb-4">
                  <MessageSquareText className="w-4 h-4" />
                  <span className="text-sm font-medium">Planner Chats</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {user.chatCount} <span className="text-base font-normal text-neutral-500">/ {CHAT_LIMIT}</span>
                </div>
                <div className="mt-auto pt-4">
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${chatPercentage >= 100 ? 'bg-red-500' : 'bg-indigo-500'}`}
                      style={{ width: `${chatPercentage}%` }}
                    />
                  </div>
                  {chatPercentage >= 100 && <p className="text-xs text-red-400 mt-2">Limit reached</p>}
                </div>
              </div>

              {/* Workspace Limit */}
              <div className="bg-black/30 p-5 rounded-xl border border-white/5 flex flex-col">
                <div className="flex items-center gap-2 text-neutral-400 mb-4">
                  <Blocks className="w-4 h-4" />
                  <span className="text-sm font-medium">Workspaces</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {user.workspaceInitCount} <span className="text-base font-normal text-neutral-500">/ {WORKSPACE_LIMIT}</span>
                </div>
                <div className="mt-auto pt-4">
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${workspacePercentage >= 100 ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${workspacePercentage}%` }}
                    />
                  </div>
                  {workspacePercentage >= 100 && <p className="text-xs text-red-400 mt-2">Limit reached</p>}
                </div>
              </div>

              {/* Simulation Limit */}
              <div className="bg-black/30 p-5 rounded-xl border border-white/5 flex flex-col">
                <div className="flex items-center gap-2 text-neutral-400 mb-4">
                  <Bot className="w-4 h-4" />
                  <span className="text-sm font-medium">Simulations</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {user.simulationCount} <span className="text-base font-normal text-neutral-500">/ {SIMULATION_LIMIT}</span>
                </div>
                <div className="mt-auto pt-4">
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${simulationPercentage >= 100 ? 'bg-red-500' : 'bg-pink-500'}`}
                      style={{ width: `${simulationPercentage}%` }}
                    />
                  </div>
                  {simulationPercentage >= 100 && <p className="text-xs text-red-400 mt-2">Limit reached</p>}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
