import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GeminiKnowledgeAssistantService } from './geminiService';
import { serverStorage } from './storage';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const geminiAssistant = new GeminiKnowledgeAssistantService();

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Enactus Wits Knowledge Hub API',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Courses API
app.get('/api/courses', (req: Request, res: Response) => {
  res.json(serverStorage.courses);
});

app.post('/api/courses', (req: Request, res: Response) => {
  const newCourse = {
    ...req.body,
    id: `course-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
  serverStorage.courses.unshift(newCourse);
  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = serverStorage.courses.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }
  serverStorage.courses[index] = {
    ...serverStorage.courses[index],
    ...req.body,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  res.json(serverStorage.courses[index]);
});

app.delete('/api/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  serverStorage.courses = serverStorage.courses.filter(c => c.id !== id);
  res.json({ success: true, message: 'Course deleted' });
});

// Resources API
app.get('/api/resources', (req: Request, res: Response) => {
  res.json(serverStorage.resources);
});

app.post('/api/resources', (req: Request, res: Response) => {
  const newRes = {
    ...req.body,
    id: `res-${Date.now()}`,
    dateAdded: new Date().toISOString().split('T')[0],
  };
  serverStorage.resources.unshift(newRes);
  res.status(201).json(newRes);
});

app.put('/api/resources/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = serverStorage.resources.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  serverStorage.resources[index] = {
    ...serverStorage.resources[index],
    ...req.body,
  };
  res.json(serverStorage.resources[index]);
});

app.delete('/api/resources/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  serverStorage.resources = serverStorage.resources.filter(r => r.id !== id);
  res.json({ success: true, message: 'Resource deleted' });
});

// Categories API
app.get('/api/categories', (req: Request, res: Response) => {
  res.json(serverStorage.categories);
});

app.post('/api/categories', (req: Request, res: Response) => {
  const newCat = {
    ...req.body,
    id: `cat-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  serverStorage.categories.push(newCat);
  res.status(201).json(newCat);
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  serverStorage.categories = serverStorage.categories.filter(c => c.id !== id);
  res.json({ success: true, message: 'Category deleted' });
});

// Chatbot & Gemini Knowledge Base Query Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { query, user } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const userName = user?.name || 'Enactus Member';
    const userRole = user?.role || 'Member';
    const userStage = user?.businessStageId;

    // Call Gemini assistant service with real repository context
    const result = await geminiAssistant.generateAnswer({
      userQuery: query,
      userName,
      userRole,
      userStage,
      courses: serverStorage.courses,
      resources: serverStorage.resources
    });

    const timestamp = new Date().toISOString();

    // Log the interaction for administrative review
    serverStorage.logInteraction({
      userId: user?.id || 'anon',
      userName,
      userRole,
      businessStage: userStage,
      query,
      response: result.reply,
      timestamp,
      isFlagged: result.isFlagged,
      flagReason: result.flagReason,
      sourcesCount: result.sources.length,
    });

    // If flagged, queue in flagged questions for admin review
    if (result.isFlagged) {
      serverStorage.flagQuestion({
        userId: user?.id || 'anon',
        userName,
        userRole,
        businessStage: userStage,
        question: query,
        timestamp,
      });
    }

    res.json(result);
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: 'Failed to process chat query' });
  }
});

// Admin Review Endpoints
app.get('/api/chat/logs', (req: Request, res: Response) => {
  res.json(serverStorage.chatLogs);
});

app.get('/api/chat/flagged', (req: Request, res: Response) => {
  res.json(serverStorage.flaggedQuestions);
});

app.put('/api/chat/flagged/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminAnswer, adminNotes, reviewedBy } = req.body;
  const index = serverStorage.flaggedQuestions.findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Flagged question not found' });
  }

  serverStorage.flaggedQuestions[index] = {
    ...serverStorage.flaggedQuestions[index],
    status: status || serverStorage.flaggedQuestions[index].status,
    adminAnswer: adminAnswer !== undefined ? adminAnswer : serverStorage.flaggedQuestions[index].adminAnswer,
    adminNotes: adminNotes !== undefined ? adminNotes : serverStorage.flaggedQuestions[index].adminNotes,
    reviewedBy: reviewedBy || serverStorage.flaggedQuestions[index].reviewedBy,
    reviewedAt: new Date().toISOString(),
  };

  res.json(serverStorage.flaggedQuestions[index]);
});

app.listen(port, () => {
  console.log(`Enactus Wits Knowledge Hub API running at http://localhost:${port}`);
});
