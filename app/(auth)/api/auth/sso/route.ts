import { signIn } from "@/app/(auth)/auth";

// Hardcoded demo user — replace with actual SSO verification later
const DEMO_SSO_EMAIL = "sso-demo";
const DEMO_SSO_NAME = "SSO测试用户";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // SSO params from IM platform — accepted but not validated yet
  // const appid = searchParams.get("appid");
  // const msgSignature = searchParams.get("msgSignature");
  // const timeStamp = searchParams.get("timeStamp");
  // const nonce = searchParams.get("nonce");
  // const encrypt = searchParams.get("encrypt");

  const rawRedirect = searchParams.get("redirectUrl") || "/";
  const redirectUrl =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";

  // TODO: Verify msgSignature, decrypt encrypt, call SSO check_sign API
  // For now, sign in with hardcoded demo user
  // Always call signIn to override any existing guest session
  return signIn("sso", {
    email: DEMO_SSO_EMAIL,
    name: DEMO_SSO_NAME,
    redirect: true,
    redirectTo: redirectUrl,
  });
}
