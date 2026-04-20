import Link from "next/link"

export function SidebarLogo({
  homeUrl,
  appName,
  appSubtitle,
}: {
  homeUrl: string
  appName: string
  appSubtitle: string
}) {
  return (
    <Link href={homeUrl} className="block rounded-md px-1 py-1 hover:bg-slate-50">
      <p className="text-sm font-semibold text-slate-900">{appName}</p>
      <p className="text-xs text-slate-500">{appSubtitle}</p>
    </Link>
  )
}
