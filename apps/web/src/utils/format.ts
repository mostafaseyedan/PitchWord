import type { Run } from "@marketing/shared";

export const statusProgress: Record<Run["status"], number> = {
  queued: 5,
  researching: 20,
  drafting: 45,
  image_generation: 65,
  video_generation: 80,
  review_ready: 95,
  posted: 100,
  failed: 100
};

export const formatDate = (iso: string | undefined): string => {
  if (!iso) {
    return "-";
  }
  return new Date(iso).toLocaleString();
};
