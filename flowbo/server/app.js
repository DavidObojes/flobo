import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import api from "./api/api.js";
import {Logger} from "./middleware/Logger.js";

const app = express();
const port = 3000;

// defining __dirname is only required in module-js
// in common-js it is predefined and always available
const __dirname = path.dirname(fileURLToPath(import.meta.url));

//API Routes
app.use('/api',Logger,api)

//Serve Static Files from Build ("root/dist")
app.use(express.static('dist'));

//JSON Parser (Middleware zum Lesen von JSON Bodies)
app.use(express.json());

//Fallback to SPA if there is no server route
app.use(function(req, res) {
  res.sendFile(path.join(__dirname, './dist/index.html'));
});

// start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
