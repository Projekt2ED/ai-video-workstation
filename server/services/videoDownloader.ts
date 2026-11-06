let playwrightBrowser: any = null;

async function getBrowser() {
  if (!playwrightBrowser) {
    const { chromium } = await import('playwright');
    playwrightBrowser = await chromium.launch({ headless: true });
    console.log('[Downloader] Browser started');
  }
  return playwrightBrowser;
}

function safe<T>(p: Promise<T>): Promise<T | null> {
  return p.catch(() => null);
}

export async function downloadVideo(url: string): Promise<{ buffer: Buffer; fileName: string }> {
  const fileName = `asr-input-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`;
  const isDirectVideo = /\.(mp4|mov|avi|webm)(\?|$)/i.test(url);

  if (isDirectVideo) {
    const buffer = await downloadDirectVideo(url);
    return { buffer, fileName };
  }
  const buffer = await extractFromPage(url);
  return { buffer, fileName };
}

async function downloadDirectVideo(videoUrl: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  let settled = false;
  try {
    let resolvePromise: any, rejectPromise: any;
    const result = new Promise<Buffer>((resolve, reject) => { resolvePromise = resolve; rejectPromise = reject; });

    const done = (buf: Buffer) => { if (!settled) { settled = true; resolvePromise(buf); } };
    const fail = (err: Error) => { if (!settled) { settled = true; rejectPromise(err); } };

    const t = setTimeout(() => fail(new Error('下载超时(60s)')), 60000);

    page.on('response', async (resp: any) => {
      if (settled) return;
      try {
        const ct = resp.headers()['content-type'] || '';
        if (ct.includes('video/')) {
          const body = await resp.body();
          if (body?.length > 1024) {
            clearTimeout(t);
            console.log(`[Downloader] ${(body.length / 1024 / 1024).toFixed(2)} MB captured`);
            done(Buffer.from(body));
          }
        }
      } catch {}
    });

    page.on('download', async (dl: any) => {
      if (settled) return;
      try {
        clearTimeout(t);
        const stream = await dl.createReadStream();
        if (stream) {
          const chunks: Buffer[] = [];
          stream.on('data', (c: Buffer) => chunks.push(c));
          stream.on('end', () => { console.log(`[Downloader] ${(Buffer.concat(chunks).length / 1024 / 1024).toFixed(2)} MB via dl`); done(Buffer.concat(chunks)); });
          stream.on('error', fail);
        } else {
          const p = await dl.path().catch(() => null);
          if (p) { const fs = await import('fs'); done(fs.readFileSync(p)); } else fail(new Error('无法读取'));
        }
      } catch (e: any) { fail(e); }
    });

    await safe(page.goto(videoUrl, { waitUntil: 'load', timeout: 15000 }));
    await safe(page.waitForTimeout(5000));

    if (!settled) {
      clearTimeout(t);
      fail(new Error('未能捕获视频数据'));
    }

    return result;
  } catch (e: any) {
    if (!settled) throw e;
    throw e;
  } finally {
    settled = true;
    await safe(page.close());
  }
}

async function extractFromPage(pageUrl: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  let settled = false;
  try {
    let resolvePromise: any, rejectPromise: any;
    const result = new Promise<Buffer>((resolve, reject) => { resolvePromise = resolve; rejectPromise = reject; });

    const done = (buf: Buffer) => { if (!settled) { settled = true; resolvePromise(buf); } };
    const fail = (err: Error) => { if (!settled) { settled = true; rejectPromise(err); } };

    const t = setTimeout(() => fail(new Error('提取超时(60s)')), 60000);

    page.on('download', async (dl: any) => {
      if (settled) return;
      try {
        clearTimeout(t);
        const stream = await dl.createReadStream();
        if (stream) {
          const chunks: Buffer[] = [];
          stream.on('data', (c: Buffer) => chunks.push(c));
          stream.on('end', () => { console.log(`[Downloader] ${(Buffer.concat(chunks).length / 1024 / 1024).toFixed(2)} MB via dl`); done(Buffer.concat(chunks)); });
          stream.on('error', fail);
        } else fail(new Error('无法读取'));
      } catch (e: any) { fail(e); }
    });

    await safe(page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }));
    await safe(page.waitForTimeout(5000));

    if (!settled) {
      const videoSrc = await safe(page.evaluate(() => {
        const v = document.querySelector('video');
        if (v) {
          if (v.src && v.src.startsWith('http')) return v.src;
          const s = v.querySelector('source[src]');
          if (s) return s.getAttribute('src');
        }
        return null;
      }));

      if (videoSrc) {
        console.log(`[Downloader] Video src found, triggering download`);
        await safe(page.evaluate((src: string) => {
          const a = document.createElement('a'); a.href = src; a.download = 'v.mp4';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }, videoSrc));
      } else {
        const html = (await safe(page.content()) || '') as string;
        const m = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (m) {
          clearTimeout(t);
          try { done(await downloadDirectVideo(m[0])); } catch { fail(new Error('二次下载失败')); }
          return result;
        }
        clearTimeout(t);
        fail(new Error('页面中未找到视频文件'));
        return result;
      }
    }

    return result;
  } catch (e: any) {
    if (!settled) throw e;
    throw e;
  } finally {
    settled = true;
    await safe(page.close());
  }
}

export async function closeBrowser() {
  if (playwrightBrowser) {
    await playwrightBrowser.close().catch(() => {});
    playwrightBrowser = null;
  }
}
