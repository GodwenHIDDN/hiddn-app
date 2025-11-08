export default function RecommendationSettings() {
  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-2" style={{ color: 'var(--text)' }}>Einstellungen zu den Empfehlungen</h1>
      <p style={{ color: 'var(--text)', opacity: 0.8 }}>Steuere, welche Inhalte dir gezeigt werden. Controls folgen.</p>
    </main>
  );
}
