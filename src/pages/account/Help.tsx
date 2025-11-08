export default function Help() {
  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--text)' }}>Hilfe & Kontakt</h1>
      <section className="rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)', color: 'var(--text)' }}>
        <p style={{ opacity: 0.9 }}>Du hast Fragen oder brauchst Support?<br/>Schreib uns direkt per E‑Mail.</p>
        <div style={{ marginTop: 16 }}>
          <a href="mailto:contact@its-hiddn.com" className="pressable" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(90deg, #6a11cb, #2575fc)', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
            contact@its-hiddn.com
          </a>
        </div>
      </section>
    </main>
  );
}
