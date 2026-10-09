/* ==========================================================================
   server.js  |  BACKEND  |  KainSaan (6ADDBASE Final Project)

   Express web server and REST API for the restaurant records.
   The MongoDB connection itself is in db.js (connectDB).

   Routes:
     GET    /api/restaurants           READ    list all restaurants
     POST   /api/restaurants           CREATE  add a restaurant
     PUT    /api/restaurants/:id       UPDATE  edit a restaurant
     DELETE /api/restaurants/:id       DELETE  move a restaurant to the trash
     GET    /api/trash                 list deleted restaurants
     POST   /api/trash/:id/restore     restore a deleted restaurant
     DELETE /api/trash/:id             permanently delete one trash item
     DELETE /api/trash                 empty the trash
   ========================================================================== */

const express = require("express");
const path = require("path");
const { ObjectId } = require("mongodb");
const { connectDB } = require("./db");   // database connection lives in db.js

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());                 // parse JSON request bodies

// Collections, assigned once connectDB() succeeds (see bottom of file)
let restaurants;
let deletedRestaurants;

/* ---------- Helpers ---------- */

// Validates and cleans the data sent from the add/edit forms.
// Returns a clean object, or null if the data is invalid.
function clean(body) {
  const data = {
    name: String(body.name || "").trim(),
    cuisine: String(body.cuisine || "").trim(),
    address: String(body.address || "").trim(),
    rating: Number(body.rating),
    contact: String(body.contact || "").trim()
  };
  const valid =
    data.name &&
    data.cuisine &&
    data.address &&
    data.contact &&
    data.contact.length <= 80 &&
    !isNaN(data.rating) &&
    data.rating >= 0 &&
    data.rating <= 5;
  return valid ? data : null;
}

// Returns the next free restaurant_id (highest existing id + 1)
async function nextId() {
  const last = await restaurants.find().sort({ restaurant_id: -1 }).limit(1).toArray();
  return last.length ? last[0].restaurant_id + 1 : 1;
}

/* ---------- READ: list all restaurants ---------- */
app.get("/api/restaurants", async (req, res) => {
  try {
    const list = await restaurants
      .find({}, { projection: { _id: 0 } })
      .sort({ restaurant_id: 1 })
      .toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Could not load restaurants." });
  }
});

/* ---------- CREATE: add a new restaurant ---------- */
app.post("/api/restaurants", async (req, res) => {
  try {
    const data = clean(req.body);
    if (!data) return res.status(400).json({ message: "Invalid restaurant data." });
    const restaurant_id = await nextId();
    const doc = { restaurant_id, ...data, created_at: new Date() };
    await restaurants.insertOne(doc);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: "Could not add the restaurant." });
  }
});

/* ---------- UPDATE: edit an existing restaurant ---------- */
app.put("/api/restaurants/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = clean(req.body);
    if (!data) return res.status(400).json({ message: "Invalid restaurant data." });
    const result = await restaurants.updateOne({ restaurant_id: id }, { $set: data });
    if (result.matchedCount === 0) return res.status(404).json({ message: "Restaurant not found." });
    res.json({ restaurant_id: id, ...data });
  } catch (err) {
    res.status(500).json({ message: "Could not update the restaurant." });
  }
});

/* ---------- DELETE: move a restaurant to the trash (soft delete) ----------
   The record is copied to deletedRestaurants, then removed from restaurants. */
app.delete("/api/restaurants/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const doc = await restaurants.findOne({ restaurant_id: id });
    if (!doc) return res.status(404).json({ message: "Restaurant not found." });
    await deletedRestaurants.insertOne({ ...doc, deleted_at: new Date() });
    await restaurants.deleteOne({ restaurant_id: id });
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ message: "Could not delete the restaurant." });
  }
});

/* ---------- TRASH: list deleted restaurants (newest first) ---------- */
app.get("/api/trash", async (req, res) => {
  try {
    const list = await deletedRestaurants.find().sort({ deleted_at: -1 }).toArray();
    res.json(list.map(({ _id, ...rest }) => ({ trash_id: String(_id), ...rest })));
  } catch (err) {
    res.status(500).json({ message: "Could not load deleted restaurants." });
  }
});

/* ---------- TRASH: restore a deleted restaurant ----------
   If its old restaurant_id is already used, it is given a new one. */
app.post("/api/trash/:id/restore", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid id." });
    const _id = new ObjectId(req.params.id);
    const doc = await deletedRestaurants.findOne({ _id });
    if (!doc) return res.status(404).json({ message: "Deleted restaurant not found." });
    const { deleted_at, ...restaurant } = doc;
    const taken = await restaurants.findOne({ restaurant_id: restaurant.restaurant_id });
    if (taken) restaurant.restaurant_id = await nextId();
    await restaurants.insertOne(restaurant);
    await deletedRestaurants.deleteOne({ _id });
    const { _id: removed, ...out } = restaurant;
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: "Could not restore the restaurant." });
  }
});

/* ---------- TRASH: permanently delete one item ---------- */
app.delete("/api/trash/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid id." });
    const result = await deletedRestaurants.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Deleted restaurant not found." });
    res.json({ purged: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Could not delete the restaurant permanently." });
  }
});

/* ---------- TRASH: empty the trash ---------- */
app.delete("/api/trash", async (req, res) => {
  try {
    const result = await deletedRestaurants.deleteMany({});
    res.json({ purged: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: "Could not empty the trash." });
  }
});

/* ---------- Pages and static files (HTML, CSS, JS, images) ---------- */
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "admin.html")));
app.use(express.static(__dirname, { index: false }));

/* ---------- Start: connect to MongoDB, then start the web server ---------- */
connectDB()
  .then(db => {
    restaurants = db.restaurants;
    deletedRestaurants = db.deletedRestaurants;
    app.listen(PORT, () => console.log(`KainSaan running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });