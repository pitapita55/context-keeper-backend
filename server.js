const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Context Keeper API running' });
});

app.post('/api/memory', (req, res) => {
  res.json({ 
    message: 'Context Keeper API ready',
    teaching: req.body,
    stored: true
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧠 Context Keeper API running on port ${PORT}`);
});