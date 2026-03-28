"use client"

import { useState } from "react"

type Notification = {
  notification_id: number
  title: string
  message: string
  created_at: string
  is_read: boolean
}

export function useAppStore() {
  const [notifications, setNotificationsState] = useState<Notification[]>([])

  const setNotifications = (list: Notification[]) => setNotificationsState(list)
  const markAllRead = () =>
    setNotificationsState((prev) => prev.map((n) => ({ ...n, is_read: true })))
  const markOneRead = (id: number) =>
    setNotificationsState((prev) => prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n)))

  const unreadCount = notifications.filter((n) => !n.is_read).length
  return { notifications, unreadCount, setNotifications, markAllRead, markOneRead }
}
