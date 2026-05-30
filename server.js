const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage (replace with database later)
const teachings = [];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Context Keeper API running' });
});

// Get all teachings
app.get('/api/memory', (req, res) => {
  res.json({ teachings });
});

// Store a teaching (with Claude AI learning)
app.post('/api/memory', async (req, res) => {
  const { lesson, original, ai_response } = req.body;
  
  // Store the teaching
  const teaching = {
    id: Date.now().toString(),
    lesson,
    original,
    ai_response: ai_response || null,
    created_at: new Date().toISOString(),
    reinforced_count: 1
  };
  
  teachings.push(teaching);
  
  res.json({ 
    message: 'Context Keeper API ready',
    teaching,
    stored: true,
    total_teachings: teachings.length
  });
});

// Inject memory into AI prompt
app.post('/api/memory/inject', (req, res) => {
  const { user_message } = req.body;
  
  // Find relevant teachings (simple keyword match for now)
  const relevantTeachings = teachings.filter(t => 
    user_message.toLowerCase().includes('sequential') || 
    t.lesson.toLowerCase().includes('parallel')
  );
  
  if (relevantTeachings.length === 0) {
    return res.json({ 
      context_prompt: '', 
      teachings_applied: [],
      message: 'No relevant memories found'
    });
  }
  
  const context_prompt = `REMEMBER FROM PREVIOUS TEACHINGS:\n\n${relevantTeachings.map(t => `- ${t.lesson}`).join('\n')}\n\nDo not violate these lessons.`;
  
  res.json({
    context_prompt,
    teachings_applied: relevantTeachings,
    count: relevantTeachings.length
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`?? Context Keeper API running on port ${PORT}`);
});