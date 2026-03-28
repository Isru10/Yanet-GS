"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

type AuthUser = {
  user_id: number
  tenant_id: number
  name: string
  role: "student" | "teacher" | "admin" | "patient" | "doctor"
}

export function useAuthStore() {
  const [user, setUser] = useState<AuthUser | null>({
    user_id: 1,
    tenant_id: 1,
    name: "Demo User",
    role: "patient",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUser((prev) => ({
        user_id: prev?.user_id ?? 1,
        tenant_id: prev?.tenant_id ?? 1,
        name: data.user.user_metadata?.name ?? "Demo User",
        role: "patient",
      }))
    })
  }, [])

  const isPro = () => true
  return { user, isPro }
}
