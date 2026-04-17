"use client";

export function useSidebarConfig() {
  return {
    config: {
      side: "left" as const,
      variant: "inset" as const,
      collapsible: "icon" as const,
    },
  };
}
