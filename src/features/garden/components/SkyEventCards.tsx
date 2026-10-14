"use client";

import { useEffect, useState } from "react";

import styles from "../garden.module.css";
import { activeSkyCards, type SkyEventCard } from "../skyEvents";

/** Date-bound Space Week links. It has no server dependency or player write. */
export function SkyEventCards() {
  const [cards, setCards] = useState<SkyEventCard[]>([]);

  useEffect(() => setCards(activeSkyCards(Date.now())), []);

  if (cards.length === 0) return null;

  return (
    <aside className={styles.skyCards} aria-label="World Space Week sky events">
      <span className={styles.skyCardsKicker}>World Space Week · 4–10 Oct</span>
      {cards.map((card) => (
        <section key={card.id} className={styles.skyCard}>
          <h3>{card.title}</h3>
          <p>{card.body}</p>
          <div className={styles.skyCardLinks}>
            {card.links.map((link) => (
              <a key={`${link.href}:${link.label}`} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </section>
      ))}
    </aside>
  );
}
