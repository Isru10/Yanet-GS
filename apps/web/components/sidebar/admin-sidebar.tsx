"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Calendar,
  Video,
  CreditCard,
  Bell,
  User,
  Users,
  BookOpen,
  LayoutPanelLeft,
  Settings,
  HelpCircle,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { SidebarNotification } from "@/components/sidebar-notification"
import { NavUser } from "@/components/nav-user"
import { SidebarLogo } from "@/components/sidebar/shared/sidebar-logo"
import { SidebarNavItem } from "@/components/sidebar/shared/sidebar-nav-item"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

function getBase(pathname: string) {
  return pathname.startsWith("/doctor/") ? "/doctor/real-dashboard" : "/patient/real-dashboard"
}

function buildAdminNav(base: string) {
  return [
    {
      label: "Platform",
      items: [
        { title: "Overview",      url: `${base}/dashboard-2`,            icon: LayoutDashboard },
        { title: "All Students",  url: `${base}/users`,                  icon: Users },
        { title: "All Tutors",    url: `${base}/users`,                  icon: BookOpen },
        { title: "Bookings",      url: `${base}/bookings`,               icon: Calendar },
        { title: "Sessions",      url: `${base}/sessions`,               icon: Video },
        { title: "Transactions",  url: `${base}/transactions`,           icon: CreditCard },
      ],
    },
    {
      label: "Tools",
      items: [
        { title: "Calendar",      url: `${base}/calendar`,               icon: Calendar },
        { title: "Mail",          url: `${base}/mail`,                   icon: LayoutPanelLeft },
        { title: "Chat",          url: `${base}/chat`,                   icon: LayoutPanelLeft },
        { title: "Notifications", url: `${base}/notifications`,          icon: Bell },
      ],
    },
    {
      label: "Configuration",
      items: [
        {
          title: "Settings", url: "#", icon: Settings,
          items: [
            { title: "Account",       url: `${base}/settings/account` },
            { title: "Appearance",    url: `${base}/settings/appearance` },
            { title: "Billing",       url: `${base}/settings/billing` },
            { title: "Notifications", url: `${base}/settings/notifications` },
          ],
        },
        { title: "Profile",  url: `${base}/profile`, icon: User },
        { title: "FAQs",     url: `${base}/faqs`,    icon: HelpCircle },
      ],
    },
  ] as const
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const base = getBase(pathname)
  const adminNav = buildAdminNav(base)
  const title = pathname.startsWith("/doctor/") ? "Doctor Dashboard" : "Patient Dashboard"

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarLogo
          homeUrl={`${base}/admin-dashboard`}
          appName="Yanet Health"
          appSubtitle={title}
        />
      </SidebarHeader>
      <SidebarContent>
        {adminNav.map((group) => (
          <SidebarNavItem key={group.label} label={group.label} items={group.items as any} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNotification />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
