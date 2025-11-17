import type { ReactNode } from 'react'

interface AppLayoutProps {
  header: ReactNode
  primary: ReactNode
  sidebar: ReactNode
}

function AppLayout({ header, primary, sidebar }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {header}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">{primary}</section>
          <aside className="space-y-4">{sidebar}</aside>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
