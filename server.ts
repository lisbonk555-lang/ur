import express from 'express';
import path from 'path';
import { corsMiddleware } from './middleware.js';
import {
  handleDocs,
  handleExecute,
  handleGetBots,
  handleHealth,
  handleLeaderboard,
  handleQuote,
  handleReferrals,
  handleRegisterBot,
  handleStats,
  handleWellKnown,
  handleYields,
  handleBrainsStatus,
  handleOmniMeshOpportunities,
  handleOmniMeshExecute,
  handleGetOmniMeshHistory,
  handleNexusSentryRiskMatrix,
  handleNexusSentryExecute,
  handleGetNexusSentryHistory
} from './lib/apiHandlers.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(corsMiddleware);

  // 1. Auto-discovery route
  app.get('/.well-known/upfrica.json', async (req, res) => {
    const data = await handleWellKnown();
    res.json(data);
  });

  // 2. Health check
  app.get('/api/v1/health', async (req, res) => {
    const data = await handleHealth();
    res.json(data);
  });

  // 3. Automated Brain Status
  app.get('/api/v1/brains/status', async (req, res) => {
    const data = await handleBrainsStatus();
    res.json(data);
  });

  // 4. OmniMesh Brain Routes
  app.get('/api/v1/brains/omnimesh/opportunities', async (req, res) => {
    const data = await handleOmniMeshOpportunities();
    res.json(data);
  });

  app.post('/api/v1/brains/omnimesh/execute', async (req, res) => {
    const result = await handleOmniMeshExecute(req.body || {});
    if (result.error) {
      res.status(result.status || 400).json({ error: result.error });
    } else {
      res.json(result.data);
    }
  });

  app.get('/api/v1/brains/omnimesh/history', async (req, res) => {
    const history = await handleGetOmniMeshHistory();
    res.json(history);
  });

  // 5. Nexus Sentry Brain Routes
  app.get('/api/v1/brains/nexussentry/risk-matrix', async (req, res) => {
    const data = await handleNexusSentryRiskMatrix();
    res.json(data);
  });

  app.post('/api/v1/brains/nexussentry/execute', async (req, res) => {
    const result = await handleNexusSentryExecute(req.body || {});
    if (result.error) {
      res.status(result.status || 400).json({ error: result.error });
    } else {
      res.json(result.data);
    }
  });

  app.get('/api/v1/brains/nexussentry/history', async (req, res) => {
    const history = await handleGetNexusSentryHistory();
    res.json(history);
  });

  // 6. Yields aggregator
  app.get('/api/v1/yields', async (req, res) => {
    const data = await handleYields();
    res.json(data);
  });

  // 7. Register Bot
  app.post('/api/v1/register_bot', async (req, res) => {
    const result = await handleRegisterBot(req.body || {});
    if (result.error) {
      res.status(result.status || 400).json({ error: result.error, bot_id: result.bot_id });
    } else {
      res.status(201).json(result.data);
    }
  });

  // 8. Get Bots
  app.get('/api/v1/bots', async (req, res) => {
    const list = await handleGetBots();
    res.json(list);
  });

  // 9. Quote
  app.post('/api/v1/quote', async (req, res) => {
    const result = await handleQuote(req.body || {});
    if (result.error) {
      res.status(result.status || 400).json({ error: result.error });
    } else {
      res.json(result.data);
    }
  });

  // 10. Execute
  app.post('/api/v1/execute', async (req, res) => {
    const result = await handleExecute(req.body || {});
    if (result.error) {
      res.status(result.status || 400).json({ error: result.error });
    } else {
      res.json(result.data);
    }
  });

  // 11. Leaderboard
  app.get('/api/v1/leaderboard', async (req, res) => {
    const list = await handleLeaderboard();
    res.json(list);
  });

  // 12. Stats
  app.get('/api/v1/stats', async (req, res) => {
    const stats = await handleStats();
    res.json(stats);
  });

  // 13. Referrals
  app.get('/api/v1/referrals/:bot_id', async (req, res) => {
    const ref = await handleReferrals(req.params.bot_id);
    res.json(ref);
  });

  // 14. OpenAPI Docs
  app.get('/api/v1/docs', (req, res) => {
    const docs = handleDocs();
    res.json(docs);
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UpFrica Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[UpFrica Server] Failed to start server:', err);
});
