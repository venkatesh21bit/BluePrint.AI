'use client';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { MasterExecutionPlanSchema } from '@/schemas/builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function ZeroToOneBuilder() {
  const [conceptInput, setConceptInput] = useState('');
  const { object, submit, isLoading, stop } = useObject({
    api: '/api/builder',
    schema: MasterExecutionPlanSchema,
  });

  const handleSubmit = () => {
    const prompt = conceptInput.trim() || "AI-based inventory manager for small local businesses.";
    submit({ conceptPrompt: prompt });
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Zero-to-One Builder Workspace</h1>
        <div className="flex gap-2">
          <Input
            value={conceptInput}
            onChange={(e) => setConceptInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="Describe your concept..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Streaming Architecture...' : 'Generate Build Plan'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-4 rounded-lg">
          <AlertCircle className="animate-spin" />
          <span>Generating architecture. Rendering progressive interface segments...</span>
          <Button size="sm" variant="outline" onClick={() => stop()}>Halt Stream</Button>
        </div>
      )}

      {/* Progressive Governance Safeguard Alert */}
      {object?.governance?.governanceWarning && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg flex items-start gap-3">
          <ShieldAlert className="text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900">Responsible AI Safeguard Advisory</h4>
            <p className="text-amber-800 text-sm">{object.governance.governanceWarning}</p>
          </div>
        </div>
      )}

      {/* Rendering System Components progressively using optional chaining */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* JTBD Display Card */}
        {object?.conceptName && (
          <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4 text-black">
            <h3 className="text-xl font-bold tracking-tight">Structured Concept: {object.conceptName}</h3>
            <div className="space-y-3">
              {object.jtbdFramework?.map((job, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm">
                  <span className="font-bold uppercase text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-200 rounded">
                    {job?.dimension}
                  </span>
                  <p className="mt-1 text-slate-700">
                    When <strong>{job?.situation}</strong>, I want to <strong>{job?.motivation}</strong>, so that I can <strong>{job?.outcome}</strong>.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mom Test Validation Coach Card */}
        {object?.momTestValidation && (
          <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4 text-black col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold tracking-tight">The Mom Test Coach {object.momTestValidation.executionWorkflow ? `(${object.momTestValidation.executionWorkflow})` : ''}</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm uppercase text-slate-500 mb-1">Target Hypothesis</h4>
                <p className="text-slate-800">{object.momTestValidation.targetHypothesis}</p>
              </div>

              {object.momTestValidation.validationMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 text-blue-900 rounded-lg">
                    <span className="text-xs uppercase font-bold">Quality Score</span>
                    <p className="text-xl font-black">{object.momTestValidation.validationMetrics.interviewQualityScore}</p>
                  </div>
                  <div className="p-3 bg-green-50 text-green-900 rounded-lg">
                    <span className="text-xs uppercase font-bold">Empirical Facts</span>
                    <p className="text-xl font-black">{object.momTestValidation.validationMetrics.empiricalFactsCount}</p>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-900 rounded-lg">
                    <span className="text-xs uppercase font-bold">Hypothetical</span>
                    <p className="text-xl font-black">{object.momTestValidation.validationMetrics.hypotheticalSpeculationsCount}</p>
                  </div>
                  <div className="p-3 bg-red-50 text-red-900 rounded-lg">
                    <span className="text-xs uppercase font-bold">Compliment Traps</span>
                    <p className="text-xl font-black">{object.momTestValidation.validationMetrics.complimentTrapsCount}</p>
                  </div>
                </div>
              )}

              {object.momTestValidation.behavioralQuestions && object.momTestValidation.behavioralQuestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm uppercase text-slate-500 mb-2">Behavioral Questions</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {object.momTestValidation.behavioralQuestions.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
              )}

              {object.momTestValidation.auditReport && object.momTestValidation.auditReport.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm uppercase text-slate-500 mb-2">Audit Report</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {object.momTestValidation.auditReport.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              {object.momTestValidation.recommendedActionPlan && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <h4 className="font-semibold text-sm uppercase text-indigo-500 mb-1">Recommended Action Plan: {object.momTestValidation.recommendedActionPlan.verdict}</h4>
                  <p className="text-indigo-900 text-sm">{object.momTestValidation.recommendedActionPlan.cheapestExperiment}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assumptions Map */}
        {object?.prioritizedAssumptions && (
          <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4 text-black">
            <h3 className="text-xl font-bold tracking-tight">Assumption Prioritization Map</h3>
            <div className="space-y-2">
              {object.prioritizedAssumptions?.map((assump, idx) => (
                <div key={idx} className="p-3 border rounded-lg flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{assump?.statement}</p>
                    <p className="text-xs text-slate-400">Score: {assump?.validationScore?.toFixed(2)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(assump?.validationScore ?? 0) > 0.6 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {(assump?.validationScore ?? 0) > 0.6 ? 'RISK: TEST ASAP' : 'MONITOR'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestones Roadmap */}
        {object?.milestones && object?.milestones?.length > 0 && (
          <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4 text-black col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold tracking-tight">📍 30/60/90 Day Roadmap</h3>
            <div className="space-y-4">
              {object.milestones?.map((milestone, idx) => (
                <div key={idx} className="p-4 border-l-4 border-blue-500 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800">{milestone?.phase}</h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                      {milestone?.tasks?.length || 0} Tasks
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{milestone?.objective}</p>
                  {milestone?.tasks && milestone?.tasks?.length > 0 && (
                    <ul className="space-y-2">
                      {milestone.tasks?.map((task, taskIdx) => (
                        <li key={taskIdx} className="text-sm p-2 bg-white rounded border border-slate-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-slate-700">{task?.title}</p>
                              <p className="text-xs text-slate-500">{task?.durationDays} days • {task?.complexity}</p>
                            </div>
                            {task?.dependencies && task?.dependencies?.length > 0 && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                Blocked by {task?.dependencies?.length}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}