/** SSO callback query parameters from IM Open Platform */
export interface SsoCallbackParams {
  appid: string;
  msgSignature: string;
  timeStamp: string;
  nonce: string;
  encrypt: string;
}

/** Decrypted encrypt payload from IM Open Platform */
export interface SsoEncryptPayload {
  event: string;
  ticket: string;
}

/** Response from /v2/sso/check_sign API */
export interface SsoCheckSignResponse {
  errcode: string;
  errmsg: string;
  uid: string;
  account: string;
  name: string;
  enName: string;
  gender: string;
  email: string;
  avatar: string;
  tel: string;
  mobile: string;
  status: string;
  deptData: unknown[];
  roleId: string;
  staffId: string;
  posData: unknown[];
}

/** Parsed user info extracted from SSO check_sign response */
export interface SsoUserInfo {
  uid: string;
  account: string;
  name: string;
  email: string;
  avatar: string;
  mobile: string;
}
