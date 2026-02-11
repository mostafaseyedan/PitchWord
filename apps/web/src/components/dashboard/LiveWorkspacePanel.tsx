import type { Run } from "@marketing/shared";
import { motion, AnimatePresence } from "framer-motion";
import { StatusPill } from "../common/StatusPill";
import { ProgressBar } from "../common/ProgressBar";
import { Button } from "../common/Button";
import { CheckCircle2 } from "lucide-react";
import { statusProgress, formatDate } from "../../utils/format";

interface LiveWorkspacePanelProps {
  selectedRun: Run | undefined;
  onShowResult: () => void;
}

export const LiveWorkspacePanel = ({ selectedRun, onShowResult }: LiveWorkspacePanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
      className="card-elevated card-elevated-neutral rounded-[32px] p-8 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="text-label">Active Stream</div>
        <AnimatePresence>
          {(selectedRun?.status === "review_ready" || selectedRun?.status === "posted") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="flex items-center gap-2 px-4 py-1.5 bg-sage/10 border border-sage/20 rounded-full shadow-sm"
            >
              <CheckCircle2 size={14} className="text-sage" />
              <span className="text-[11px] font-bold text-sage tracking-wider">Run succeeded</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedRun ? (
        <>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] opacity-60">Status</span>
              <StatusPill status={selectedRun.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] opacity-60">Created</span>
              <span className="text-[11px] font-medium text-secondary">{formatDate(selectedRun.createdAt)}</span>
            </div>
          </div>

          <ProgressBar value={statusProgress[selectedRun.status]} />

          <div className="flex justify-center mt-4 mb-8">
            <Button
              variant="espresso"
              onClick={onShowResult}
              disabled={selectedRun.status === "failed"}
            >
              Show result
            </Button>
          </div>

          {selectedRun.newsTopic ? (
            <div className="mt-8 pt-8 border-t border-border-warm/30">
              <div className="text-label-small mb-2 opacity-50">Industry trend</div>
              <h3 className="text-[18px] font-medium tracking-[-0.02em] text-primary mb-2">{selectedRun.newsTopic}</h3>
              {selectedRun.newsSummary ? (
                <p className="text-[14px] text-secondary leading-relaxed">{selectedRun.newsSummary}</p>
              ) : null}
            </div>
          ) : null}

          {selectedRun.draft ? (
            <div className="mt-8 pt-8 border-t border-border-warm/30">
              <div className="text-label-small mb-3 opacity-50">Content Draft</div>
              <h3 className="text-[22px] font-medium tracking-[-0.03em] text-primary mb-3">{selectedRun.draft.title}</h3>
              <p className="text-[14px] font-medium text-primary mb-3">{selectedRun.draft.hook}</p>
              <p className="text-[13px] text-secondary leading-relaxed mb-4">{selectedRun.draft.body}</p>
              <div className="flex gap-2 text-[12px] text-secondary mb-4">
                <span className="font-bold text-primary opacity-60">CTA:</span> {selectedRun.draft.cta}
              </div>
              {selectedRun.draft.painPoints.length > 0 ? (
                <div className="bg-page/40 rounded-2xl p-4 border border-border-warm/20">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-40 mb-3">Target Pain Points</div>
                  <ul className="space-y-2">
                    {selectedRun.draft.painPoints.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-[12px] text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold/60 mt-1.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted text-[14px] opacity-50">Draft not generated yet.</p>
            </div>
          )}
        </>
      ) : (
        <div className="py-24 text-center border border-dashed border-border-warm/40 rounded-[24px]">
          <p className="text-muted text-[13px] font-medium opacity-50 tracking-wide">
            No active stream detected. Start a run from the engine.
          </p>
        </div>
      )}
    </motion.div>
  );
};
