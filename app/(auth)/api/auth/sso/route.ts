import { signIn } from "@/app/(auth)/auth";
import { checkSign, decrypt, verifySignature } from "@/lib/sso";
import type { SsoEncryptPayload } from "@/lib/sso";

// ============================================================
// SSO 单点登录回调接口 — IM 开放平台
// GET /api/auth/sso?appid=...&msgSignature=...&timeStamp=...&nonce=...&encrypt=...
// ============================================================
//
// 完整 SSO 流程：
//   1. 用户点击应用发起单点登录 → 开放平台回调本接口
//   2. 验证签名: msgSignature == sha1(sort(Token, timeStamp, nonce, encrypt))
//   3. 解密消息: AES-256-CBC 解密 encrypt → 得到 { event, ticket }
//   4. 验证 ticket: POST /v2/sso/check_sign → 获取用户信息
//   5. 查找或创建用户 → signIn("sso", ...)
//
// 需要配置的环境变量：
//   SSO_TOKEN       — IM 开放平台 Token（用于签名验证）
//   SSO_SECRET_KEY  — 应用 app_key，32 字节 AES 密钥（用于解密 & 签名验证）
//   SSO_APP_ID      — 组织自建应用 ID（可选，用于校验 appid）
//   SSO_API_HOST    — 开放平台 API 地址（用于 check_sign 调用）
//
// 未配置 SSO_TOKEN / SSO_SECRET_KEY 时使用 DEMO 模式

// 未配置 SSO 时的 DEMO 用户
const DEMO_SSO_EMAIL = "sso-demo";
const DEMO_SSO_NAME = "SSO测试用户";

function isSsoConfigured(): boolean {
  return Boolean(process.env.SSO_TOKEN && process.env.SSO_SECRET_KEY);
}

/**
 * 从 URL searchParams 提取 SSO 回调参数
 */
function parseSsoParams(searchParams: URLSearchParams): {
  appid: string;
  msgSignature: string;
  timeStamp: string;
  nonce: string;
  encrypt: string;
} | null {
  const appid = searchParams.get("appid");
  const msgSignature = searchParams.get("msgSignature");
  const timeStamp = searchParams.get("timeStamp");
  const nonce = searchParams.get("nonce");
  const encrypt = searchParams.get("encrypt");

  if (!appid || !msgSignature || !timeStamp || !nonce || !encrypt) {
    return null;
  }

  return { appid, msgSignature, timeStamp, nonce, encrypt };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawRedirect = searchParams.get("redirectUrl") || "/";
  const redirectUrl =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";

  // ============================================================
  // DEMO 模式：未配置 SSO 环境变量时，使用硬编码测试用户
  // 配置 SSO_TOKEN + SSO_SECRET_KEY 后自动切换为真实 SSO 流程
  // ============================================================
  if (!isSsoConfigured()) {
    return signIn("sso", {
      email: DEMO_SSO_EMAIL,
      name: DEMO_SSO_NAME,
      redirect: true,
      redirectTo: redirectUrl,
    });
  }

  // ============================================================
  // 真实 SSO 验证流程
  // ============================================================

  // Step 1: 解析回调参数
  // 开放平台回调示例:
  //   /api/auth/sso?appid=APPID&msgSignature=xxx&timeStamp=xxx&nonce=xxx&encrypt=xxx
  const params = parseSsoParams(searchParams);
  if (!params) {
    return new Response(
      "Missing required SSO parameters: appid, msgSignature, timeStamp, nonce, encrypt",
      { status: 400 },
    );
  }

  const { appid, msgSignature, timeStamp, nonce, encrypt } = params;
  const token = process.env.SSO_TOKEN as string;
  const secretKey = process.env.SSO_SECRET_KEY as string;

  // 可选：校验 appid 是否匹配（防止跨应用请求）
  if (process.env.SSO_APP_ID && appid !== process.env.SSO_APP_ID) {
    return new Response("Invalid appid", { status: 403 });
  }

  // Step 2: 验证消息签名
  // msgSignature = sha1(sort(Token, timeStamp, nonce, encrypt))
  // sort: 参数按字母字典序排序 → 从小到大拼接
  if (!verifySignature(msgSignature, token, timeStamp, nonce, encrypt)) {
    return new Response("Invalid signature", { status: 403 });
  }

  // Step 3: 解密 encrypt 密文
  // encrypt = Base64(AES-256-CBC(JSON.stringify({ event, ticket })))
  // 解密后得到: { "event": "sso_sign_in", "ticket": "..." }
  let payload: SsoEncryptPayload;
  try {
    const decrypted = decrypt(encrypt, secretKey);
    payload = JSON.parse(decrypted) as SsoEncryptPayload;

    // 校验事件类型（必须是 sso_sign_in）
    if (!payload.event || payload.event !== "sso_sign_in") {
      return new Response(
        `Unexpected SSO event: ${payload.event || "none"}`,
        { status: 400 },
      );
    }

    if (!payload.ticket) {
      return new Response("Missing ticket in SSO payload", { status: 400 });
    }
  } catch (error) {
    console.error("SSO decrypt failed:", error);
    return new Response("Decrypt failed", { status: 400 });
  }

  // Step 4: 调用开放平台验证 ticket（ticket 有效期为 7200 秒）
  // POST /v2/sso/check_sign  body: { ticket, nonce }
  // 返回: { errcode, errmsg, uid, account, name, email, ... }
  let userInfo;
  try {
    userInfo = await checkSign(payload.ticket, nonce);
  } catch (error) {
    console.error("SSO check_sign failed:", error);
    return new Response("SSO verification failed", { status: 500 });
  }

  // Step 5: 使用 SSO 用户信息登录
  // 构建 email：优先使用接口返回的 email，否则用 account@应用域名
  const ssoEmail =
    userInfo.email || `${userInfo.account}@sso.internal`;

  // 构建显示名称：优先 name，其次 account
  const ssoName = userInfo.name || userInfo.account || "SSO User";

  return signIn("sso", {
    email: ssoEmail,
    name: ssoName,
    redirect: true,
    redirectTo: redirectUrl,
  });
}
