export default function Notifications() {
  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--text)' }}>Benachrichtigungen</h1>
      {/* Example welcome notification */}
      <div className="rounded-2xl border p-4 mb-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--text)' }}>
        <div className="flex items-center justify-between">
          <p>Willkommen bei HIDDN, Creator!</p>
          <span style={{ opacity: 0.7, fontSize: 12 }}>vor 2 Tagen</span>
        </div>
      </div>
      {/* Empty rest state */}
      <div className="rounded-2xl border p-5 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)', color: 'var(--text)' }}>
        <p style={{ opacity: 0.85 }}>Keine weiteren Benachrichtigungen.</p>
      </div>
    </main>
  );
}
