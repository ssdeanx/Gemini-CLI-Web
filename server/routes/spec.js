
import express from 'express';
import { getGeminiSpec } from '../gemini-cli.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { type, context } = req.body;

  try {
    const spec = await getGeminiSpec(type, context);
    res.json({ spec });
  } catch (error) {
    console.error(`Error generating ${type} spec:`, error);
    res.status(500).json({ error: `Failed to generate ${type} spec` });
  }
});

export default router;
