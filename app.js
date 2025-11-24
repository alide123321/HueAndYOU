const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// routing
const routeIndex = require('./src/routes/routeIndex.js'); //branches into controllers (if necessary)

// home default route
app.use('/', routeIndex);

app.listen(port, () => {
  console.log(`Hue & YOU server listening on http://localhost:${port}`);
});
