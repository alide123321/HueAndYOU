import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import routeIndex from './src/routes/routeIndex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// routing
// branches into controllers (if necessary)

// home default route
app.use('/', routeIndex);

app.listen(port, () => {
  console.log(`Hue & YOU server listening on http://localhost:${port}`);
});
