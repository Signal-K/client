# Automated Discovery Notification System

This system automatically notifies users about their unclassified discoveries via push notifications.

## Components

### 1. GitHub Action (`.github/workflows/notify-unclassified-discoveries.yml`)
- Runs every hour and on pushes to main/master
- Executes the notification script to check for unclassified discoveries
- Can also be triggered manually via GitHub Actions UI

### 2. Notification Script (`scripts/notify-unclassified-discoveries.js`)
- Finds users with unclassified discoveries (anomalies in `linked_anomalies` not in `classifications`)
- Sends push notifications to all unique endpoints for each user
- Deduplicates notifications by endpoint to avoid spam
- Logs comprehensive statistics

### 3. Manual API Route (`/api/notify-my-discoveries`)
- Allows authenticated users to check their own unclassified discoveries
- Sends notifications immediately for that specific user
- Returns discovery count and notification status

### 4. UI Button Integration
- Added "🔬 Check My Discoveries" button to NotificationSubscribeButton component
- Available on the main dashboard (`/app/page.tsx`)
- Shows count of unclassified discoveries and notification status

## Setup Instructions

### Required Environment Variables

Add these to your GitHub repository secrets and local `.env.local`:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

### Local Testing

Run the notification script locally:
```bash
npm run notify:discoveries
```

### Database Logic

The system identifies unclassified discoveries by:
1. Finding all entries in `linked_anomalies` for a user
2. Checking if there's a corresponding entry in `classifications` where:
   - `classifications.author` = user's ID
   - `classifications.anomaly` = `linked_anomalies.anomaly_id`
3. If no classification exists, it's considered "unclassified"

### Notification Deduplication

- Notifications are deduplicated by `endpoint` to avoid sending multiple notifications to the same device
- Users can have multiple subscriptions (different browsers, devices) but each unique endpoint only gets one notification

### Notification Content

Notifications include:
- **Title**: "New Discovery Awaits Classification!" (singular) or "X New Discoveries Await Classification!" (plural)
- **Body**: Discovery name or count of discoveries
- **Icon**: Captain image (`/assets/Captn.jpg`)
- **Click Action**: Redirects to `/structures/telescope`

## Manual Usage

1. Subscribe to push notifications via the NotificationSubscribeButton
2. Deploy telescopes and discover anomalies
3. Click "🔬 Check My Discoveries" to manually check for unclassified discoveries
4. The system will also check automatically every hour via GitHub Actions

## Monitoring

- Check GitHub Actions logs for automated runs
- Manual API calls return detailed response with discovery counts
- Browser console logs show notification debugging information
