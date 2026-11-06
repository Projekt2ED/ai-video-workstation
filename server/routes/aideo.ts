import { Router } from 'express';
import { VOD_SPACE_NAME } from '../config';
import { getVodService } from '../services/vodClient';

const vodService = getVodService();
const router = Router();

router.post('/api/aideo/submit', async (req, res) => {
  const { vid, skillType, skillParams, prompt } = req.body;
  console.log(`[Aideo] 提交任务 - Vid: ${vid}, SkillType: ${skillType}`);

  try {
    const params: any = {
      SpaceName: VOD_SPACE_NAME,
      MultiInputs: [{ Type: 'Vid', Vid: vid }],
    };

    if (prompt) {
      params.Prompt = prompt;
    } else if (skillType) {
      params.SkillType = skillType;
      if (skillParams) {
        params.SkillParams = typeof skillParams === 'string' ? skillParams : JSON.stringify(skillParams);
      }
    }

    const result = await vodService.fetchOpenAPI({
      Action: 'SubmitAideoTaskAsync',
      Version: '2025-03-03',
      method: 'POST',
      data: params,
    });
    console.log(`[Aideo] 任务提交成功 - TaskId: ${result?.Result?.TaskId}`);
    res.json({ success: true, taskId: result?.Result?.TaskId });
  } catch (error: any) {
    console.error('[Aideo] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/aideo/result/:taskId', async (req, res) => {
  const { taskId } = req.params;
  console.log(`[Aideo] 查询任务 - TaskId: ${taskId}`);

  try {
    const result = await vodService.fetchOpenAPI({
      Action: 'GetAideoTaskResult',
      Version: '2025-03-03',
      method: 'GET',
      query: {
        SpaceName: VOD_SPACE_NAME,
        TaskId: taskId,
      },
    });

    console.log(`[Aideo] 查询成功 - Status: ${result?.Result?.Status}`);
    res.json(result?.Result || result);
  } catch (error: any) {
    console.error('[Aideo] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
