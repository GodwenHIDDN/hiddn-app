export default function About() {
  const info = {
    company: 'Dein Unternehmen GmbH',
    address1: 'Musterstraße 1',
    address2: '12345 Musterstadt',
    country: 'Deutschland',
    managing: 'Max Mustermann',
    register: 'HRB 000000 (Amtsgericht Musterstadt)',
    vat: 'DE000000000',
    email: 'kontakt@example.com',
    phone: '+49 000 0000000',
  };
  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ color: 'var(--text)', paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-2">Impressum</h1>
      <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[15px] font-medium">{info.company}</p>
        <p className="text-sm">{info.address1}</p>
        <p className="text-sm">{info.address2}</p>
        <p className="text-sm mb-3">{info.country}</p>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">Geschäftsführung:</span> {info.managing}</p>
          <p><span className="font-medium">Registereintrag:</span> {info.register}</p>
          <p><span className="font-medium">USt-IdNr.:</span> {info.vat}</p>
          <p><span className="font-medium">E-Mail:</span> {info.email}</p>
          <p><span className="font-medium">Telefon:</span> {info.phone}</p>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-display text-xl mb-2">Hinweise</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Inhalte dieser App dienen Informations- und Präsentationszwecken.</li>
          <li>Bei Fragen zu Bestellungen, Widerruf oder Datenschutz kontaktiere uns per E‑Mail.</li>
        </ul>
      </section>
    </main>
  );
}
