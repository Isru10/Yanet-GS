export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Fullscreen, no sidebar, dark background to maximize video space
    <div className="h-screen w-screen overflow-hidden bg-gray-950">
      {children}
    </div>
  );
}
