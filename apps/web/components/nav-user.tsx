"use client"

import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

export function NavUser() {
  const supabase = createClient()

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-xs text-slate-600">Signed in</span>
      <Button
        size="sm"
        variant="outline"
        className="h-8"
        onClick={async () => {
          await supabase.auth.signOut()
          window.location.href = "/"
        }}
      >
        Sign out
      </Button>
      <Link href="/login" className="hidden" />
    </div>
  )
}
