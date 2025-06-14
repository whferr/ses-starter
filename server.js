const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
const dataDir = './data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Simple read/write for any JSON file
app.get('/api/:filename', (req, res) => {
  const file = path.join(dataDir, `${req.params.filename}.json`);
  if (fs.existsSync(file)) {
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')));
  } else {
    res.json([]);
  }
});

app.post('/api/:filename', (req, res) => {
  const file = path.join(dataDir, `${req.params.filename}.json`);
  fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

app.listen(3001, () => console.log('📁 Server running on http://localhost:3001')); 