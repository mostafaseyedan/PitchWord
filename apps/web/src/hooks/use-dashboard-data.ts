import { useEffect, useMemo, useState } from "react";
import type { AgentStepLog, AnalyticsSummary, EventMessage, Run } from "@marketing/shared";
import { apiClient } from "../api/client";

const defaultSummary: AnalyticsSummary = {
  totalRuns: 0,
  successRate: 0,
  averageRuntimeMs: 0,
  runsByTone: {
    professional: 0,
    urgent_hiring: 0,
    educational: 0,
    sales_focused: 0,
    funny: 0,
    engaging: 0,
    casual: 0,
    absurd: 0
  },
  runsByCategory: {
    industry_news: 0,
    customer_pain_point: 0,
    company_update: 0,
    hiring: 0,
    product_education: 0,
    infor: 0,
    team: 0
  },
  stepFailureCounts: {
    news_hunter: 0,
    content_creator: 0,
    image_agent: 0,
    video_agent: 0,
    teams_delivery: 0
  }
};

export const useDashboardData = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [logs, setLogs] = useState<AgentStepLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let reconnectDelayMs = 1000;

    const load = async (showLoading = false): Promise<void> => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        const [nextRuns, nextLogs, nextAnalytics] = await Promise.all([
          apiClient.listRuns(),
          apiClient.listLogs(),
          apiClient.getAnalyticsSummary()
        ]);

        if (!active) {
          return;
        }

        setRuns(nextRuns);
        setLogs(nextLogs);
        setAnalytics(nextAnalytics);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      } finally {
        if (active && showLoading) {
          setLoading(false);
        }
      }
    };

    load(true).catch(() => {
      // handled inside load
    });

    const onRunUpdate = (event: MessageEvent): void => {
      const run = JSON.parse(event.data) as Run;
      setRuns((current) => {
        const idx = current.findIndex((entry) => entry.id === run.id);
        if (idx === -1) {
          return [run, ...current];
        }
        const next = [...current];
        next[idx] = run;
        return next;
      });
    };

    const onLogAdd = (event: MessageEvent): void => {
      const log = JSON.parse(event.data) as AgentStepLog;
      setLogs((current) => [log, ...current]);
    };

    const connect = (): void => {
      if (!active) {
        return;
      }

      source = apiClient.createEventSource();
      source.addEventListener("run_updated", onRunUpdate as EventListener);
      source.addEventListener("log_added", onLogAdd as EventListener);

      source.onopen = () => {
        reconnectDelayMs = 1000;
        void load(false);
      };

      source.onerror = () => {
        source?.close();
        source = null;
        if (!active) {
          return;
        }
        reconnectTimer = setTimeout(() => {
          connect();
        }, reconnectDelayMs);
        reconnectDelayMs = Math.min(reconnectDelayMs * 2, 10000);
      };
    };

    connect();

    return () => {
      active = false;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      source?.close();
    };
  }, []);

  const selectedRun = useMemo(() => runs[0], [runs]);

  return {
    runs,
    logs,
    analytics,
    selectedRun,
    loading,
    error,
    setError
  };
};
