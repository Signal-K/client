import { DataAPIClient } from '@datastax/astra-db-ts';
const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db('https://a4bce4e9-20d4-415d-9d8d-dea1bdf28801-us-east-2.apps.astra.datastax.com');

(async () => {
    const colls = await db.listCollections();
    console.log('Connected to AstraDB:', colls);
})();

export default db;