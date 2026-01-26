import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import api from './api/api.js';
import {Logger} from './middleware/Logger.js';
import {MongoClient} from 'mongodb';
import 'dotenv/config';
import OAuthServer from 'express-oauth-server';
import register from './auth/register.js';
import oAuthModel from './auth/oAuthModel.js';

const app = express();
const port = 3000;

// DO NOT COMMIT this, we will handle the connection string different later
const connectionString = process.env.MONGODB_CONNECTION_STRING

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist'); // absoluter Pfad

// JSON Parser
app.use(express.json());

//OATH 2 Standard Credentials
app.use(express.urlencoded({extended: false})); // in OAuth2 standard, credentials are sent as "application/x-www-form-urlencoded", this middleware allows parsing it

// API
//app.use('/api', Logger, api);

//DB Connection to MongoDB Atlas
try {
  const client = new MongoClient(connectionString);
  await client.connect();
  const db = client.db('catbrawl');

  app.set('db', db); // save a reference to the db to app config

  // we add TTL indexes to expiration fields to automatically remove expired entries
  db.collection('token').createIndex({accessTokenExpiresAt: 1}, {expireAfterSeconds: 0});
  db.collection('token').createIndex({refreshTokenExpiresAt: 1}, {expireAfterSeconds: 0});
  db.collection('token').createIndex({emailTokenExpiresAt: 1}, {expireAfterSeconds: 0});

  const oauth = new OAuthServer({model: oAuthModel(db)}); // create oauth middleware

  // backend routes
  app.use('/api/token', oauth.token({requireClientAuthentication: {password: false, refresh_token: false}})); // use oauth token middleware
  app.use('/api/register', register); // handle user registration
  app.use('/api/', oauth.authenticate(), Logger, api); // use oauth authentication middleware on any resource that should be protected

  // Static Files
  app.use(express.static(distPath)); // absoluter Pfad

  // SPA Fallback
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html')); // absoluter Pfad
  });

  // start server
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Serving static files from: ${distPath}`);
  });
} catch (err) {
  console.error(err);
}



