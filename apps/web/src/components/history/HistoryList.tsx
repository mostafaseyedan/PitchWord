import type { Run } from "@marketing/shared";
import { motion } from "framer-motion";
import { StatusPill } from "../common/StatusPill";
import { formatDate } from "../../utils/format";

interface HistoryListProps {
  runs: Run[];
  selectedRunId: string | null;
  onSelectRun: (runId: string) => void;
}

export const HistoryList = ({ runs, selectedRunId, onSelectRun }: HistoryListProps) => {
  const hiddenStatuses = new Set(["posted", "review_ready", "failed"]);

  return (
    <div>
      <div>
        {runs.map((run, i) => (
          <motion.div
            key={run.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ transition: { duration: 0.15, ease: "easeOut" } }}
            whileTap={{ transition: { duration: 0.1, ease: "easeOut" } }}
            className={`group list-row border-b border-border-warm/40 last:border-0 ${run.id === selectedRunId
              ? "list-row-active"
              : ""
              }`}
            onClick={() => onSelectRun(run.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") onSelectRun(run.id);
            }}
          >
            <div className="flex items-center justify-between gap-4 mb-1.5">
              <span className="list-row-title truncate">
                {run.draft?.title ?? run.newsTopic ?? "Untitled run"}
              </span>
              {hiddenStatuses.has(run.status) ? null : <StatusPill status={run.status} />}
            </div>
            <div className="flex items-center gap-2 list-row-meta">
              <span>{formatDate(run.createdAt)}</span>
            </div>
          </motion.div>
        ))}
        {runs.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border-warm/30 rounded-2xl">
            <p className="text-muted text-[13px] font-medium opacity-40">Archive is empty.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
