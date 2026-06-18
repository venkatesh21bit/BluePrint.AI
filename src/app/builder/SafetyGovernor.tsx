import { SafetyGovernorSchema } from "@/schemas/builder";
import { z } from "zod";

type SafetyGovernorType = z.infer<typeof SafetyGovernorSchema>;

interface SafetyGovernorProps {
  governor: SafetyGovernorType | undefined;
}

export function SafetyGovernor({ governor }: SafetyGovernorProps) {
  // Handle undefined case - don't render if no governor data
  if (!governor) {
    return null;
  }

  const tokenUsagePercent = (governor.estimatedTokensUsed / governor.maxTokensAllowed) * 100;
  const stepUsagePercent = (governor.currentStepCount / 5) * 100;

  return (
    <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-black">Safety Governor</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            governor.isPaused
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {governor.isPaused ? "⏸ PAUSED" : "✓ RUNNING"}
        </span>
      </div>

      {/* Execution Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Step Count */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">
            Execution Steps
          </label>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-black">
              {governor.currentStepCount}
            </span>
            <span className="text-sm text-slate-500">/ 5</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${stepUsagePercent}%` }}
            />
          </div>
        </div>

        {/* Token Usage */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">
            Token Budget
          </label>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-black">
              {governor.estimatedTokensUsed}
            </span>
            <span className="text-sm text-slate-500">
              / {governor.maxTokensAllowed}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                tokenUsagePercent > 80 ? "bg-red-500" : "bg-green-500"
              }`}
              style={{ width: `${tokenUsagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">
            Confidence Score
          </label>
          <span className="text-lg font-bold text-black">
            {(governor.confidenceScore * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              governor.confidenceScore >= 0.7 ? "bg-green-500" : "bg-amber-500"
            }`}
            style={{ width: `${governor.confidenceScore * 100}%` }}
          />
        </div>
        {governor.confidenceScore < 0.7 && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠️ Confidence below 0.70 threshold
          </p>
        )}
      </div>

      {/* Compliance Flags */}
      {governor.complianceFlags.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-bold text-red-700 mb-2">
            🚩 Compliance Flags
          </h4>
          <ul className="space-y-1">
            {governor.complianceFlags.map((flag, index) => (
              <li key={index} className="text-sm text-red-600">
                • {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Approval Banner */}
      {governor.approvalRequired && (
        <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
          <h4 className="text-sm font-bold text-amber-800 mb-1">
            🛑 Human Approval Required
          </h4>
          <p className="text-sm text-amber-700 mb-3">{governor.nextAction}</p>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700">
              ✓ Approve
            </button>
            <button className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700">
              ✕ Reject
            </button>
          </div>
        </div>
      )}

      {/* Normal Status Message */}
      {!governor.approvalRequired && (
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            ✓ {governor.nextAction}
          </p>
        </div>
      )}
    </div>
  );
}