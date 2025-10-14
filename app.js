require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const handleError = require('./helpers/handleError');
const routes = require('./routes');


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//router
app.use(routes);

//error handler
app.use(handleError);

//server
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})