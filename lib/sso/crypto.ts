import crypto from "node:crypto";

/**
 * SSO 加解密工具 — 实现 IM 开放平台的签名验证和消息解密
 *
 * 签名算法：
 *   msgSignature = sha1(sort(Token, timeStamp, nonce, encrypt))
 *   sort: 将参数按字母字典序排序后拼接
 *
 * 加密方案（AES-256-CBC）：
 *   secretKey: 创建应用时获得的 app_key，长度 32 字节
 *   IV: MD5(secretKey) 的前 16 字节
 *   填充: PKCS5 (等效 PKCS7)
 *   encrypt = Base64(AES-256-CBC-Encrypt(msg))
 */

/**
 * 验证消息签名
 * 将 token、timestamp、nonce、encrypt 按字母序排序后拼接，
 * 计算 SHA1，与 msgSignature 对比
 */
export function verifySignature(
  msgSignature: string,
  token: string,
  timestamp: string,
  nonce: string,
  encrypt: string,
): boolean {
  // 按字母字典序排序后拼接
  const sorted = [token, timestamp, nonce, encrypt].sort().join("");
  const hash = crypto.createHash("sha1").update(sorted, "utf-8").digest("hex");
  return hash === msgSignature;
}

/**
 * 解密 encrypt 密文
 * 1. Base64 解码
 * 2. 使用 AES-256-CBC 解密（IV = MD5(secretKey) 前 16 字节）
 * 3. 返回明文 JSON 字符串
 *
 * @param encryptStr - Base64 编码的密文
 * @param secretKey  - 应用 app_key，32 字节 AES 密钥
 * @returns 解密后的明文字符串（JSON）
 */
export function decrypt(encryptStr: string, secretKey: string): string {
  // AES-256 密钥：32 字节
  const key = Buffer.from(secretKey, "utf-8");

  // IV 初始向量：MD5(secretKey) → 16 字节
  const iv = crypto.createHash("md5").update(secretKey).digest();

  // Base64 解码密文
  const encrypted = Buffer.from(encryptStr, "base64");

  // AES-256-CBC 解密（PKCS5 填充 = PKCS7）
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  decipher.setAutoPadding(true);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
}

// 客户端 IP 白名单（预留，用于安全校验）
// const TRUSTED_IPS: string[] = [
//   // 开放平台服务器 IP
// ];
//
// export function isTrustedIp(ip: string): boolean {
//   return TRUSTED_IPS.includes(ip);
// }
