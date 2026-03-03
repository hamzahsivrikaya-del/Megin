export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4 pt-8">
        {children}
      </div>
    </div>
  )
}
