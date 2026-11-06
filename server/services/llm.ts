import { ARK_API_KEY, ARK_BASE_URL, ARK_MODEL } from '../config';

export async function callArkLLM(prompt: string, systemPrompt = '你是出海短视频脚本专家') {
  if (!ARK_API_KEY || !ARK_MODEL) {
    throw new Error('LLM 未配置: 缺少 ARK_API_KEY 或 ARK_MODEL');
  }

  const response = await fetch(`${ARK_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ARK_API_KEY}`,
    },
    body: JSON.stringify({
      model: ARK_MODEL,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: systemPrompt }] },
        { role: 'user', content: [{ type: 'input_text', text: prompt }] },
      ],
    }),
  });

  const data: any = await response.json();

  if (data.error) {
    throw new Error(`LLM API 错误: ${data.error.message || JSON.stringify(data.error)}`);
  }

  if (data.output && Array.isArray(data.output)) {
    const msg = data.output.find((o: any) => o.type === 'message');
    if (msg?.content) {
      const text = msg.content.find((c: any) => c.type === 'output_text');
      if (text?.text) return text.text;
    }
  }

  throw new Error(`LLM 返回格式异常: ${JSON.stringify(data).slice(0, 200)}`);
}
