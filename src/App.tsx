function App() {
  return (
    <main className="flex min-h-screen flex-col gap-8 bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Crossword PWA</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Building an offline-first crossword puzzle hub.
        </h1>
        <p className="text-lg text-muted-foreground">
          Tailwind CSS + shadcn/ui are ready. Start wiring parsers, sources, storage, and the SVG grid per
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-sm">AGENTS.md</code> to bring the full puzzle
          experience online and offline.
        </p>
      </section>
      <section className="mx-auto grid w-full max-w-5xl gap-4 rounded-2xl border border-dashed border-border p-6 text-left sm:grid-cols-2">
        <div>
          <h2 className="text-base font-semibold text-muted-foreground">Next steps</h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
            <li>Install shadcn/ui and seed shared UI primitives.</li>
            <li>Define puzzle/source types, Dexie schemas, and Zustand stores.</li>
            <li>Connect puzzle parsers and download services inspired by Shortyz.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold text-muted-foreground">Tech stack</h2>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
            <li>React 19 + Vite + TypeScript</li>
            <li>Tailwind CSS 3.4 with shadcn tokens</li>
            <li>Future: Zustand, Dexie, Workbox service worker</li>
          </ul>
        </div>
      </section>
    </main>
  )
}

export default App
