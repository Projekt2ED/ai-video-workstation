import crypto from 'crypto';
import { VOD_SPACE_NAME } from '../config';
import { getVodService } from './vodClient';
import { downloadVideo } from './videoDownloader';

export { callASR, detectNiche } from './asr';

export async function uploadToVOD(
  buffer: Buffer,
  fileName: string
): Promise<{ vid: string; playUrl: string }> {
  const vodService = getVodService();

  console.log(`[Pipeline] Uploading to VOD: ${fileName}`);

  const applyResult: any = await vodService.ApplyUploadInfo({
    SpaceName: VOD_SPACE_NAME,
    FileType: 'video',
  });

  const uploadAddress = applyResult?.Result?.Data?.UploadAddress;
  if (!uploadAddress) throw new Error('获取上传凭证失败');

  const storeInfo = uploadAddress.StoreInfos?.[0];
  const uploadHost = uploadAddress.UploadHosts?.[0];
  const sessionKey = uploadAddress.SessionKey;

  if (!storeInfo || !uploadHost || !sessionKey) throw new Error('上传凭证数据不完整');

  const uploadUrl = `https://${uploadHost}/${storeInfo.StoreUri}`;
  const auth = storeInfo.Auth;

  const md5 = crypto.createHash('md5').update(buffer).digest('base64');

  const uploadResp = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/octet-stream',
      'Content-MD5': md5,
    },
    body: buffer,
  });

  if (!uploadResp.ok) {
    const errorText = await uploadResp.text();
    throw new Error(`VOD上传失败: ${uploadResp.status} ${errorText.slice(0, 300)}`);
  }

  console.log(`[Pipeline] File uploaded, committing...`);

  const commitResult: any = await vodService.CommitUploadInfo({
    SpaceName: VOD_SPACE_NAME,
    SessionKey: sessionKey,
    Functions: [],
  });

  const vid = commitResult?.Result?.Result?.Vid;
  if (!vid) throw new Error('获取视频ID失败');

  console.log(`[Pipeline] Committed, Vid: ${vid}`);

  try {
    const playResult: any = await vodService.GetPlayInfo({
      SpaceName: VOD_SPACE_NAME,
      Vid: vid,
    });

    const playInfoList = playResult?.Result?.PlayInfoList;
    if (playInfoList && playInfoList.length > 0) {
      const mainUrl = playInfoList[0]?.MainPlayUrl || '';
      const backupUrl = playInfoList[0]?.BackupPlayUrl || '';
      const playUrl = mainUrl || backupUrl;
      if (playUrl) {
        console.log(`[Pipeline] Play URL obtained`);
        return { vid, playUrl };
      }
    }
  } catch (e) {
    console.log('[Pipeline] GetPlayInfo failed, using direct TOS URL');
  }

  const storeUri = storeInfo.StoreUri;
  const tosPublicUrl = `https://${VOD_SPACE_NAME}.tos-cn-beijing.volces.com/${storeUri}`;
  return { vid, playUrl: tosPublicUrl };
}
