import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import type { AspectRatio, Category, ImageResolution, ManualRunRequest, Tone } from "@marketing/shared";
import { apiClient } from "./api/client";
import { useDashboardData } from "./hooks/use-dashboard-data";
import { Sidebar, type ViewName } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopNav";
import { RunSetupPanel } from "./components/dashboard/RunSetupPanel";
import { LiveWorkspacePanel } from "./components/dashboard/LiveWorkspacePanel";
import { PreviewDeliveryPanel } from "./components/dashboard/PreviewDeliveryPanel";
import { HistoryList } from "./components/history/HistoryList";
import { LogsView } from "./components/logs/LogsView";
import { AlertBanner } from "./components/common/AlertBanner";
import { Spinner } from "./components/common/Spinner";
import "./styles/app.css";

function App() {
  const { runs, logs, analytics, loading, error, setError } = useDashboardData();

  const [activeView, setActiveView] = useState<ViewName>("dashboard");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const [tone, setTone] = useState<Tone>("professional");
  const [category, setCategory] = useState<Category>("industry_news");
  const [manualIdeaText, setManualIdeaText] = useState("");
  const [selectedNewsTopic, setSelectedNewsTopic] = useState("");
  const [mediaMode, setMediaMode] = useState<"image_only" | "image_video">("image_only");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [imageResolution, setImageResolution] = useState<ImageResolution>("1K");
  const [imageStyleInstruction, setImageStyleInstruction] = useState("");

  const [teamId, setTeamId] = useState("");
  const [channelId, setChannelId] = useState("");

  const [uploadedFileRefs, setUploadedFileRefs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRunId && runs.length > 0) {
      setSelectedRunId(runs[0]!.id);
    }
  }, [runs, selectedRunId]);

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId) ?? runs[0],
    [runs, selectedRunId]
  );

  useEffect(() => {
    if (!busy || !activeRunId) return;
    const activeRun = runs.find((run) => run.id === activeRunId);
    if (!activeRun) return;

    const terminal = ["review_ready", "posted", "failed"];
    if (terminal.includes(activeRun.status)) {
      setBusy(false);
      setActiveRunId(null);
    }
  }, [busy, activeRunId, runs]);

  useEffect(() => {
    if (!busy || !activeRunId) {
      return;
    }

    const terminal = ["review_ready", "posted", "failed"];
    let cancelled = false;
    let errorCount = 0;

    const pollRun = async (): Promise<void> => {
      try {
        const run = await apiClient.getRun(activeRunId);
        if (cancelled) {
          return;
        }

        errorCount = 0;
        if (terminal.includes(run.status)) {
          setBusy(false);
          setActiveRunId(null);
        }
      } catch {
        errorCount += 1;
        if (!cancelled && errorCount >= 5) {
          setBusy(false);
          setActiveRunId(null);
        }
      }
    };

    void pollRun();
    const timer = window.setInterval(() => {
      void pollRun();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [busy, activeRunId]);

  const handleDailyRun = async (): Promise<void> => {
    try {
      setBusy(true);
      const run = await apiClient.createDailyRun({
        requestedMedia: mediaMode,
        aspectRatio,
        imageResolution,
        imageStyleInstruction: imageStyleInstruction || undefined
      });
      setActiveRunId(run.id);
      setSelectedRunId(run.id);
      setActiveView("dashboard");
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : String(runError));
      setBusy(false);
      setActiveRunId(null);
    }
  };

  const handleManualRun = async (): Promise<void> => {
    const payload: ManualRunRequest = {
      tone,
      category,
      input: {
        manualIdeaText: manualIdeaText || undefined,
        selectedNewsTopic: selectedNewsTopic || undefined,
        uploadedFileRefs,
        requestedMedia: mediaMode,
        aspectRatio,
        imageResolution,
        imageStyleInstruction: imageStyleInstruction || undefined
      },
    };
    try {
      setBusy(true);
      const run = await apiClient.createManualRun(payload);
      setActiveRunId(run.id);
      setSelectedRunId(run.id);
      setActiveView("dashboard");
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : String(runError));
      setBusy(false);
      setActiveRunId(null);
    }
  };

  const handleUpload = async (fileList: FileList | null): Promise<void> => {
    if (!fileList?.length) return;
    try {
      setBusy(true);
      const refs: string[] = [];
      for (const file of Array.from(fileList)) {
        const uploaded = await apiClient.uploadFile(file);
        refs.push(uploaded.fileRef);
      }
      setUploadedFileRefs((current) => [...current, ...refs]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : String(uploadError));
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveFile = (index: number): void => {
    setUploadedFileRefs((current) => current.filter((_, i) => i !== index));
  };

  const handleRetryTeams = async (): Promise<void> => {
    if (!selectedRun) return;
    try {
      setBusy(true);
      await apiClient.retryStep(selectedRun.id, { stepName: "teams_delivery" });
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : String(retryError));
    } finally {
      setBusy(false);
    }
  };

  const handlePostToTeams = async (): Promise<void> => {
    if (!selectedRun || !teamId || !channelId) {
      setError("Enter team/channel IDs before posting manually.");
      return;
    }
    try {
      setBusy(true);
      await apiClient.postToTeams(selectedRun.id, { teamId, channelId });
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : String(postError));
    } finally {
      setBusy(false);
    }
  };


  return (
    <Tabs.Root
      value={activeView}
      onValueChange={(value: string) => setActiveView(value as ViewName)}
      orientation="vertical"
      className="min-h-screen"
    >
      {/* Sidebar — fixed vertical nav (unchanged) */}
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Content Canvas — Single integrated layout surface */}
      <main className="content-shell warm-gradient-wash relative z-[1]">
        <TopBar />

        {/* Header */}
        <header className="mb-8">
          <p className="text-[15px] text-secondary tracking-[0.01em]">
            Daily creative idea extraction, grounded content generation, media creation, and Microsoft Teams delivery.
          </p>
        </header>

        {/* Error */}
        {error ? (
          <AlertBanner type="error" onClose={() => setError(null)}>
            {error}
          </AlertBanner>
        ) : null}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center gap-4 py-20">
            <Spinner size="lg" />
            <span className="text-muted">Loading dashboard state...</span>
          </div>
        ) : null}

        {!loading ? (
          <>
            <Tabs.Content value="dashboard">
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bento-grid stagger-children"
              >
                <div className="bento-span-6">
                  <RunSetupPanel
                    tone={tone}
                    onToneChange={setTone}
                    category={category}
                    onCategoryChange={setCategory}
                    mediaMode={mediaMode}
                    onMediaModeChange={setMediaMode}
                    aspectRatio={aspectRatio}
                    onAspectRatioChange={setAspectRatio}
                    imageResolution={imageResolution}
                    onImageResolutionChange={setImageResolution}
                    imageStyleInstruction={imageStyleInstruction}
                    onImageStyleInstructionChange={setImageStyleInstruction}
                    newsTopic={selectedNewsTopic}
                    onNewsTopicChange={setSelectedNewsTopic}
                    manualIdea={manualIdeaText}
                    onManualIdeaChange={setManualIdeaText}
                    uploadedFileRefs={uploadedFileRefs}
                    onUpload={handleUpload}
                    onRemoveFile={handleRemoveFile}
                    onStartManual={handleManualRun}
                    onStartDaily={handleDailyRun}
                    busy={busy}
                  />
                </div>
                <div className="bento-span-6">
                  <LiveWorkspacePanel
                    selectedRun={selectedRun}
                    onShowResult={() => setActiveView("preview")}
                  />
                </div>
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="preview">
              <motion.div
                key="studio"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Master: History List */}
                <div className="lg:col-span-4">
                  <HistoryList
                    runs={runs}
                    selectedRunId={selectedRunId}
                    onSelectRun={setSelectedRunId}
                  />
                </div>

                {/* Detail: Preview/Publishing Studio */}
                <div className="lg:col-span-8">
                  <PreviewDeliveryPanel
                    selectedRun={selectedRun}
                    teamId={teamId}
                    onTeamIdChange={setTeamId}
                    channelId={channelId}
                    onChannelIdChange={setChannelId}
                    onPostToTeams={handlePostToTeams}
                    onRetryTeams={handleRetryTeams}
                    busy={busy}
                  />
                </div>
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="logs">
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <LogsView analytics={analytics} logs={logs} />
              </motion.div>
            </Tabs.Content>
          </>
        ) : null}
      </main>
    </Tabs.Root>
  );
}

export default App;
