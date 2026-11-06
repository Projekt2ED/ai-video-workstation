import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PORT } from './server/config';
import tasksRouter from './server/routes/tasks';
import aiRouter from './server/routes/ai';
import vodRouter from './server/routes/vod';
import aideoRouter from './server/routes/aideo';

const app = express();
app.use(express.json({ limit: '50mb' }));

app.use(tasksRouter);
app.use(aiRouter);
app.use(vodRouter);
app.use(aideoRouter);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
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
    console.log(`
╔══════════════════════════════════════════════════╗
║      出海AI工具平台 - 服务已启动                  ║
╠══════════════════════════════════════════════════╣
║  访问地址: http://localhost:${PORT}                  ║
╠══════════════════════════════════════════════════╣
║  API接口:                                       ║
║  ├── POST /api/ai/asr         视频下载+ASR识别   ║
║  ├── POST /api/ai/rewrite     LLM脚本仿写        ║
║  ├── POST /api/ai/translate   LLM翻译           ║
║  ├── POST /api/ai/generate-video 视频生成       ║
║  ├── POST /api/ai/process-video  智能处理       ║
║  ├── POST /api/vod/apply-upload  VOD上传凭证    ║
║  ├── POST /api/vod/upload-file   VOD文件上传    ║
║  ├── POST /api/aideo/submit      Aideo提交      ║
║  └── GET  /api/aideo/result/:id  Aideo查询      ║
╚══════════════════════════════════════════════════╝
`);
  });
}

startServer();
