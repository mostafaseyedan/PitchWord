import type { Run } from "@marketing/shared";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../common/Button";
import { X, Mail } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

const EMAIL_DOMAIN = "@cendien.com";

function RecipientTagInput({
  emails,
  onChange,
}: {
  emails: string[];
  onChange: (emails: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addRecipient = (raw: string) => {
    const username = raw.trim().replace(/@cendien\.com$/i, "");
    if (!username) return;
    const email = `${username}${EMAIL_DOMAIN}`;
    if (emails.includes(email)) return;
    onChange([...emails, email]);
    setInputValue("");
  };

  const removeRecipient = (email: string) => {
    onChange(emails.filter((e) => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRecipient(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && emails.length > 0) {
      removeRecipient(emails[emails.length - 1]!);
    }
  };

  return (
    <div className="max-w-lg">
      <label className="field-label !mb-1.5 !font-semibold !tracking-[0.02em] !text-secondary/70">
        Recipients
      </label>
      <div
        className="flex flex-wrap items-center gap-2 min-h-[44px] px-3 py-2 rounded-[var(--border-radius-medium)] border border-[color:var(--ui-border-color)] bg-[color:var(--secondary-background-color)] transition-colors cursor-text focus-within:border-[color:var(--primary-color)]"
        onClick={() => inputRef.current?.focus()}
      >
        {emails.map((email) => {
          const username = email.replace(EMAIL_DOMAIN, "");
          return (
            <span
              key={email}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-[var(--border-radius-small)] bg-[color:var(--primary-selected-color)] text-[13px] font-medium text-primary border border-[color:var(--primary-color)]/20"
            >
              <Mail size={12} className="text-secondary/50 shrink-0" />
              <span>{username}<span className="text-secondary/40">{EMAIL_DOMAIN}</span></span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeRecipient(email); }}
                className="ml-0.5 p-0.5 rounded-[var(--border-radius-small)] hover:bg-primary/10 transition-colors"
              >
                <X size={12} className="text-secondary/60" />
              </button>
            </span>
          );
        })}
        <div className="inline-flex items-center flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (inputValue.trim()) addRecipient(inputValue); }}
            placeholder={emails.length === 0 ? "username" : "add another..."}
            className="w-full bg-transparent outline-none text-[14px] text-primary placeholder:text-secondary/30"
          />
          <span className="text-[13px] text-secondary/40 shrink-0 select-none pointer-events-none">{EMAIL_DOMAIN}</span>
        </div>
      </div>
      <p className="text-[11px] text-secondary/40 mt-1.5">Press Enter or comma to add. Backspace to remove last.</p>
    </div>
  );
}

interface PreviewDeliveryPanelProps {
  selectedRun: Run | undefined;
  recipientEmails: string[];
  onRecipientEmailsChange: (value: string[]) => void;
  onPostToTeams: () => void;
  onRetryTeams: () => void;
  busy: boolean;
}

export const PreviewDeliveryPanel = ({
  selectedRun,
  recipientEmails,
  onRecipientEmailsChange,
  onPostToTeams,
  onRetryTeams,
  busy,
}: PreviewDeliveryPanelProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewerAsset, setViewerAsset] = useState<Run["assets"][0] | null>(null);

  // Close modal on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewerAsset(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleDownload = async (uri: string, filename: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleCopy = (uri: string, id: string) => {
    navigator.clipboard.writeText(uri);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const assets = selectedRun?.assets || [];
  const isSingleAsset = assets.length === 1;
  const isWebUrl = (value: string): boolean => /^https?:\/\//i.test(value);
  const trimCitationSource = (value: string): string =>
    value.replace(/^gs:\/\/sales-support-ai-sharepoint-files\//i, "");

  return (
    <Tooltip.Provider delayDuration={220}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-elevated card-elevated-neutral panel-surface col-span-full"
      >
        <div className="section-header">
          <div className="text-label">Publishing Studio</div>
        </div>

        {assets.length > 0 || selectedRun?.draft ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-10 items-start">
            {/* Left Column: Centered Assets + CTA + Pain Points */}
            <div className="flex flex-col items-center gap-8">
              {assets.map((asset) => (
                <div key={asset.id} className="w-full flex flex-col gap-4 group max-w-[560px]">
                  <div
                    className="overflow-hidden transition-all duration-500 relative group cursor-zoom-in rounded-[var(--border-radius-medium)]"
                    onClick={() => setViewerAsset(asset)}
                  >
                    {asset.type === "image" ? (
                      <img
                        src={asset.uri}
                        alt="Generated"
                        className="w-full h-auto object-contain block max-h-[700px] transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <video
                        src={asset.uri}
                        controls
                        className="w-full h-auto object-contain block max-h-[700px]"
                      />
                    )}
                  </div>

                  <div className="flex justify-center mt-4">
                    <div className="flex bg-[color:var(--secondary-background-color)] rounded-[var(--border-radius-medium)] p-1 border border-[color:var(--ui-border-color)]">
                      <Tooltip.Root>
                        <Tooltip.Trigger
                          onClick={() => handleCopy(asset.uri, asset.id)}
                          className="relative px-5 py-2 text-[12px] font-semibold tracking-[0.005em] rounded-[var(--border-radius-small)] text-secondary hover:bg-primary hover:text-white transition-all duration-200 outline-none"
                        >
                          <span>{copiedId === asset.id ? "Copied" : "Copy Link"}</span>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            side="top"
                            sideOffset={10}
                            className="z-[100000] rounded-[var(--border-radius-medium)] bg-card-warm px-3 py-1.5 text-[12px] font-medium text-primary border border-border-warm shadow-[0_8px_24px_rgba(31,53,88,0.08)]"
                          >
                            Copy public asset URL
                            <Tooltip.Arrow className="fill-card-warm" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>

                      <Tooltip.Root>
                        <Tooltip.Trigger
                          onClick={() => handleDownload(asset.uri, `${asset.type}-${asset.id}`)}
                          className="relative px-5 py-2 text-[12px] font-semibold tracking-[0.005em] rounded-[var(--border-radius-small)] text-secondary hover:bg-primary hover:text-white transition-all duration-200 outline-none"
                        >
                          <span>Download</span>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            side="top"
                            sideOffset={10}
                            className="z-[100000] rounded-[var(--border-radius-medium)] bg-card-warm px-3 py-1.5 text-[12px] font-medium text-primary border border-border-warm shadow-[0_8px_24px_rgba(31,53,88,0.08)]"
                          >
                            Download high-res asset
                            <Tooltip.Arrow className="fill-card-warm" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </div>
                  </div>
                </div>
              ))}

              {selectedRun?.draft && (
                <div className="w-full max-w-[560px]">
                  <div className="p-5 rounded-[var(--border-radius-medium)] bg-sage/5 border border-sage/10">
                    <div className="text-[10px] font-bold text-sage tracking-[0.2em] mb-2">Category</div>
                    <p className="text-[15px] font-medium text-primary leading-snug capitalize">
                      {selectedRun.draft.category.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Key Draft Contents */}
            <div className="flex flex-col">
              {selectedRun?.draft ? (
                <div className="space-y-8 relative">
                  <button
                    type="button"
                    onClick={() => {
                      const textToCopy = `${selectedRun.draft!.title}\n\n${selectedRun.draft!.body}`;
                      navigator.clipboard.writeText(textToCopy);
                    }}
                    className="absolute top-0 right-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--border-radius-small)] border border-[color:var(--ui-border-color)] bg-[color:var(--secondary-background-color)] text-[11px] font-semibold text-secondary hover:text-primary hover:border-[color:var(--primary-color)] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    Copy Content
                  </button>
                  <div>
                    <div className="text-label-small mb-3 opacity-50 tracking-[0.1em]">Headline strategy</div>
                    <h3 className="heading-lg text-primary pr-24">{selectedRun.draft.title}</h3>
                  </div>

                  <div>
                    <div className="text-label-small mb-3 opacity-50 tracking-[0.1em]">Deep dive body</div>
                    <p className="body-md whitespace-pre-wrap">{selectedRun.draft.body}</p>
                  </div>

                  {selectedRun.draft.painPoints.length > 0 && (
                    <div className="p-6 rounded-[var(--border-radius-medium)] bg-white/40">
                      <div className="text-label-small mb-4 opacity-50 tracking-[0.1em]">Target pain points</div>
                      <ul className="space-y-3">
                        {selectedRun.draft.painPoints.map((point) => (
                          <li key={point} className="flex items-start gap-3 text-[14px] text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold/60 mt-1.5 shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-24 text-center border border-dashed border-border-warm/30 rounded-[var(--border-radius-medium)]">
                  <p className="text-muted text-[13px] font-medium opacity-50">Drafting tactical content...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted text-[14px] mb-8">No assets or content draft available for this run.</p>
        )}

        {/* Teams form */}
        <div className="mt-8 pt-8 border-t border-border-warm/30">
          <div className="text-label-small mb-4 opacity-50">Teams Integration</div>
          <RecipientTagInput
            emails={recipientEmails}
            onChange={onRecipientEmailsChange}
          />
          <div className="flex gap-3 mt-4">
            <Button variant="espresso" loading={busy} onClick={onPostToTeams} disabled={recipientEmails.length === 0}>Send to {recipientEmails.length === 1 ? "user" : `${recipientEmails.length} users`}</Button>
            <Button variant="secondary" loading={busy} onClick={onRetryTeams}>Retry teams step</Button>
          </div>
        </div>

        {/* Citations */}
        {selectedRun?.draft?.citations && selectedRun.draft.citations.length > 0 ? (
          <div className="mt-8 pt-8 border-t border-border-warm/30">
            <div className="text-label-small mb-4 opacity-50">Citations</div>
            <div className="space-y-3">
              {selectedRun.draft.citations.map((citation, index) => (
                <div key={index} className="p-4 rounded-[var(--border-radius-medium)] border border-border-warm/30 bg-page/40">
                  <div className="mb-2">
                    {isWebUrl(citation.sourceUrl) ? (
                      <a
                        href={citation.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[12px] text-sky hover:underline break-all"
                      >
                        {trimCitationSource(citation.sourceUrl)}
                      </a>
                    ) : (
                      <p className="text-[12px] text-secondary break-all">{trimCitationSource(citation.sourceUrl)}</p>
                    )}
                  </div>
                  <p className="text-[13px] text-secondary">{citation.snippet}</p>
                  <div className="text-label-small mt-2 opacity-30 flex items-center justify-between">
                    <span>Confidence: {Math.round(citation.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>

      <AnimatePresence>
        {viewerAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-12 bg-primary/90 backdrop-blur-xl cursor-zoom-out"
            onClick={() => setViewerAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewerAsset(null)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors p-2 text-[12px] font-bold uppercase tracking-widest"
              >
                Close (ESC)
              </button>
              {viewerAsset.type === "image" ? (
                <img
                  src={viewerAsset.uri}
                  alt="Full view"
                  className="max-w-full max-h-[85vh] object-contain rounded-[var(--border-radius-medium)] shadow-2xl"
                />
              ) : (
                <video
                  src={viewerAsset.uri}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] object-contain rounded-[var(--border-radius-medium)] shadow-2xl"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Tooltip.Provider>
  );
};
