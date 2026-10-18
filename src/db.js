/* ==========================================================================
   db.js  |  DATABASE CONNECTION  |  KainSaan (6ADDBASE Final Project)

   Opens the connection to MongoDB and hands the two collections the app
   uses to server.js:
     - restaurants         : the live records (dbRestaurants.restaurants)
     - deletedRestaurants  : soft-deleted records kept in a "trash"

   Configuration (environment variables, both optional):
     MONGO_URI : connection string. Default: mongodb://127.0.0.1:27017
                 (a local MongoDB; for MongoDB Atlas, use your Atlas URI)
   ========================================================================== */

const { MongoClient } = require("mongodb");

/* ---------- Connection settings ---------- */
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "dbRestaurants";      // database provided for the project
const TRASH_DAYS = 30;                // deleted records are purged after 30 days

/* ---------- connectDB ----------
   Connects once at startup and returns the collections.
   Throws if MongoDB cannot be reached, so server.js can stop with a clear message. */
async function connectDB() {
  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db(DB_NAME);

  const restaurants = db.collection("restaurants");
  const deletedRestaurants = db.collection("deletedRestaurants");

  // TTL index: MongoDB automatically removes trash documents TRASH_DAYS after deleted_at
  await deletedRestaurants.createIndex(
    { deleted_at: 1 },
    { expireAfterSeconds: TRASH_DAYS * 24 * 60 * 60 }
  );

  console.log(`Connected to MongoDB database "${DB_NAME}"`);
  return { client, restaurants, deletedRestaurants };
}

module.exports = { connectDB };