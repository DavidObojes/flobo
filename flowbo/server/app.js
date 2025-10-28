import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import api from './api/api.js';
import { Logger } from './middleware/Logger.js';

const app = express();
const port = 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist'); // ✅ absoluter Pfad

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Serving static files from: ${distPath}`);
});
