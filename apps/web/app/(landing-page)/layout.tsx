import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yanet General Hospital",
  description: "Modern telemedicine platform for Yanet General Hospital",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
