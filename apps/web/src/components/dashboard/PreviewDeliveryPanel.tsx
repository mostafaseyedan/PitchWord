import type { Run } from "@marketing/shared";
import { motion } from "framer-motion";
import { Button } from "../common/Button";
import { InputField } from "../common/InputField";
import { Download, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface PreviewDeliveryPanelProps {
  selectedRun: Run | undefined;
  teamId: string;
  onTeamIdChange: (value: string) => void;
  channelId: string;
  onChannelIdChange: (value: string) => void;
  onPostToTeams: () => void;
  onRetryTeams: () => void;
  busy: boolean;
}

export const PreviewDeliveryPanel = ({
  selectedRun,
  teamId,
  onTeamIdChange,
  channelId,
  onChannelIdChange,
  onPostToTeams,
  onRetryTeams,
  busy,
}: PreviewDeliveryPanelProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        className="card-elevated card-elevated-neutral rounded-[32px] p-8 col-span-full"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="text-label">Publishing Studio</div>
        </div>

        {assets.length > 0 || selectedRun?.draft ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-12 items-start">
            {/* Left Column: Centered Assets + CTA + Pain Points */}
            <div className="flex flex-col items-center gap-8">
              {assets.map((asset) => (
                <div key={asset.id} className="w-full flex flex-col gap-4 group max-w-[560px]">
                  <div className="border border-border-warm/20 bg-page/40 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 relative group">
                    {asset.type === "image" ? (
                      <img
                        src={asset.uri}
                        alt="Generated"
                        className="w-full h-auto object-cover block max-h-[560px]"
                      />
                    ) : (
                      <video
                        src={asset.uri}
                        controls
                        className="w-full h-auto object-cover block max-h-[560px]"
                      />
                    )}
                  </div>

                  <div className="flex justify-center mt-4">
                    <div className="flex bg-white/72 backdrop-blur-md rounded-full p-1 border border-[#e8dfcf] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(26,26,46,0.04)]">
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            onClick={() => handleCopy(asset.uri, asset.id)}
                            className="relative px-5 py-2 text-[12px] font-semibold tracking-[0.005em] rounded-full text-[#7a7c87] hover:bg-[#3b342b] hover:text-[#fff9ee] transition-all duration-200 outline-none"
                          >
                            <span>{copiedId === asset.id ? "Copied" : "Copy Link"}</span>
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            side="top"
                            sideOffset={10}
                            className="z-[100000] rounded-xl bg-card-warm px-3 py-1.5 text-[12px] font-medium text-primary border border-border-warm shadow-[0_8px_24px_rgba(43,36,22,0.08)]"
                          >
                            Copy public asset URL
                            <Tooltip.Arrow className="fill-card-warm" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>

                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            onClick={() => handleDownload(asset.uri, `${asset.type}-${asset.id}`)}
                            className="relative px-5 py-2 text-[12px] font-semibold tracking-[0.005em] rounded-full text-[#7a7c87] hover:bg-[#3b342b] hover:text-[#fff9ee] transition-all duration-200 outline-none"
                          >
                            <span>Download</span>
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            side="top"
                            sideOffset={10}
                            className="z-[100000] rounded-xl bg-card-warm px-3 py-1.5 text-[12px] font-medium text-primary border border-border-warm shadow-[0_8px_24px_rgba(43,36,22,0.08)]"
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
                <div className="w-full max-w-[560px] space-y-6">
                  <div className="p-5 rounded-2xl bg-sage/5 border border-sage/10">
                    <div className="text-[10px] font-bold text-sage tracking-[0.2em] mb-2">Call to action</div>
                    <p className="text-[15px] font-medium text-primary leading-snug">
                      {selectedRun.draft.cta}
                    </p>
                  </div>

                  {selectedRun.draft.painPoints.length > 0 && (
                    <div className="bg-page/40 rounded-2xl p-6 border border-border-warm/20">
                      <div className="text-[10px] font-bold text-primary tracking-widest opacity-40 mb-4">Target pain points</div>
                      <ul className="space-y-3">
                        {selectedRun.draft.painPoints.map((point) => (
                          <li key={point} className="flex items-start gap-3 text-[13px] text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold/60 mt-1.5 shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Key Draft Contents */}
            <div className="flex flex-col">
              {selectedRun?.draft ? (
                <div className="space-y-8">
                  <div>
                    <div className="text-label-small mb-3 opacity-50 tracking-[0.1em]">Headline strategy</div>
                    <h3 className="text-[26px] font-semibold tracking-[-0.03em] text-primary leading-tight">{selectedRun.draft.title}</h3>
                  </div>

                  <div>
                    <div className="text-label-small mb-3 opacity-50 tracking-[0.1em]">The hook</div>
                    <p className="text-[17px] font-medium text-primary leading-relaxed italic border-l-2 border-gold/30 pl-5">{selectedRun.draft.hook}</p>
                  </div>

                  <div>
                    <div className="text-label-small mb-3 opacity-50 tracking-[0.1em]">Deep dive body</div>
                    <p className="text-[15px] text-secondary leading-[1.7] whitespace-pre-wrap">{selectedRun.draft.body}</p>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center border border-dashed border-border-warm/30 rounded-3xl">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputField id="team-id" label="Team ID" value={teamId} onChange={onTeamIdChange} placeholder="team-id" />
            <InputField id="channel-id" label="Channel ID" value={channelId} onChange={onChannelIdChange} placeholder="channel-id" />
          </div>
          <div className="flex gap-3">
            <Button variant="espresso" loading={busy} onClick={onPostToTeams}>Post to teams</Button>
            <Button variant="secondary" loading={busy} onClick={onRetryTeams}>Retry teams step</Button>
          </div>
        </div>

        {/* Citations */}
        {selectedRun?.draft?.citations && selectedRun.draft.citations.length > 0 ? (
          <div className="mt-8 pt-8 border-t border-border-warm/30">
            <div className="text-label-small mb-4 opacity-50">Citations</div>
            <div className="space-y-3">
              {selectedRun.draft.citations.map((citation, index) => (
                <div key={index} className="p-4 rounded-xl border border-border-warm/30 bg-page/40">
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
    </Tooltip.Provider>
  );
};
