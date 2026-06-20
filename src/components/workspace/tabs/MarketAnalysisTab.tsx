import { motion } from 'framer-motion';
import { useStreaming } from '@/contexts/StreamingContext';
import { GlassCard } from '@/components/ui/glass-card';

export default function MarketAnalysisTab() {
  const { object } = useStreaming();

  const data = object?.marketAnalysis;

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground p-8 text-center">
        Market analysis data is currently being generated...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      <div>
        <h2 className="text-2xl font-bold mb-2">Market Analysis & Strategy</h2>
        <p className="text-muted-foreground">
          Comprehensive market sizing, competitor landscape, and Go-To-Market approach.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 space-y-4">
          <div className="text-sm font-mono text-indigo-400 uppercase tracking-wider">Total Addressable Market (TAM)</div>
          <p className="text-sm text-white/90 leading-relaxed">{data.tam}</p>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <div className="text-sm font-mono text-blue-400 uppercase tracking-wider">Serviceable Available Market (SAM)</div>
          <p className="text-sm text-white/90 leading-relaxed">{data.sam}</p>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <div className="text-sm font-mono text-purple-400 uppercase tracking-wider">Serviceable Obtainable Market (SOM)</div>
          <p className="text-sm text-white/90 leading-relaxed">{data.som}</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-4">
          <div className="text-sm font-mono text-emerald-400 uppercase tracking-wider mb-4">Competitor Landscape</div>
          <ul className="space-y-3">
            {data.competitors?.map((comp: string, i: number) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 text-sm text-white/80 bg-white/5 p-3 rounded-lg border border-white/10"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500/50 flex-shrink-0" />
                {comp}
              </motion.li>
            ))}
          </ul>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div className="text-sm font-mono text-rose-400 uppercase tracking-wider">Target Audience</div>
            <p className="text-sm text-white/90 leading-relaxed">{data.targetAudience}</p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div className="text-sm font-mono text-amber-400 uppercase tracking-wider">Go-To-Market Strategy</div>
            <p className="text-sm text-white/90 leading-relaxed">{data.gtmStrategy}</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
