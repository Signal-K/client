"use client";

import { useEffect, useState } from "react";

import styles from "../garden.module.css";
import { SPACE_WEEK_LINKS, activeSkyCards, spaceWeekOpen, type SkyEventCard } from "../skyEvents";

/** Space Week banner and cards (SSC-41, SSC-44): each card is live from its date and all come down after 11 Oct. Link-out only. */
export function SkyEventCards() {
  const [state, setState] = useState<{ open: boolean; cards: SkyEventCard[] }>({ open: false, cards: [] });
  useEffect(() => {
    const now = Date.now();
    setState({ open: spaceWeekOpen(now), cards: activeSkyCards(now) });
  }, []);
  if (!state.open) return null;
  return (
    <aside className={styles.skyCards} aria-label="World Space Week sky events">
      <section className={styles.skyCard}>
        <h3>World Space Week · 4–10 Oct</h3>
        {SPACE_WEEK_LINKS.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label} →
          </a>
        ))}
      </section>
      {state.cards.map((card) => (
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
