"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type Item = {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  items?: { title: string; url: string }[]
}

export function SidebarNavItem({
  label,
  items,
}: {
  label: string
  items: Item[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon
          const active = item.url !== "#" && pathname === item.url
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={active}>
                <Link href={item.url === "#" ? "#" : item.url}>
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.items?.length ? (
                <SidebarMenuSub>
                  {item.items.map((sub) => {
                    const subActive = pathname === sub.url
                    return (
                      <SidebarMenuSubItem key={sub.title}>
                        <SidebarMenuSubButton asChild isActive={subActive}>
                          <Link href={sub.url}>{sub.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
          )
        })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
