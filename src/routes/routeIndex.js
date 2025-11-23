// Route endpoints to appropriate js and pages
const express = require('express');
const router = express.Router();
const path = require('path');

const root = path.join(__dirname, '../../public/views');

// Serve the homepage
router.get('/', (req, res) => {
  res.sendFile('index.html', {root: root});
});

module.exports = router;
