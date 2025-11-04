import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import api from './api/api.js';
import { Logger } from './middleware/Logger.js';
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const app = express();
const port = 3000;

// DO NOT COMMIT this, we will handle the connection string different later
const connectionString = process.env.MONGODB_CONNECTION_STRING

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist'); // absoluter Pfad

// JSON Parser
app.use(express.json());

// API
app.use('/api', Logger, api);

// Static Files
app.use(express.static(distPath)); // absoluter Pfad

// SPA Fallback
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html')); // absoluter Pfad
});

//DB Connection to MongoDB Atlas
try {
  const client = new MongoClient(connectionString);
  await client.connect();
  const db = client.db('catbrawl');

  app.set('db', db); // save a reference to the db to app config

  // start server
  app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Serving static files from: ${distPath}`);
  });
} catch (err) {
  console.error(err);
}



