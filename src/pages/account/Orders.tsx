export default function Orders() {
  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--text)' }}>Deine Bestellungen</h1>
      <section className="rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)', color: 'var(--text)' }}>
        <div style={{ display:'grid', placeItems:'center', marginBottom: 14 }}>
          <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.8 }}>
            <path d="M7 7V6C7 3.79086 8.79086 2 11 2C13.2091 2 15 3.79086 15 6V7" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M4 7.5C4 6.67157 4.67157 6 5.5 6H18.5C19.3284 6 20 6.67157 20 7.5V19.5C20 20.3284 19.3284 21 18.5 21H5.5C4.67157 21 4 20.3284 4 19.5V7.5Z" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        </div>
        <p style={{ opacity: 0.85 }}>Du hast noch keine Bestellungen.<br/>Sobald du etwas kaufst, erscheint es hier.</p>
      </section>
    </main>
  );
}
