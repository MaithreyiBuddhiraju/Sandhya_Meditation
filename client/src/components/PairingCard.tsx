import type { ReactNode } from "react";
import type { Pairing } from "../types";
import "./PairingCard.css";

const traditionLabel: Record<Pairing["tradition"], string> = {
  gita: "Bhagavad Gita",
  devi_bhagavatam: "Srimad Devi Bhagavatam",
};

export function PairingCard({ pairing, children }: { pairing: Pairing; children?: ReactNode }) {
  return (
    <div className="card pairing-card">
      <section className="pairing-card__section">
        <p className="pairing-card__eyebrow">Today's Stoic Theme</p>
        <h2 className="pairing-card__concept">{pairing.stoic_concept}</h2>
        <p className="pairing-card__theme">{pairing.stoic_theme}</p>
        {pairing.stoic_source_ref && (
          <p className="pairing-card__ref text-muted">{pairing.stoic_source_ref}</p>
        )}
      </section>

      <hr className="pairing-card__divider" />

      <section className="pairing-card__section">
        <p className="pairing-card__eyebrow">{traditionLabel[pairing.tradition]}</p>
        <p className="pairing-card__verse-ref">{pairing.verse_ref}</p>
        <p className="pairing-card__verse">{pairing.verse_paraphrase}</p>
      </section>

      <div className="pairing-card__bridge">
        <p className="pairing-card__bridge-label">Journal prompt</p>
        <p className="pairing-card__bridge-text">{pairing.bridge_prompt}</p>
      </div>

      {children}
    </div>
  );
}
