import { Router } from 'express';
import multer from 'multer';
import { VOD_SPACE_NAME } from '../config';
import { uploadToVOD } from '../services/videoPipeline';
import { getVodService } from '../services/vodClient';

const vodService = getVodService();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});
const router = Router();

router.post('/api/vod/apply-upload', async (req, res) => {
  const { spaceName, fileType = 'video' } = req.body;
  console.log(`[VOD] 获取上传凭证 - SpaceName: ${spaceName || VOD_SPACE_NAME}`);

  try {
    const result = await vodService.ApplyUploadInfo({
      SpaceName: spaceName || VOD_SPACE_NAME,
      FileType: fileType,
    });
    console.log(`[VOD] 上传凭证获取成功`);
    res.json(result);
  } catch (error: any) {
    console.error('[VOD] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/vod/upload-file', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: '文件太大，最大支持500MB' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  console.log(`[VOD] 文件上传`);

  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }
    console.log(`[VOD] 文件大小: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    const { vid } = await uploadToVOD(req.file.buffer, req.file.originalname);
    console.log(`[VOD] 上传完成 - Vid: ${vid}`);
    res.json({ success: true, vid, fileName: req.file.originalname });
  } catch (error: any) {
    console.error('[VOD] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/vod/commit-upload', async (req, res) => {
  const { spaceName, sessionKey, functions } = req.body;
  console.log(`[VOD] 确认上传`);

  try {
    const result = await vodService.CommitUploadInfo({
      SpaceName: spaceName || VOD_SPACE_NAME,
      SessionKey: sessionKey,
      Functions: functions || [],
    });
    console.log(`[VOD] 确认上传成功`);
    res.json(result);
  } catch (error: any) {
    console.error('[VOD] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/vod/media-info', async (req, res) => {
  const { spaceName, vid } = req.body;
  console.log(`[VOD] 获取媒体信息 - Vid: ${vid}`);

  try {
    const result = await vodService.GetMediaInfos({
      SpaceName: spaceName || VOD_SPACE_NAME,
      Vid: vid,
    });
    console.log(`[VOD] 媒体信息获取成功`);
    res.json(result);
  } catch (error: any) {
    console.error('[VOD] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
