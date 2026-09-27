import test from "node:test";
import assert from "node:assert/strict";

import { hasValidRecaptchaConfig, shouldBypassRecaptcha } from "./recaptcha.js";

test("placeholder recaptcha keys are treated as invalid", () => {
  assert.equal(hasValidRecaptchaConfig(""), false);
  assert.equal(hasValidRecaptchaConfig("YOUR_PRODUCTION_RECAPTCHA_SITE_KEY"), false);
  assert.equal(hasValidRecaptchaConfig("6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"), false);
});

test("real-looking keys are accepted", () => {
  assert.equal(hasValidRecaptchaConfig("6LeX1n4UAAAAAI4lV8d7-2FzJw4b0m8N4x1x3YQ9"), true);
});

test("manual bypass remains opt in", () => {
  assert.equal(shouldBypassRecaptcha(), false);
});
