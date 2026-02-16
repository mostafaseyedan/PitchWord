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
  return (
    <div className="card-elevated-neutral rounded-[32px] p-6 bg-white/40 border border-white/60 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-warm/20">
        <div className="text-label">Gallery</div>
        <span className="text-label-small opacity-40">{runs.length} items</span>
      </div>

      <div className="space-y-1.5 max-h-[700px] overflow-y-auto pr-2">
        {runs.map((run, i) => (
          <motion.div
            key={run.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.005, transition: { duration: 0.15, ease: "easeOut" } }}
            whileTap={{ scale: 0.995, transition: { duration: 0.1, ease: "easeOut" } }}
            className={`group p-4 rounded-xl cursor-pointer transition-all border-b border-border-warm/10 last:border-0 ${run.id === selectedRunId
              ? "bg-gold/10 border-gold/20"
              : "bg-transparent hover:bg-page/60"
              }`}
            onClick={() => onSelectRun(run.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") onSelectRun(run.id);
            }}
          >
            <div className="flex items-center justify-between gap-4 mb-1.5">
              <span className="text-[15px] font-semibold text-primary truncate">
                {run.draft?.title ?? run.newsTopic ?? "Untitled run"}
              </span>
              <StatusPill status={run.status} />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <span>{formatDate(run.createdAt)}</span>
              <span className="px-2 py-0.5 bg-card rounded-pill text-secondary">{run.tone}</span>
              <span className="px-2 py-0.5 bg-card rounded-pill text-secondary">{run.category}</span>
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
