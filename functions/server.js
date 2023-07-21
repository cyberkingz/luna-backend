const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');

const app = express();
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

router.get('/products', async (req, res) => {
  try {
    const shop = "luna-ai";
    const password = "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";

    const query = `
    {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
      }
    }`;

    const endpoint = `https://${shop}.myshopify.com/admin/api/2023-07/graphql.json`;

    const response = await axios.post(
      endpoint,
      {
        query,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": password,
        },
      }
    );

    res.json(response.data.data.products.edges);
  } catch (error) {
    console.error('API Request Error:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.use('/.netlify/functions/server', router);

// Configuration du port d'écoute
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});

module.exports.handler = serverless(app);