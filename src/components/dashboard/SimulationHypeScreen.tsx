import React from 'react';
import { Bot, Users, Zap, Layers, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SimulationHypeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#020202] text-center max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
        <Bot className="w-10 h-10 text-indigo-400 relative z-10" />
      </div>
      
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 text-balance">
        Multi-Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Simulation Engine</span>
      </h2>
      
      <p className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl text-pretty leading-relaxed">
        Stop guessing how users will react. Watch autonomous AI personas talk to each other like real-world humans to stress-test your startup ideas before writing a single line of code.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 text-left hover:border-indigo-500/30 transition-colors">
          <Users className="w-8 h-8 text-emerald-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Real Human Personas</h3>
          <p className="text-sm text-neutral-400">Agents are imbued with distinct biases, friction points, and domain expertise. They argue, agree, and collaborate naturally.</p>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 text-left hover:border-indigo-500/30 transition-colors">
          <Layers className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Deep Conversation Rounds</h3>
          <p className="text-sm text-neutral-400">Configure up to 10 back-and-forth debate rounds. Watch ideas evolve as agents challenge each other's assumptions.</p>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 text-left hover:border-indigo-500/30 transition-colors">
          <Zap className="w-8 h-8 text-amber-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Parallel LLM Calls</h3>
          <p className="text-sm text-neutral-400">Powered by massively parallel LLM execution. Simulate hours of customer interviews and board meetings in seconds.</p>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 text-left hover:border-indigo-500/30 transition-colors">
          <Bot className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Unbiased Synthesis</h3>
          <p className="text-sm text-neutral-400">A master evaluator agent monitors the entire simulation to extract high-signal insights, invalidating your risky assumptions.</p>
        </div>
      </div>

      <Button className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 rounded-xl text-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] group cursor-not-allowed opacity-80" disabled>
        <PlayCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        Simulation Workspace (Coming Soon)
      </Button>
    </div>
  );
}
