import 'dotenv/config';
import {MongoClient} from 'mongodb';

const USER = process.env.MONGO_URI || null;
const URI = `mongodb+srv://${USER}@cluster0.dgyam3d.mongodb.net/hue_and_you?retryWrites=true&w=majority&appName=Cluster0`;
const DB_NAME = 'hue_and_you';
export const SHARE_COLLECTION = 'share_links';

let client = null;
let db = null;

//Starts the MongoDB connection, this gets run in app.js when the server starts
async function startConnection() {
  if (db) return; //Connection already started

  try {
    client = new MongoClient(URI);
    await client.connect();
    db = client.db(DB_NAME);
  } catch (error) {
    console.error('Failed to start connection on MongoDB: ', error);
    throw error;
  }
}

//Controllers/ShareRepository can use this method to use the database
function getDb() {
  return db;
}

async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export {startConnection, closeConnection, getDb};
