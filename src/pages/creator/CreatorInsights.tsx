export default function CreatorInsights() {
  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-2" style={{ color: 'var(--text)' }}>Creator‑Statistiken</h1>
      <p style={{ color: 'var(--text)', opacity: 0.8, marginBottom: 12 }}>Views, Klicks, Produkte – deine Performance auf einen Blick.</p>
      <section className="grid grid-cols-3 gap-3">
        {[
          { label:'Views', value:0 },
          { label:'Clicks', value:0 },
          { label:'Produkte', value:0 }
        ].map(({label, value}) => (
          <div key={label} className="rounded-2xl border p-3 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)', color: 'var(--text)' }}>
            <p style={{ fontSize: 12, opacity: 0.85 }}>{label}</p>
            <h3 className="font-display" style={{ fontSize: 20 }}>{value}</h3>
          </div>
        ))}
      </section>
    </main>
  );
}
