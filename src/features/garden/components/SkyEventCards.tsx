"use client";

import { useEffect, useState } from "react";

import styles from "../garden.module.css";
import { activeSkyCards, activeSkySeason, type SkyEventCard, type SkySeason } from "../skyEvents";

/** Banner and cards for the current sky season (Space Week, Leonids, Geminids): each card is live from its date. Link-out only. */
export function SkyEventCards() {
  const [state, setState] = useState<{ season: SkySeason | null; cards: SkyEventCard[] }>({ season: null, cards: [] });
  useEffect(() => {
    const now = Date.now();
    setState({ season: activeSkySeason(now), cards: activeSkyCards(now) });
  }, []);
  const { season } = state;
  if (!season) return null;
  return (
    <aside className={styles.skyCards} aria-label={`${season.title} sky events`}>
      <section className={styles.skyCard}>
        <h3>{season.title}</h3>
        {season.links.map((link) => (
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
