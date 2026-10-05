// EquineTrade: Supabase "Send SMS Hook" -> Fast2SMS (OTP route, no DLT needed).
// Supabase creates the 6-digit login code and calls this function; we ask Fast2SMS to deliver it.
// The login page doesn't change. Test phone numbers in Supabase keep working without SMS.
//
// Secrets needed (Supabase -> Edge Functions -> Secrets):
//   SEND_SMS_HOOK_SECRET  - shown when you turn on the hook (starts with "v1,whsec_")
//   FAST2SMS_API_KEY      - from Fast2SMS -> Dev API
// Never put these keys in the code or in chat.

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

type HookPayload = { user: { phone: string }; sms: { otp: string } };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  // 1. Make sure the call really comes from our Supabase project
  const payload = await req.text();
  const secret = (Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "").replace("v1,whsec_", "");
  let data: HookPayload;
  try {
    data = new Webhook(secret).verify(payload, Object.fromEntries(req.headers)) as HookPayload;
  } catch {
    return json({ error: { http_code: 401, message: "Invalid hook signature" } }, 401);
  }

  // 2. Supabase gives "919876543210"; Fast2SMS wants the 10-digit Indian number
  const digits = (data.user.phone ?? "").replace(/\D/g, "");
  const mobile = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return json({ error: { http_code: 400, message: "Only Indian mobile numbers are supported" } }, 400);
  }

  // 3. Send the code. Fast2SMS delivers it as "Your OTP: 123456"
  const apiKey = Deno.env.get("FAST2SMS_API_KEY") ?? "";
  let result: { return?: boolean; message?: unknown } | null = null;
  try {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: { authorization: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ route: "otp", variables_values: data.sms.otp, numbers: mobile }),
    });
    result = await res.json().catch(() => null);
  } catch (err) {
    console.error("Fast2SMS request failed", err);
  }

  if (!result || result.return !== true) {
    // Shows up in Supabase -> Edge Functions -> sms-hook -> Logs
    console.error("Fast2SMS did not accept the SMS", JSON.stringify(result));
    return json({ error: { http_code: 500, message: "Couldn't send the SMS. Please try again." } }, 500);
  }
  return json({});
});
