const express = require('express')
const app = express()
const port = 3000

// Middleware to parse JSON bodies
app.use(express.json())

// routing
const routeIndex = require('./src/routes/routeIndex.js') //branches into controllers (if necessary)

// home default route
app.use('/', routeIndex) 


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
