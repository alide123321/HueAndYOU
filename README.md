# Hue & YOU

Hue & YOU is an accessibility-focused color palette generator and sharing app. It combines palette creation, WCAG-aware contrast analysis, and shareable results so designers can explore accessible color combinations and ensure their designs meet accessibility standards.

## Prerequisites

- Node.js 18+ installed
- npm available from Node.js installation
- MongoDB Atlas account or MongoDB server if you need share-link persistence and integration tests

## Install

Clone the repository from Bitbucket and install dependencies:

```bash
git clone https://user@bitbucket.org/larsontexts/hue-and-you.git #replace with actual repo URL, obtained from Bitbucket
cd hue-and-you
npm install
```

## Environment setup

This project uses `dotenv` for database configuration. Create a `.env` file in the project root with the following content:

```env
MONGO_USER=username:password
```

### Notes for `MONGO_USER`

- The app constructs the connection string using a fixed Atlas cluster host:
  `mongodb+srv://${MONGO_USER}@cluster0.dgyam3d.mongodb.net/hue_and_you?retryWrites=true&w=majority&appName=Cluster0`
- Set `MONGO_USER` to the MongoDB username and password pair in the form `username:password`.
- If your credentials contain special characters, URL-encode them.
- If you do not configure MongoDB, the application will still serve the web interface, but features or tests that rely on the share database may not function.

## Running the server

Start the app from the root directory:

```bash
npm start
```

Then open:

- `http://localhost:3000`

## Testing

Run the Jest test suite:

```bash
npm test
```

Additional test commands:

- `npm run test:record` — run tests and save results under `test-results`
- `npm run test:clean` — clean test artifacts
- `npm run test:zip` — create a zip archive of test outputs
- `npm run test:inventory` — generate a test inventory report
- `npm run test:help` — show available test helper information

## Project structure

- `app.js` — main Express server entrypoint
- `public/` — frontend UI assets and pages
- `src/` — backend application code
  - `src/api/` — API handlers
  - `src/data/` — MongoDB connection client
  - `src/harmony/` — harmony palette generation logic
  - `src/sharing/` — share persistence logic
  - `src/routes/` — route definitions
- `shared/` — shared utility code and accessibility support
- `Tests/` — test suites and helpers

## Database details

The application uses MongoDB for share-link persistence. The database is configured in `src/data/MongoClient.js` and connects to the `hue_and_you` database and `share_links` collection.

### MongoDB connection details

- Database name: `hue_and_you`
- Collection: `share_links`
- Environment variable: `MONGO_USER`

## Notes

- The server runs on port `3000` by default.
- The project is configured as an ES module (`type: "module"`) in `package.json`.
- The test configuration maps custom module aliases used in the source tree.
