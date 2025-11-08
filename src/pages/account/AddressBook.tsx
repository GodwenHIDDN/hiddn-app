import React from 'react';

export default function AddressBook() {
  return (
    <main className="max-w-md mx-auto p-6 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--text)' }}>Adressbuch</h1>
      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--header)', color: 'var(--text)' }}>
        <p>Hier kannst du Liefer- und Rechnungsadressen verwalten.</p>
      </div>
    </main>
  );
}
