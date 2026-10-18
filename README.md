# 🍽️ KainSaan

**Find where to eat in and around Angeles City, Pampanga.**

A restaurant discovery and management web application developed as a final project for **6ADDBASE – Advanced Database using MongoDB (WD-303)**.

## Project Information

**Authors:**
- John Paul S. David
- Emilson Lio F. Madla
- Clarence Matthew F. Yabut
- Manjot Chamdal
- Vince Raiezen M. Cruzada

**GitHub Repository:** [6ADDBASE_6WCSERVER-WD-303-KainSaan](https://github.com/johnpauldavid27/6ADDBASE_6WCSERVER-WD-303-KainSaan)

## Project Description

**KainSaan** combines the Filipino words *kain* (eat) and *saan* (where). The website helps users discover restaurants in and around Angeles City, Pampanga, by presenting their names, cuisines, addresses, ratings, and contact information in an organized directory.

Visitors can browse restaurants, search by name or cuisine, sort the listings, and get a random restaurant suggestion. A separate management page supports adding, editing, deleting, restoring, and permanently removing restaurant records stored in MongoDB.

## Features

### For Visitors
- **Restaurant directory:** View available restaurants and their details.
- **Search:** Find restaurants by name or cuisine.
- **Filter and sort:** Filter by cuisine and sort by name or rating.
- **Pagination:** Browse restaurant listings 20 at a time.
- **Cuisine explorer:** See cuisine categories, their restaurant counts, and their top-rated restaurant.
- **Surprise Me:** Get a random restaurant recommendation from the current selection.
- **Responsive interface:** Browse on desktop or mobile devices.

### Restaurant Management
- **Create:** Add a restaurant with name, cuisine, address, rating, and contact details.
- **Read:** View restaurants stored in MongoDB.
- **Update:** Edit existing restaurant information.
- **Delete:** Move restaurant records to the trash instead of immediately removing them permanently.
- **Restore:** Recover deleted restaurants from the trash.
- **Permanent deletion:** Delete individual trash records or empty the trash.
- **Automatic trash expiration:** MongoDB uses a TTL index to expire deleted records after approximately 30 days.
- **Input validation:** Validate required fields, contact length, and ratings from 0 to 5.

> **Note:** The current management endpoints do not implement administrator authentication or authorization. The `/admin` page and write API routes should be protected before deploying this application for public use.

## Technologies Used

| Technology | Purpose |
| --- | --- |
| HTML5 | Page structure |
| CSS3 | Styling and responsive layout |
| JavaScript | Frontend interactions, filtering, and API requests |
| Node.js | Backend runtime |
| Express.js 5 | Web server and REST API |
| MongoDB | Restaurant and deleted-record storage |
| MongoDB Node.js Driver | Database connectivity |
| MongoDB Shell (`mongosh`) | Initial data seeding |

## Getting Started

### Prerequisites

- Node.js **20.6 or later** (for `--env-file` support)
- npm
- MongoDB running locally, or a MongoDB Atlas connection string
- `mongosh` installed if you plan to run the seed script

### 1. Clone the repository

```bash
git clone https://github.com/johnpauldavid27/6ADDBASE_6WCSERVER-WD-303-KainSaan.git
cd 6ADDBASE_6WCSERVER-WD-303-KainSaan
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the database connection

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017
PORT=3000
```

For MongoDB Atlas, replace `MONGO_URI` with your own valid Atlas connection string. Never commit credentials or the `.env` file to GitHub.

The application uses the database **`dbRestaurants`** and these collections:

- **`restaurants`**: Current restaurant listings
- **`deletedRestaurants`**: Soft-deleted restaurant records

### 4. Load the sample data (optional)

For a local MongoDB instance:

```bash
npm run seed
```

For MongoDB Atlas or a custom MongoDB connection:

```bash
mongosh "YOUR_MONGODB_CONNECTION_STRING" --file seed.js
```

**Warning:** `seed.js` drops and recreates the `restaurants` and `deletedRestaurants` collections. Running it removes existing records in those collections. Only run this on a database you intend to reset.

### 5. Run the application

```bash
npm start
```

Open **http://localhost:3000** in your browser.

## Website Pages

| Page | Location | Description |
| --- | --- | --- |
| Home | `/` | Introduction and restaurant discovery |
| Restaurants | `/restaurants.html` | Searchable, filterable restaurant directory |
| Cuisines | `/cuisines.html` | Cuisine-based browsing |
| About | `/about.html` | Project information and usage guide |
| Management | `/admin` | Restaurant CRUD and trash management |

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/restaurants` | Retrieve all active restaurants |
| `POST` | `/api/restaurants` | Create a restaurant |
| `PUT` | `/api/restaurants/:id` | Update a restaurant |
| `DELETE` | `/api/restaurants/:id` | Move a restaurant to trash |
| `GET` | `/api/trash` | Retrieve deleted restaurants |
| `POST` | `/api/trash/:id/restore` | Restore a deleted restaurant |
| `DELETE` | `/api/trash/:id` | Permanently delete a trash record |
| `DELETE` | `/api/trash` | Empty the trash |

### Example Restaurant Record

```json
{
  "restaurant_id": 1,
  "name": "Kapampangan Grill",
  "cuisine": "Filipino",
  "address": "Angeles City",
  "rating": 4.5,
  "contact": "Not listed"
}
```

## Project Structure

```text
KainSaan/
├── index.html           # Homepage
├── restaurants.html     # Restaurant directory
├── cuisines.html        # Cuisine directory
├── about.html           # About page
├── admin.html           # Restaurant management interface
├── server.js            # Express server and API routes
├── db.js                # MongoDB connection and TTL index
├── seed.js              # Database setup and sample records
├── api.js               # Frontend API requests
├── app.js               # Shared application interactions
├── admin.js             # Management functionality
├── restaurants.js       # Search, filter, sort, and pagination
├── cuisines.js          # Cuisine grouping and listings
├── home.js              # Homepage functionality
├── shared.js            # Shared frontend utilities
├── motion.js            # Motion effects
├── theme.js             # Theme-related behavior
├── queries.js           # Query utilities
├── styles.css           # Site styling
├── package.json         # Dependencies and npm scripts
└── README.md            # Project documentation
```

## Academic Purpose

This application was developed for academic purposes as part of the **6ADDBASE – Advanced Database using MongoDB** final project. It demonstrates MongoDB database connectivity, CRUD operations, a REST API, and a frontend for exploring and managing restaurant data.
