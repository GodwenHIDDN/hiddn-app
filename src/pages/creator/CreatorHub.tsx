export default function CreatorHub() {
  return (
    <main className="max-w-md mx-auto pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <div className="sticky top-[84px] z-10 w-full shadow-md" style={{ backgroundColor: 'var(--header)' }}>
        <div className="h-16 flex items-center px-4" style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
          <h1 className="font-display text-lg">Mach es zu deinem</h1>
        </div>
      </div>

      <div className="px-4 pt-4" style={{ color: 'var(--text)' }}>
        <section className="rounded-2xl border p-4 mb-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)' }}>
          <h2 className="font-display text-xl mb-1">Erstelle Creator</h2>
          <p className="opacity-80 text-sm">Starte deinen Shop und teile deine Drops.</p>
        </section>
        <section className="rounded-2xl border p-4 mb-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)' }}>
          <h2 className="font-display text-xl mb-1">Deine Brands</h2>
          <p className="opacity-80 text-sm">Verwalte Marken, mit denen du arbeitest.</p>
        </section>
        <section className="rounded-2xl border p-4 mb-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)' }}>
          <h2 className="font-display text-xl mb-1">Stats</h2>
          <p className="opacity-80 text-sm">Sieh dir Reichweite, Verkäufe und Trends an.</p>
        </section>
        <div style={{ height: 400 }} />
      </div>
    </main>
  );
}
