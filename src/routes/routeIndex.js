// Route endpoints to appropriate js and pages
const express = require('express')
const router = express.Router()
const path = require('path')

const root = "public/views"

// Serve the homepage
router.get('/', (req, res) => {
    res.sendFile("index.html", { root: root })
})

// Serve the CSS file
router.get('/style.css', (req, res) => {
    res.sendFile("style.css", { root: root })
})

module.exports = router