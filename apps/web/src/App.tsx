import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type {
  AspectRatio,
  Category,
  ImageResolution,
  LibraryAsset,
  ManualRunRequest,
  Tone,
  VideoAspectRatio,
  VideoDuration,
  VideoResolution
} from "@marketing/shared";
import { apiClient } from "./api/client";
import { useDashboardData } from "./hooks/use-dashboard-data";
import { TopBar } from "./components/layout/TopNav";
import { RunSetupPanel } from "./components/dashboard/RunSetupPanel";
import { LiveWorkspacePanel } from "./components/dashboard/LiveWorkspacePanel";
import { PreviewDeliveryPanel } from "./components/dashboard/PreviewDeliveryPanel";
import { HistoryList } from "./components/history/HistoryList";
import { LogsView } from "./components/logs/LogsView";
import { AlertBanner } from "./components/common/AlertBanner";
import { Spinner } from "./components/common/Spinner";
import { Button } from "./components/common/Button";
import { GraphicGenerationPanel } from "./components/dashboard/GraphicGenerationPanel";
import "./styles/app.css";

type PaneView = "run_setup" | "graphics" | "analytics" | "publishing" | "active_stream";

function App() {
  const { runs, logs, analytics, loading, error, setError } = useDashboardData();

  const [paneView, setPaneView] = useState<PaneView>("run_setup");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const [tone, setTone] = useState<Tone>("professional");
  const [category, setCategory] = useState<Category>("industry_news");
  const [manualIdeaText, setManualIdeaText] = useState("");
  const [selectedNewsTopic, setSelectedNewsTopic] = useState("");
  const [mediaMode, setMediaMode] = useState<"image_only" | "image_video">("image_only");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [imageResolution, setImageResolution] = useState<ImageResolution>("1K");
  const [videoDurationSeconds, setVideoDurationSeconds] = useState<VideoDuration>(8);
  const [videoAspectRatio, setVideoAspectRatio] = useState<VideoAspectRatio>("16:9");
  const [videoResolution, setVideoResolution] = useState<VideoResolution>("720p");
  const [imageStyleInstruction, setImageStyleInstruction] = useState("");

  const [stylePresetId, setStylePresetId] = useState("editorial");
  const [graphicStylePresetId, setGraphicStylePresetId] = useState("vector_icon_system");
  const [graphicStyleOverride, setGraphicStyleOverride] = useState("");
  const [fontPresetId, setFontPresetId] = useState("modern_sans");
  const [colorSchemeId, setColorSchemeId] = useState("executive_blue");

  const [graphicPrompt, setGraphicPrompt] = useState("");
  const [graphicTopicBusy, setGraphicTopicBusy] = useState(false);
  const [graphicPromptOptions, setGraphicPromptOptions] = useState<string[]>([]);
  const [selectedGraphicPromptOptionIndex, setSelectedGraphicPromptOptionIndex] = useState<number | null>(null);

  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [teamsDefaultsLoaded, setTeamsDefaultsLoaded] = useState(false);

  const [libraryAssets, setLibraryAssets] = useState<LibraryAsset[]>([]);
  const [selectedReferenceAssetIds, setSelectedReferenceAssetIds] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBootData = async (): Promise<void> => {
      try {
        const [defaults, assets] = await Promise.all([
          apiClient.getTeamsDefaults(),
          apiClient.listLibraryAssets()
        ]);
        if (cancelled) {
          return;
        }
        setRecipientEmails(defaults.recipientEmails);
        setLibraryAssets(assets);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      } finally {
        if (!cancelled) {
          setTeamsDefaultsLoaded(true);
        }
      }
    };

    void loadBootData();
    return () => {
      cancelled = true;
    };
  }, [setError]);

  useEffect(() => {
    if (!teamsDefaultsLoaded || recipientEmails.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      void apiClient.setTeamsDefaults({ recipientEmails }).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : String(saveError));
      });
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [teamsDefaultsLoaded, recipientEmails, setError]);

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

  const handleDailyRun = async (): Promise<void> => {
    try {
      setBusy(true);
      const run = await apiClient.createDailyRun({
        requestedMedia: mediaMode,
        aspectRatio,
        imageResolution,
        videoDurationSeconds,
        videoAspectRatio,
        videoResolution,
        imageStyleInstruction: imageStyleInstruction || undefined,
        stylePresetId,
        fontPresetId,
        colorSchemeId,
        referenceAssetIds: selectedReferenceAssetIds
      });
      setActiveRunId(run.id);
      setSelectedRunId(run.id);
      setPaneView("publishing");
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
        uploadedFileRefs: [],
        referenceAssetIds: selectedReferenceAssetIds,
        requestedMedia: mediaMode,
        aspectRatio,
        imageResolution,
        videoDurationSeconds,
        videoAspectRatio,
        videoResolution,
        imageStyleInstruction: imageStyleInstruction || undefined,
        stylePresetId,
        fontPresetId,
        colorSchemeId
      }
    };
    try {
      setBusy(true);
      const run = await apiClient.createManualRun(payload);
      setActiveRunId(run.id);
      setSelectedRunId(run.id);
      setPaneView("active_stream");
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : String(runError));
      setBusy(false);
      setActiveRunId(null);
    }
  };

  const refreshLibraryAssets = async (): Promise<void> => {
    const assets = await apiClient.listLibraryAssets();
    setLibraryAssets(assets);
  };

  const handleLibraryUpload = async (fileList: FileList | null): Promise<void> => {
    if (!fileList?.length) return;
    try {
      setBusy(true);
      for (const file of Array.from(fileList)) {
        await apiClient.uploadLibraryAsset(file);
      }
      await refreshLibraryAssets();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : String(uploadError));
    } finally {
      setBusy(false);
    }
  };

  const handleLibraryDelete = async (assetId: string): Promise<void> => {
    try {
      setBusy(true);
      await apiClient.deleteLibraryAsset(assetId);
      await refreshLibraryAssets();
      setSelectedReferenceAssetIds((current) => current.filter((id) => id !== assetId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateGraphic = async (): Promise<void> => {
    try {
      setBusy(true);
      await apiClient.generateGraphicAsset({
        prompt: graphicPrompt,
        aspectRatio,
        imageResolution,
        stylePresetId: graphicStylePresetId,
        styleOverride: graphicStyleOverride.trim() || undefined,
        fontPresetId,
        colorSchemeId,
        referenceAssetIds: selectedReferenceAssetIds
      });
      await refreshLibraryAssets();
      setGraphicPrompt("");
      setGraphicPromptOptions([]);
      setSelectedGraphicPromptOptionIndex(null);
      setPaneView("graphics");
    } catch (graphicError) {
      setError(graphicError instanceof Error ? graphicError.message : String(graphicError));
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateGraphicTopic = async (): Promise<void> => {
    try {
      setGraphicTopicBusy(true);
      const result = await apiClient.generateGraphicTopic({
        topicHint: graphicPrompt.trim() || undefined
      });
      setGraphicPromptOptions(result.prompts);
      if (result.prompts[0]) {
        setGraphicPrompt(result.prompts[0]);
        setSelectedGraphicPromptOptionIndex(0);
      } else {
        setSelectedGraphicPromptOptionIndex(null);
      }
    } catch (topicError) {
      setError(topicError instanceof Error ? topicError.message : String(topicError));
    } finally {
      setGraphicTopicBusy(false);
    }
  };

  const handleSelectGraphicPromptOption = (value: string, index: number): void => {
    setGraphicPrompt(value);
    setSelectedGraphicPromptOptionIndex(index);
  };

  const handleGraphicPromptChange = (value: string): void => {
    setGraphicPrompt(value);
    setSelectedGraphicPromptOptionIndex(null);
  };

  const handleToggleReferenceAsset = (assetId: string): void => {
    setSelectedReferenceAssetIds((current) => {
      if (current.includes(assetId)) {
        return current.filter((id) => id !== assetId);
      }
      if (current.length >= 14) {
        return current;
      }
      return [...current, assetId];
    });
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
    if (!selectedRun) {
      setError("Select a run before posting to Teams.");
      return;
    }
    try {
      setBusy(true);
      await apiClient.postToTeams(selectedRun.id, { recipientEmails });
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : String(postError));
    } finally {
      setBusy(false);
    }
  };

  const handleSelectRun = (runId: string): void => {
    setSelectedRunId(runId);
    setPaneView("publishing");
  };

  return (
    <main className="workspace-app warm-gradient-wash relative z-[1]">
      <TopBar />
      <div className="workspace-shell">
        <aside className="workspace-side-rail">
          <div className="workspace-side-actions">
            <Button
              variant={paneView === "run_setup" ? "espresso" : "secondary"}
              color="primary"
              size="small"
              onClick={() => setPaneView("run_setup")}
            >
              Content Engine
            </Button>
            <Button
              variant={paneView === "graphics" ? "espresso" : "secondary"}
              color="positive"
              size="small"
              onClick={() => setPaneView("graphics")}
            >
              Graphic
            </Button>
            <Button
              variant={paneView === "analytics" ? "espresso" : "secondary"}
              color="inverted"
              size="small"
              onClick={() => setPaneView("analytics")}
            >
              Analytics
            </Button>
          </div>
          <div className="workspace-side-list">
            <HistoryList
              runs={runs}
              selectedRunId={selectedRunId}
              onSelectRun={handleSelectRun}
            />
          </div>
        </aside>

        <section className="workspace-content">
          {error ? (
            <AlertBanner type="error" onClose={() => setError(null)}>
              {error}
            </AlertBanner>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center gap-4 py-20">
              <Spinner size="lg" />
              <span className="text-muted">Loading dashboard state...</span>
            </div>
          ) : (
            <motion.div
              key={paneView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {paneView === "run_setup" ? (
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
                  videoDurationSeconds={videoDurationSeconds}
                  onVideoDurationSecondsChange={setVideoDurationSeconds}
                  videoAspectRatio={videoAspectRatio}
                  onVideoAspectRatioChange={setVideoAspectRatio}
                  videoResolution={videoResolution}
                  onVideoResolutionChange={setVideoResolution}
                  imageStyleInstruction={imageStyleInstruction}
                  onImageStyleInstructionChange={setImageStyleInstruction}
                  stylePresetId={stylePresetId}
                  onStylePresetIdChange={setStylePresetId}
                  fontPresetId={fontPresetId}
                  onFontPresetIdChange={setFontPresetId}
                  colorSchemeId={colorSchemeId}
                  onColorSchemeIdChange={setColorSchemeId}
                  newsTopic={selectedNewsTopic}
                  onNewsTopicChange={setSelectedNewsTopic}
                  manualIdea={manualIdeaText}
                  onManualIdeaChange={setManualIdeaText}
                  referenceAssets={libraryAssets}
                  selectedReferenceAssetIds={selectedReferenceAssetIds}
                  onToggleReferenceAsset={handleToggleReferenceAsset}
                  onReferenceUpload={handleLibraryUpload}
                  onReferenceDelete={handleLibraryDelete}
                  onStartManual={handleManualRun}
                  onStartDaily={handleDailyRun}
                  busy={busy}
                />
              ) : null}

              {paneView === "graphics" ? (
                <GraphicGenerationPanel
                  prompt={graphicPrompt}
                  onPromptChange={handleGraphicPromptChange}
                  onGenerateTopic={handleGenerateGraphicTopic}
                  promptOptions={graphicPromptOptions}
                  selectedPromptOptionIndex={selectedGraphicPromptOptionIndex}
                  onSelectPromptOption={handleSelectGraphicPromptOption}
                  aspectRatio={aspectRatio}
                  onAspectRatioChange={setAspectRatio}
                  imageResolution={imageResolution}
                  onImageResolutionChange={setImageResolution}
                  stylePresetId={graphicStylePresetId}
                  onStylePresetIdChange={setGraphicStylePresetId}
                  styleOverride={graphicStyleOverride}
                  onStyleOverrideChange={setGraphicStyleOverride}
                  fontPresetId={fontPresetId}
                  onFontPresetIdChange={setFontPresetId}
                  colorSchemeId={colorSchemeId}
                  onColorSchemeIdChange={setColorSchemeId}
                  referenceAssets={libraryAssets}
                  selectedReferenceAssetIds={selectedReferenceAssetIds}
                  onToggleReferenceAsset={handleToggleReferenceAsset}
                  onReferenceUpload={handleLibraryUpload}
                  onReferenceDelete={handleLibraryDelete}
                  onGenerate={handleGenerateGraphic}
                  topicBusy={graphicTopicBusy}
                  busy={busy}
                />
              ) : null}

              {paneView === "analytics" ? <LogsView analytics={analytics} logs={logs} /> : null}

              {paneView === "active_stream" ? (
                <LiveWorkspacePanel
                  selectedRun={selectedRun}
                  onShowResult={() => setPaneView("publishing")}
                />
              ) : null}

              {paneView === "publishing" ? (
                <PreviewDeliveryPanel
                  selectedRun={selectedRun}
                  recipientEmails={recipientEmails}
                  onRecipientEmailsChange={setRecipientEmails}
                  onPostToTeams={handlePostToTeams}
                  onRetryTeams={handleRetryTeams}
                  busy={busy}
                />
              ) : null}
            </motion.div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
