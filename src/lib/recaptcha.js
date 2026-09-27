export function shouldBypassRecaptcha() {
  const value = String(process.env.RECAPTCHA_DEV_BYPASS ?? "").trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(value);
}

export function hasValidRecaptchaConfig(value) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return false;
  }

  const lowered = normalized.toLowerCase();
  if (lowered.includes("your_") || lowered.includes("replace") || lowered.includes("example")) {
    return false;
  }

  return /^[A-Za-z0-9_-]{20,}$/.test(normalized);
}

export async function verifyRecaptchaToken(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (shouldBypassRecaptcha()) {
    return { success: true, skipped: true };
  }

  if (!hasValidRecaptchaConfig(secretKey)) {
    return { success: true, skipped: true };
  }

  if (!token) {
    throw new Error("Please complete the security check before continuing.");
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    const errorCodes = Array.isArray(result["error-codes"]) ? result["error-codes"] : [];
    throw new Error(errorCodes[0] || "reCAPTCHA verification failed.");
  }

  return { success: true, skipped: false };
}
