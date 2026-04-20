"use client"

import { Bell } from "lucide-react"

export function SidebarNotification() {
  return (
    <div className="mb-3 rounded-lg border bg-slate-50 p-2 text-xs text-slate-600">
      <div className="flex items-center gap-2 font-medium text-slate-800">
        <Bell className="h-3.5 w-3.5" />
        Notifications
      </div>
      <p className="mt-1">You are all caught up.</p>
    </div>
  )
}
