import express from 'express';

export function createEmailRoutes(emailService) {
  const router = express.Router();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * POST /send
   * Body: { id, to, subject, body }
   */
  router.post('/send', async (req, res) => {
    const { id, to, subject, body } = req.body;

    // Validate required fields
    if (!id || !to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    try {
      await emailService.sendEmail({ id, to, subject, body });
      res.json({ message: 'Email sending triggered or retried.' });
    } catch (err) {
      console.error('Error sending email:', err.message);
      if (err.message.includes('Rate limit exceeded')) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /status/:id
   * Params: id
   */
  router.get('/status/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const status = await emailService.getStatus(id);
      res.json({ id, status });
    } catch (err) {
      console.error('Error getting status:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
