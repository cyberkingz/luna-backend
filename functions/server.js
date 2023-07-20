const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app);
