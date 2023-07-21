const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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
}`

const endpoint = `https://${shop}.myshopify.com/admin/api/2023-07/graphql.json`;

app.get('/products', async (req, res) => {
  try {
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

app.get('/webhook', (req, res) => {
  let VERIFY_TOKEN = "tonircd"

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);      
    }
  }
});

app.get('/messages/:id', async (req, res) => {
  const senderId = req.params.id;

  try {
    const doc = await db.collection('facebookMessenger').doc(senderId).get();
    if (doc.exists) {
      const messages = doc.data().messages;
      res.json({ messages });
    } else {
      res.json({ messages: [] });
    }
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      // Check if the event contains a message
      if (webhookEvent.message) {
        const userMessage = webhookEvent.message.text; // This is the message sent by the user

        const message = {
          id: senderId,
          text: userMessage // Now storing the user's message instead of a static string
        };

        const docRef = db.collection('facebookMessenger').doc(senderId);
        await docRef.set({ messages: admin.firestore.FieldValue.arrayUnion(message) }, { merge: true });

        // Send the user's message from FacebookDmCompo.js
        axios.post(`https://graph.facebook.com/v11.0/me/messages?access_token=EAATEgM1RKk0BABosedKHygwggbdNlTmoRZCZA85J93ZBubtMv7PxXrYCFzDLLBbjqxC7Ms3Rcmme3O0EqWij3zilG3J7eIUwkGgmJJBw8dhihjAywv1YhlZCQny778qwi6exxOW5ZCokRhrTKSJLpWxif2ZC9oqFYC2z4pJa8AUmw7AZATW0yZCviUAJKt6IEnzKjd7ZAedMzZBAZDZD`, {
          messaging_type: "RESPONSE",
          recipient: {
            id: senderId,
          },
          message: {
            text: req.body.message.text, // Use the message text from the request body
          },
        })
        .then(response => {
          console.log('Message sent');
          res.status(200).send('Message sent to user'); // Send response back to client
        })
        .catch(err => {
          console.error('Error sending message:', err);
          res.status(500).send('Failed to send message to user'); // Send error response back to client
        });
      }

    });
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});