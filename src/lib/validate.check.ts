// Self-check: `node src/lib/validate.check.ts` (no test framework needed).
import assert from "node:assert";
import { uaePhone, hasContactInfo, resolvePhone } from "./validate.ts";

// --- UAE numbers, every form a creator types them in ---
assert.equal(uaePhone("+971 50 123 4567"), "+971501234567");
assert.equal(uaePhone("00971501234567"), "+971501234567");
assert.equal(uaePhone("0501234567"), "+971501234567");
assert.equal(uaePhone("971 55 987 6543"), "+971559876543");
assert.equal(uaePhone("04 123 4567"), "+97141234567"); // Dubai landline

// --- everything foreign is rejected ---
assert.equal(uaePhone("+1 415 555 0123"), null); // US
assert.equal(uaePhone("+44 7911 123456"), null); // UK
assert.equal(uaePhone("+91 98123 45678"), null); // India
assert.equal(uaePhone("+966 50 123 4567"), null); // Saudi — near-miss on the mobile prefix
assert.equal(uaePhone("+971 50 123 456"), null); // too short
assert.equal(uaePhone(""), null);

// --- contact details hidden in profile copy ---
assert.equal(hasContactInfo("Call me on 050 123 4567"), true);
assert.equal(hasContactInfo("Follow @djmike"), true);
assert.equal(hasContactInfo("mike@gmail.com"), true);
assert.equal(hasContactInfo("https://instagram.com/mike"), true);
assert.equal(hasContactInfo("find me at djmike.ae"), true);
assert.equal(hasContactInfo("DM me on WhatsApp"), true);
assert.equal(hasContactInfo("clean bio", "my insta is there"), true); // any field leaks

// --- honest bios stay allowed ---
assert.equal(hasContactInfo("Wedding singer with 12 years on UAE stages."), false);
assert.equal(hasContactInfo("500 shows since 2015, Dubai based."), false);
assert.equal(hasContactInfo("Sets run 2-3 hours, 45 min each."), false);
assert.equal(hasContactInfo(null, undefined, ""), false);

// --- existing numbers must not lock their owner out of editing ---
const LEGACY = "+919639006719"; // a real live row, saved before the UAE rule
// Unchanged: passes through untouched, so the rest of the profile stays editable.
assert.deepEqual(resolvePhone(LEGACY, LEGACY), { value: LEGACY, invalid: false });
assert.deepEqual(resolvePhone(` ${LEGACY} `, LEGACY), { value: LEGACY, invalid: false });
// Changed to another foreign number: rejected.
assert.equal(resolvePhone("+91 98765 43210", LEGACY).invalid, true);
// Changed to a UAE number: accepted and normalised.
assert.deepEqual(resolvePhone("050 123 4567", LEGACY), { value: "+971501234567", invalid: false });
// Cleared: allowed, stores null.
assert.deepEqual(resolvePhone("", LEGACY), { value: null, invalid: false });
// No stored value (new contact row): no pass, must be UAE.
assert.equal(resolvePhone(LEGACY, null).invalid, true);
assert.deepEqual(resolvePhone("0501234567", null), { value: "+971501234567", invalid: false });

console.log("validate.ts OK");
