---
description: Overview of the social mechanic in frontend
updatedAt: '2026-02-19T07:56:35.251Z'
title: Social Mechanic
---
# Social Mechanic

## Purpose

Support collaboration around discoveries through posts, comments, activity feeds, and community leaderboards.

## Component Areas

- `src/components/social/posts/`
- `src/components/social/comments/`
- `src/components/social/activity/`
- `src/components/tabs/InboxTab.tsx`

## Primary Routes

- `app/posts/[id]/page.tsx`
- `app/leaderboards/sunspots/page.tsx`

## Core Data Dependencies

- `classifications` (as source records for post context)
- `profiles`
- notification and activity data sources

## Notes

- Social interaction contributes to milestone progress.
- Discovery pages and social pages are intentionally coupled by classification IDs.
