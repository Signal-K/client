"use client";

import { useEffect, useState } from "react";

import styles from "../garden.module.css";
import { activeSkyCards, type SkyEventCard } from "../skyEvents";

/** Space Week cards (SSC-41): each is live from its date and all come down after 11 Oct. Link-out only. */
export function SkyEventCards() {
  const [cards, setCards] = useState<SkyEventCard[]>([]);
  useEffect(() => setCards(activeSkyCards(Date.now())), []);
  if (cards.length === 0) return null;
  return (
    <aside className={styles.skyCards} aria-label="Space Week sky events">
      {cards.map((card) => (
        <section key={card.id} className={styles.skyCard}>
          <h3>{card.title}</h3>
          <p>{card.body}</p>
          {card.links.map((link) => (
            <a key={link.href + link.label} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label} →
            </a>
          ))}
        </section>
      ))}
    </aside>
  );
}
