// Shared by the Cloud Backend page and its encrypted overview.
export const flow = {
  app: "#185fa5",
  infra: "#534ab7",
  traffic: "#0f6e56",
  logs: "#854f0b",
  ops: "#993c1d",
  local: "#94a3b8",
  metrics: "#3730a3",
  security: "#a32d2d",
};

export type Box = {
  x: number; y: number; w: number; h: number; cls: string; title: string;
  lines?: string[]; logo?: string | string[]; pill?: string; pillColor?: string; pillLogo?: string; center?: boolean;
};
export type Arrow = {
  d: string; color: string; dashed?: boolean; n?: string; badge?: [number, number];
  label?: [number, number, string, "start" | "middle" | "end"]; muted?: boolean;
};
