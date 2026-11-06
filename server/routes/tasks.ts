import { Router } from 'express';
import { taskStore } from '../services/taskStore';

const router = Router();

router.get('/api/tasks', (req, res) => {
  res.json({ tasks: taskStore.getAll() });
});

router.post('/api/tasks', (req, res) => {
  const { name, type, tiktokUrl, videoFileName } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Missing name or type' });
  }
  const task = taskStore.create({ name, type, tiktokUrl, videoFileName });
  res.json({ success: true, task });
});

router.post('/api/tasks/update', (req, res) => {
  const { id, ...data } = req.body;
  const task = taskStore.update(id, data);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ success: true, task });
});

router.delete('/api/tasks/:id', (req, res) => {
  taskStore.delete(req.params.id);
  res.json({ success: true });
});

export default router;
