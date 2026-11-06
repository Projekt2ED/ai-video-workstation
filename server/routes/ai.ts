import { Router } from 'express';
import { callASR } from '../services/asr';
import { callArkLLM } from '../services/llm';
import { uploadToVOD } from '../services/videoPipeline';
import { downloadVideo } from '../services/videoDownloader';
import { submitTranslation, getTranslationStatus, listTranslationProjects } from '../services/aiTranslation';

const router = Router();

router.post('/api/ai/asr', async (req, res) => {
  const { url } = req.body;
  console.log(`[ASR] URL: ${url?.slice(0, 80)}`);

  try {
    let videoUrl = url;

    // 从分享文本中提取 http 链接
    const httpMatch = url?.match(/https?:\/\/[^\s]+/);
    if (httpMatch) {
      videoUrl = httpMatch[0];
      console.log(`[ASR] 提取到链接: ${videoUrl}`);
    }

    if (videoUrl && videoUrl.startsWith('http')) {
      try {
        const { buffer, fileName } = await downloadVideo(videoUrl);
        const result = await uploadToVOD(buffer, fileName);
        videoUrl = result.playUrl;
        console.log(`[ASR] 上传到VOD完成`);
      } catch (e: any) {
        console.log(`[ASR] 下载/上传跳过: ${e.message}`);
      }
    }

    const result = await callASR(videoUrl);
    return res.json({ transcript: result.transcript, niche: result.niche || '工业制品', error: result.transcript ? undefined : 'ASR未识别到语音' });
  } catch (error: any) {
    console.error('[ASR] Error:', error);
    res.json({ transcript: '', niche: '工业制品', error: error.message });
  }
});

router.post('/api/ai/rewrite', async (req, res) => {
  const { transcript, productInfo, anchorStyle } = req.body;
  console.log(`[Rewrite] transcript长度: ${transcript?.length || 0}`);

  try {
    const prompt = `你是TikTok出海短视频脚本专家。

原始逐字稿：${transcript}
产品信息：${productInfo || '高端工业制品，支持OEM定制'}
出镜人设：${anchorStyle || '热情专业的工厂代言人'}

请仿写英文脚本，返回JSON：
{"hook":"开场钩子","cta":"行动号召","scenes":[{"sceneNumber":1,"visual":"画面描述","voiceover":"英文台词","duration":5}]}`;

    const response = await callArkLLM(prompt);
    try {
      res.json(JSON.parse(response));
    } catch {
      res.status(500).json({ error: 'LLM 返回了非 JSON 格式的内容' });
    }
  } catch (error: any) {
    console.error('[Rewrite] Error:', error.message);
    res.status(500).json({ error: error.message || 'LLM 调用失败' });
  }
});

router.post('/api/ai/translate', async (req, res) => {
  const { originalContent } = req.body;
  console.log(`[Translate] content长度: ${originalContent?.length || 0}`);

  try {
    const prompt = `将中文翻译为英文出海视频脚本。
原文：${originalContent}
返回JSON：{"englishTitle":"标题","translatedTranscript":"翻译","scenes":[{"sceneNumber":1,"visual":"画面","voiceover":"台词","duration":5}]}`;

    const response = await callArkLLM(prompt);
    try {
      res.json(JSON.parse(response));
    } catch {
      res.status(500).json({ error: 'LLM 返回了非 JSON 格式的内容' });
    }
  } catch (error: any) {
    console.error('[Translate] Error:', error.message);
    res.status(500).json({ error: error.message || 'LLM 调用失败' });
  }
});

router.post('/api/ai/generate-video', async (req, res) => {
  const { scriptJson, materialVids } = req.body;
  console.log(`[GenVideo] materials: ${materialVids?.length || 0}`);
  res.status(501).json({ success: false, error: '视频生成服务暂未接入' });
});

// AI 翻译（数字人视频处理）
router.post('/api/ai/process-video', async (req, res) => {
  const { vid, targetLanguage, translationTypeList } = req.body;
  console.log(`[ProcessVideo] vid: ${vid}, lang: ${targetLanguage}, types: ${translationTypeList}`);

  if (!vid) {
    return res.status(400).json({ success: false, error: '缺少视频 Vid' });
  }

  try {
    const { projectId } = await submitTranslation({
      vid,
      sourceLanguage: 'zh',
      targetLanguage: targetLanguage || 'en',
      translationTypeList: translationTypeList || ['SubtitleTranslation', 'VoiceTranslation'],
    });

    console.log(`[ProcessVideo] 翻译任务已提交 - ProjectId: ${projectId}`);
    res.json({ success: true, projectId, message: '翻译任务已创建' });
  } catch (error: any) {
    console.error('[ProcessVideo] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 查询翻译任务状态
router.get('/api/ai/translation-status/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const status = await getTranslationStatus(projectId);
    res.json({ success: true, ...status });
  } catch (error: any) {
    console.error('[TranslationStatus] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 列出翻译项目
router.get('/api/ai/translations', async (req, res) => {
  try {
    const projects = await listTranslationProjects(req.query.vid as string);
    res.json({ success: true, projects });
  } catch (error: any) {
    console.error('[Translations] Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
