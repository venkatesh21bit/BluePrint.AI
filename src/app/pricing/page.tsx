import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Check, X, Shield, Zap } from 'lucide-react';
import { BuyMeACoffeeWidget } from '@/components/paywall/BuyMeACoffeeWidget';

export default async function PricingPage() {
  const session = await auth();
  
  let isExclusive = false;
  if (session?.user?.id) {
    const userRecords = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    if (userRecords[0]) {
      isExclusive = userRecords[0].isExclusive;
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 py-20 px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Exclusive</span>
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto text-balance">
          Unlock the full power of Blueprint.AI. Ditch the limits and rapidly iterate on unlimited startup ideas with full access to our multi-agent simulation engine.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">
        
        {/* Standard Plan */}
        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl flex flex-col backdrop-blur-md">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-neutral-400" />
              Standard
            </h2>
            <p className="text-neutral-400 text-sm">Perfect for trying out the platform.</p>
          </div>

          <div className="mb-8 text-3xl font-bold text-white">
            Free
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-sm text-neutral-300">
              <Check className="w-5 h-5 text-indigo-400" />
              Up to 3 Planner Chats
            </li>
            <li className="flex items-center gap-3 text-sm text-neutral-300">
              <Check className="w-5 h-5 text-indigo-400" />
              1 Workspace Initialization
            </li>
            <li className="flex items-center gap-3 text-sm text-neutral-300">
              <Check className="w-5 h-5 text-indigo-400" />
              1 Multi-Agent Simulation
            </li>
            <li className="flex items-center gap-3 text-sm text-neutral-500">
              <X className="w-5 h-5 text-neutral-600" />
              Unlimited Brainstorming
            </li>
            <li className="flex items-center gap-3 text-sm text-neutral-500">
              <X className="w-5 h-5 text-neutral-600" />
              Unlimited Simulations
            </li>
          </ul>

          <div className="mt-auto">
            <div className="w-full py-3 px-4 rounded-xl border border-white/10 text-center text-sm font-medium text-neutral-400 bg-white/[0.02]">
              Current Plan
            </div>
          </div>
        </div>

        {/* Exclusive Plan */}
        <div className="bg-indigo-950/20 border border-indigo-500/30 p-8 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-md shadow-2xl shadow-indigo-500/10">
          <div className="absolute top-0 right-0 p-4">
            <Zap className="w-6 h-6 text-amber-500 fill-amber-500/20" />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              Exclusive Membership
            </h2>
            <p className="text-indigo-200/80 text-sm">For serious founders and builders.</p>
          </div>

          <div className="mb-8 text-3xl font-bold text-white flex items-end gap-2">
            Buy Me a Coffee
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-sm text-white font-medium">
              <Check className="w-5 h-5 text-amber-500" />
              Unlimited Planner Chats
            </li>
            <li className="flex items-center gap-3 text-sm text-white font-medium">
              <Check className="w-5 h-5 text-amber-500" />
              Unlimited Workspace Initializations
            </li>
            <li className="flex items-center gap-3 text-sm text-white font-medium">
              <Check className="w-5 h-5 text-amber-500" />
              Unlimited Multi-Agent Simulations
            </li>
            <li className="flex items-center gap-3 text-sm text-indigo-200">
              <Check className="w-5 h-5 text-amber-500" />
              Priority Generations
            </li>
            <li className="flex items-center gap-3 text-sm text-indigo-200">
              <Check className="w-5 h-5 text-amber-500" />
              Instant automated upgrade via Webhook
            </li>
          </ul>

          <div className="mt-auto">
            {isExclusive ? (
              <div className="w-full py-3 px-4 rounded-xl border border-emerald-500/30 text-center text-sm font-medium text-emerald-400 bg-emerald-500/10">
                You are an Exclusive Member!
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <BuyMeACoffeeWidget />
                <p className="text-xs text-indigo-300 mt-4 text-center">
                  Make sure to use the same email address as your account so the webhook can automatically upgrade you.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
