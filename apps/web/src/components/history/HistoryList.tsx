import { useState } from "react";
import type { Run } from "@marketing/shared";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutList, LayoutGrid, Trash2 } from "lucide-react";
import { StatusPill } from "../common/StatusPill";
import { formatDate } from "../../utils/format";

interface HistoryListProps {
  runs: Run[];
  selectedRunId: string | null;
  onSelectRun: (runId: string) => void;
  onDeleteRun: (runId: string) => void;
}

export const HistoryList = ({ runs, selectedRunId, onSelectRun, onDeleteRun }: HistoryListProps) => {
  const [viewMode, setViewMode] = useState<"list" | "gallery">("gallery");
  const hiddenStatuses = new Set(["posted", "review_ready", "failed"]);

  const getRunThumbnail = (run: Run) => {
    return run.assets.find(a => a.type === "image")?.uri;
  };

  return (
    <div className="flex flex-col h-full uppercase-titles">
      <div className="flex items-center justify-center px-4 py-3 border-b border-border-warm/30 bg-white/40 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex bg-[color:var(--allgrey-background-color)] p-0.5 rounded-lg border border-[color:var(--ui-border-color)]">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-secondary/40 hover:text-secondary"}`}
            title="List view"
          >
            <LayoutList size={14} />
          </button>
          <button
            onClick={() => setViewMode("gallery")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "gallery" ? "bg-white text-primary shadow-sm" : "text-secondary/40 hover:text-secondary"}`}
            title="Gallery view"
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1">
        <AnimatePresence mode="wait">
          {viewMode === "list" ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {runs.map((run, i) => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`group list-row border-b border-border-warm/40 last:border-0 relative ${run.id === selectedRunId ? "list-row-active" : ""}`}
                  onClick={() => onSelectRun(run.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") onSelectRun(run.id); }}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5">
                    <span className="list-row-title truncate pr-6">
                      {run.draft?.title ?? run.newsTopic ?? "Untitled run"}
                    </span>
                    {hiddenStatuses.has(run.status) ? null : <StatusPill status={run.status} />}
                  </div>
                  <div className="flex items-center gap-2 list-row-meta">
                    <span>{formatDate(run.createdAt)}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Permanently delete this run?")) {
                        onDeleteRun(run.id);
                      }
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 text-secondary/40"
                    title="Delete run"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="gallery-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-2 p-3"
            >
              {runs.map((run, i) => {
                const thumbnail = getRunThumbnail(run);
                const isSelected = run.id === selectedRunId;
                return (
                  <motion.div
                    key={run.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${isSelected ? "border-primary shadow-lg ring-2 ring-primary/10" : "border-black/10 hover:border-black/20"}`}
                    onClick={() => onSelectRun(run.id)}
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={run.draft?.title || "Run thumbnail"}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-secondary/5 flex items-center justify-center p-4">
                        <span className="text-[10px] font-bold text-secondary/30 uppercase tracking-widest text-center">
                          {run.draft?.title?.slice(0, 12) ?? "No Image"}
                        </span>
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-2.5 ${isSelected ? "opacity-100" : ""}`}>
                      <p className="text-[10px] font-bold text-white uppercase leading-tight line-clamp-2 mb-1 drop-shadow-md">
                        {run.draft?.title ?? run.newsTopic ?? "Untitled"}
                      </p>
                      <span className="text-[8px] font-medium text-white/60 tracking-wider">
                        {formatDate(run.createdAt)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Permanently delete this run?")) {
                          onDeleteRun(run.id);
                        }
                      }}
                      className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white/80 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      title="Delete run"
                    >
                      <Trash2 size={12} />
                    </button>

                    {!hiddenStatuses.has(run.status) && (
                      <div className="absolute top-2 right-2 scale-75 origin-top-right">
                        <StatusPill status={run.status} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {runs.length === 0 ? (
          <div className="py-20 text-center mx-4 my-2 border border-dashed border-border-warm/30 rounded-2xl">
            <p className="text-muted text-[13px] font-medium opacity-40">Archive is empty.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
