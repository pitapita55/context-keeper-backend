// server.js - Context Keeper Backend
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage (replace with database later)
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
  
  console.log(`📚 Stored teaching: ${teaching.lesson.substring(0, 50)}...`);
  console.log(`📚 Total teachings: ${teachings.length}`);
  
  res.json({ 
    message: 'Context Keeper API ready',
    teaching,
    stored: true,
    total_teachings: teachings.length
  });
});

// Inject memory into AI prompt - FIXED to return ALL teachings
app.post('/api/memory/inject', (req, res) => {
  const { user_message } = req.body;
  
  console.log(`🔍 Injection requested. Total teachings: ${teachings.length}`);
  
  // Return ALL teachings (no filtering)
  const relevantTeachings = teachings;
  
  if (relevantTeachings.length === 0) {
    console.log('❌ No teachings found');
    return res.json({ 
      context_prompt: '', 
      teachings_applied: [],
      message: 'No memories found'
    });
  }
  
  // Build context prompt from all teachings
  const context_prompt = `REMEMBER FROM PREVIOUS TEACHINGS:\n\n${relevantTeachings.map(t => `- ${t.lesson}`).join('\n')}\n\nDo not violate these lessons.`;
  
  console.log(`✅ Returning ${relevantTeachings.length} teachings`);
  
  res.json({
    context_prompt,
    teachings_applied: relevantTeachings,
    count: relevantTeachings.length,
    message: `Found ${relevantTeachings.length} memories`
  });
});

// Delete a teaching (optional)
app.delete('/api/memory/:id', (req, res) => {
  const { id } = req.params;
  const index = teachings.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Teaching not found' });
  }
  
  teachings.splice(index, 1);
  res.json({ message: 'Teaching deleted', total_teachings: teachings.length });
});

// Clear all teachings (admin only - for testing)
app.delete('/api/memory', (req, res) => {
  teachings = [];
  res.json({ message: 'All teachings cleared', total_teachings: 0 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧠 Context Keeper API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Memory endpoint: http://localhost:${PORT}/api/memory`);
});