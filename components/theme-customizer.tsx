"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function ThemeCustomizerTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="fixed bottom-4 right-4 z-40 bg-white"
      onClick={onClick}
    >
      Theme
    </Button>
  );
}

export function ThemeCustomizer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border bg-white p-4 shadow-lg">
        <h2 className="text-sm font-semibold text-slate-900">Theme Customizer</h2>
        <p className="mt-1 text-xs text-slate-500">This placeholder is ready for future theme controls.</p>
        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
