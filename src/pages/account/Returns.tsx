export default function Returns() {
  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--text)' }}>Rücksendungen</h1>
      <section className="rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)', color: 'var(--text)' }}>
        <div style={{ display:'grid', placeItems:'center', marginBottom: 10 }}>
          <svg width="92" height="92" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.8 }}>
            <path d="M4 7H20V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V7Z" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9 7V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V7" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        </div>
        <p style={{ opacity: 0.85 }}>Hier erscheinen deine Rücksendungen.<br/>Aktuell ist noch nichts da.</p>
      </section>
    </main>
  );
}
