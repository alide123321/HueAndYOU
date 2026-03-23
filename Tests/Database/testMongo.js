import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db(process.env.MONGODB_DB_NAME);
    await db.command({ ping: 1 });
    console.log('Ping successful');

    const collection = db.collection('share_links');

    await collection.createIndex({ code: 1 }, { unique: true });
    await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    console.log('Indexes created');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();