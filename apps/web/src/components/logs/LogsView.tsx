import type { AgentStepLog, AnalyticsSummary } from "@marketing/shared";
import { MetricCard } from "../common/MetricCard";

interface LogsViewProps {
  analytics: AnalyticsSummary;
  logs: AgentStepLog[];
}

const statusColor: Record<string, string> = {
  completed: "text-sage bg-card-sage",
  failed: "text-coral bg-card-blush",
};

import { Users, Zap, Clock } from "lucide-react";

export const LogsView = ({ analytics, logs }: LogsViewProps) => {
  return (
    <div className="card-elevated card-elevated-neutral panel-surface space-y-6">
      <div className="flex flex-wrap items-center gap-14 py-2">
        <MetricCard label="Total Runs" value={analytics.totalRuns} accent="gold" icon={Users} />
        <MetricCard label="Success Rate" value={`${analytics.successRate}%`} accent="sage" icon={Zap} />
        <MetricCard label="Avg Runtime" value={`${Math.round(analytics.averageRuntimeMs / 1000)}s`} accent="sky" icon={Clock} />
      </div>

      <div className="mt-2 pt-5 border-t border-border-warm/30">
        <div className="flex items-center justify-between mb-4 pb-0">
          <div className="text-label">Telemetry</div>
          <span className="text-label-small opacity-40">{logs.length} entries</span>
        </div>
        <div className="pr-1">
          {logs.slice(0, 100).map((log, index) => (
            <div
              key={log.id}
              className={`px-4 py-3 transition-all border-b border-border-warm/10 last:border-0 hover:bg-page/40 rounded-md`}
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="heading-md text-primary">{log.stepName}</span>
                <span className={`inline-flex items-center px-3 py-0.5 text-[11px] font-semibold rounded-pill capitalize ${statusColor[log.status] ?? "text-secondary bg-page"}`}>
                  {log.status}
                </span>
              </div>
              <code className="font-mono text-[11px] text-secondary bg-page px-2 py-0.5 rounded-md">
                {log.runId}
              </code>
              <p className="text-[13px] text-secondary mt-1">{log.message}</p>
              {log.errorMessage ? (
                <p className="text-[13px] text-coral mt-1">{log.errorMessage}</p>
              ) : null}
            </div>
          ))}
          {logs.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border-warm/30 rounded-2xl">
              <p className="text-muted text-[13px] font-medium opacity-40">No telemetry data available.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
