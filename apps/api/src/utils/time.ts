export const nowIso = (): string => new Date().toISOString();

export const msBetween = (startIso: string, endIso: string): number => {
  return new Date(endIso).getTime() - new Date(startIso).getTime();
};
