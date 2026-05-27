import type { SsoCheckSignResponse, SsoUserInfo } from "./types";

/**
 * SSO 开放平台 API 客户端
 *
 * 流程：
 *   1. 解密 encrypt 得到 ticket
 *   2. POST /v2/sso/check_sign 验证 ticket 并获取用户信息
 *   3. 返回用户信息用于登录
 */

const SSO_API_HOST = process.env.SSO_API_HOST || "";
const SSO_CHECK_SIGN_PATH = "/v2/sso/check_sign";

/**
 * 调用开放平台单点登录验证接口
 * POST {SSO_API_HOST}/v2/sso/check_sign
 *
 * @param ticket - 解密得到的 ticket（有效期 7200 秒）
 * @param nonce  - SSO 回调中的 nonce 随机字符串
 * @returns 用户信息
 */
export async function checkSign(
  ticket: string,
  nonce: string,
): Promise<SsoUserInfo> {
  if (!SSO_API_HOST) {
    throw new Error("SSO_API_HOST is not configured");
  }

  const url = `${SSO_API_HOST}${SSO_CHECK_SIGN_PATH}`;
  const body = JSON.stringify({ ticket, nonce });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `SSO check_sign failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const data: SsoCheckSignResponse = await response.json();

  if (data.errcode !== "0") {
    throw new Error(
      `SSO check_sign error: [${data.errcode}] ${data.errmsg}`,
    );
  }

  // 提取关键用户信息字段
  return {
    uid: data.uid,
    account: data.account,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    mobile: data.mobile,
  };
}
