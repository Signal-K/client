import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import {
  profiles,
  anomalies,
  classifications,
  comments,
  linked_anomalies,
  researched,
  events,
  profilesRelations,
  anomaliesRelations,
  classificationsRelations,
  commentsRelations,
  linkedAnomaliesRelations,
  researchedRelations,
} from './schema';

// Use your existing Supabase database URL from environment
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const sql = neon(connectionString);
export const db = drizzle(sql, { 
  schema: {
    profiles,
    anomalies,
    classifications,
    comments,
    linked_anomalies,
    researched,
    events,
    profilesRelations,
    anomaliesRelations,
    classificationsRelations,
    commentsRelations,
    linkedAnomaliesRelations,
    researchedRelations,
  }
});

// Export all schema tables and relations
export {
  profiles,
  anomalies,
  classifications,
  comments,
  linked_anomalies,
  researched,
  events,
  profilesRelations,
  anomaliesRelations,
  classificationsRelations,
  commentsRelations,
  linkedAnomaliesRelations,
  researchedRelations,
};
