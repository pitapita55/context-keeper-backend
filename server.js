// server.js - Context Keeper Backend - FIXED
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage
let teachings = [];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Context Keeper API running' });
});

// Get all teachings
app.get('/api/memory', (req, res) => {
  res.json({ teachings });
});

// Store a teaching
app.post('/api/memory', (req, res) => {
  const { lesson, original, ai_response } = req.body;
  
  const teaching = {
    id: Date.now().toString(),
    lesson: lesson || original || 'No lesson provided',
    original: original || lesson || 'No original provided',
    ai_response: ai_response || null,
    created_at: new Date().toISOString(),
    reinforced_count: 1
  };
  
  teachings.push(teaching);
  
  console.log(`📚 Stored teaching. Total: ${teachings.length}`);
  
  res.json({ 
    message: 'Context Keeper API ready',
    teaching,
    stored: true,
    total_teachings: teachings.length
  });
});

// Inject memory into AI prompt
app.post('/api/memory/inject', (req, res) => {
  console.log(`🔍 Injection requested. Total teachings in memory: ${teachings.length}`);
  
  if (teachings.length === 0) {
    return res.json({ 
      context_prompt: '', 
      teachings_applied: [],
      message: 'No memories found'
    });
  }
  
  const context_prompt = `REMEMBER FROM PREVIOUS TEACHINGS:\n\n${teachings.map(t => `- ${t.lesson}`).join('\n')}\n\nDo not violate these lessons.`;
  
  console.log(`✅ Returning ${teachings.length} teachings`);
  
  res.json({
    context_prompt,
    teachings_applied: teachings,
    count: teachings.length,
    message: `Found ${teachings.length} memories`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧠 Context Keeper API running on port ${PORT}`);
});