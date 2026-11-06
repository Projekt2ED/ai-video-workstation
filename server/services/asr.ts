import { MEDIAKIT_API_KEY, MEDIAKIT_BASE_URL } from '../config';

export function detectNiche(text: string): string {
  const textLower = text.toLowerCase();
  if (textLower.includes('shoe') || textLower.includes('boot') || textLower.includes('鞋')) return '鞋类制造';
  if (textLower.includes('pack') || textLower.includes('包装') || textLower.includes('machine')) return '包装机械';
  if (textLower.includes('light') || textLower.includes('lamp') || textLower.includes('灯')) return '照明设备';
  if (textLower.includes('power') || textLower.includes('battery') || textLower.includes('电')) return '电源设备';
  return '工业制品';
}

export async function callASR(videoUrl: string): Promise<{ transcript: string; niche: string }> {
  console.log(`[ASR] Calling MediaKit for: ${videoUrl}`);

  const submitResp = await fetch(`${MEDIAKIT_BASE_URL}/tools/asr-subtitles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MEDIAKIT_API_KEY}`,
    },
    body: JSON.stringify({ video_url: videoUrl }),
  });

  const submitData: any = await submitResp.json();
  console.log(`[ASR] Submit result: ${submitData.success ? 'success' : 'failed'}, task_id: ${submitData.task_id}`);

  if (!submitData.success) {
    throw new Error(submitData.error?.message || 'ASR提交失败');
  }

  const taskId = submitData.task_id || submitData.data?.task_id;
  if (!taskId) {
    throw new Error('ASR未返回任务ID');
  }

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1500));

    const taskResp = await fetch(`${MEDIAKIT_BASE_URL}/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${MEDIAKIT_API_KEY}` },
    });
    const taskData: any = await taskResp.json();
    const status = taskData.status || taskData.data?.status;

    if (status === 'completed') {
      const result = taskData.result || taskData.data?.result || {};
      const subtitles = result.subtitles || [];
      const transcript = subtitles.map((s: any) => s.subtitle_text || s.text || '').join(' ');
      console.log(`[ASR] Success! ${subtitles.length} items`);
      return { transcript, niche: detectNiche(transcript) };
    }

    if (status === 'failed') {
      throw new Error('ASR处理失败');
    }

    console.log(`[ASR] Polling ${i + 1}/20`);
  }

  throw new Error('ASR超时');
}
