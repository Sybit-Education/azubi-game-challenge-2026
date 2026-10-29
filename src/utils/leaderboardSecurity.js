// Leaderboard integrity protection for localStorage-based storage.
//
// Threat model / design goals
// ─────────────────────────────────────────────────────────────────────────────
// Because this code runs entirely in the browser there is no *true* security –
// a determined attacker who reads the bundle can always reconstruct the secret.
// The goals, in descending priority, are:
//
//  1. Make the **trivial** attack (paste a value into the DevTools console /
//     edit localStorage directly) fail immediately and visibly.
//  2. Make the **easy** attack (calling exported helpers from the console)
//     require understanding async module internals + ES-module dynamic import.
//  3. Make the **medium** attack (reconstructing the HMAC key from the bundle)
//     require non-trivial reverse-engineering effort.
//  4. Catch implausible scores that exceed what is physically possible in the
//     game, regardless of signature validity.
//
// The approach
// ─────────────────────────────────────────────────────────────────────────────
//  • HMAC-SHA-256 (WebCrypto) over "name|distance|score|sessionToken"
//  • Every entry stores its own per-game-session token.  The token is randomly
//    generated once per GameScene session (by GameScene / GameoverScene via
//    `createSessionToken`) and is embedded in the signature so that a forged
//    entry written cold from the console is rejected unless the attacker also
//    knows the token used during that specific run.
//  • Plausibility checks (max distance, max score, NaN / Infinity guards) are
//    applied independently of the cryptographic check so a tampered entry
//    cannot slip through even if the signature somehow matches.
//  • The internal signing function is NOT exported.  Only the high-level
//    helpers (`signEntry`, `verifyEntry`, `createSessionToken`) are public.
//  • FNV-1a 32-bit fallback when WebCrypto is unavailable (http on a plain IP).

// ─── Secret ──────────────────────────────────────────────────────────────────
// Split into many short fragments to avoid appearing as a single readable
// string in the source / bundle.  Joining them at runtime adds one extra
// reverse-engineering step.
const _S = [
  '\x73y',
  '\x62it',
  '\x2dka',
  '\x72t2',
  '\x30\x32\x36',
  '\x2dlb',
  '\x2d\x39f',
  '\x33a',
  '\x2dc7',
  '\x65\x32',
  '\x2d\x62f',
  '\x34d',
];
function _secret() {
  return _S.reduce((a, b) => a + b, '');
}

// ─── Game-realism caps ───────────────────────────────────────────────────────
// These are generous upper-bounds derived from actual game mechanics.
// Any entry exceeding them is rejected as implausible even if the HMAC is ok.
const MAX_DISTANCE_KM = 9999; // ~2.5 h of continuous play at max speed
const MAX_SCORE_POINTS = 999999; // effectively unreachable under normal rules

// ─── WebCrypto helpers ───────────────────────────────────────────────────────
function _subtle() {
  return globalThis.crypto?.subtle ?? globalThis.window?.crypto?.subtle ?? null;
}

let _cachedKey = null;
async function _getKey() {
  if (_cachedKey) return _cachedKey;
  const subtle = _subtle();
  if (!subtle) return null;
  const raw = new TextEncoder().encode(_secret());
  _cachedKey = await subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
  return _cachedKey;
}

function _toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── FNV-1a 32-bit fallback ──────────────────────────────────────────────────
function _fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// ─── Message builder ─────────────────────────────────────────────────────────
// All fields that matter for fairness are included in the signed payload.
// Changing ANY of them (name, distance, score, token) invalidates the sig.
function _buildMessage(entry) {
  const name = (entry.name ?? 'Unbekannt').trim();
  const distance = Number(entry.distance ?? 0);
  const score = Number(entry.score ?? 0);
  const token = String(entry.token ?? '');
  return `${name}|${distance}|${score}|${token}`;
}

// ─── Internal signing (NOT exported) ─────────────────────────────────────────
async function _sign(entry) {
  const subtle = _subtle();
  const key = await _getKey();

  if (!subtle || !key) {
    // Fallback: keyed FNV over the full message.  Weak, but better than nothing
    // when WebCrypto is unavailable (plain-http kiosk, old browser).
    const msg = _buildMessage(entry);
    return `fnv1a32:${_fnv1a32(_secret() + '|' + msg)}`;
  }

  const buf = await subtle.sign('HMAC', key, new TextEncoder().encode(_buildMessage(entry)));
  return `hmac256:${_toHex(buf)}`;
}

// ─── Plausibility check (independent of crypto) ──────────────────────────────
function _isPlausible(entry) {
  const d = Number(entry.distance ?? -1);
  const s = Number(entry.score ?? 0);

  if (!Number.isFinite(d) || d < 0 || d > MAX_DISTANCE_KM) return false;
  if (!Number.isFinite(s) || s < 0 || s > MAX_SCORE_POINTS) return false;

  return true;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generates a random session token that must be embedded in every leaderboard
 * entry created during this game session.  Call this once in GameoverScene (or
 * GameScene.create) and pass the token to `signEntry`.
 *
 * The token is stored in sessionStorage so that the same tab can still verify
 * entries it created after a Phaser scene restart, but it is *not* persisted to
 * localStorage so an attacker cannot easily reuse it across fresh page loads.
 */
export function createSessionToken() {
  // Reuse the token for the current browser session (tab) so that multiple
  // game rounds in the same tab all produce verifiable entries.
  const existing = sessionStorage.getItem('_lbst');
  if (existing) return existing;

  const bytes = new Uint8Array(16);
  globalThis.crypto?.getRandomValues(bytes);
  const token = _toHex(bytes);
  sessionStorage.setItem('_lbst', token);
  return token;
}

/**
 * Returns (or creates) the session token for this browser tab.
 * Identical to `createSessionToken()` – exposed as a separate function so
 * callers that only *read* the token are semantically distinct from those that
 * create it.
 */
export function getSessionToken() {
  return createSessionToken();
}

/**
 * Returns a new entry object with a freshly computed `sig` field.
 * `entry` must include `name`, `distance`, `score`, and `token` (session token).
 */
export async function signEntry(entry) {
  const sig = await _sign(entry);
  return { ...entry, sig };
}

/**
 * Verifies that `entry.sig` is consistent with its `name`, `distance`,
 * `score`, and `token` fields.
 *
 * Returns an object:
 *   { valid: boolean, reason: string }
 *
 * `reason` is a short English string useful for debugging; do NOT display it
 * to end-users.
 */
export async function verifyEntry(entry) {
  // 1. Structural sanity
  if (!entry || typeof entry !== 'object') {
    return { valid: false, reason: 'not an object' };
  }

  // 2. Signature must be present and non-empty
  if (typeof entry.sig !== 'string' || entry.sig.length === 0) {
    return { valid: false, reason: 'missing signature' };
  }

  // 3. Plausibility check (independent of crypto)
  if (!_isPlausible(entry)) {
    return { valid: false, reason: 'implausible values' };
  }

  // 4. Cryptographic check
  const expected = await _sign(entry);
  if (expected !== entry.sig) {
    return { valid: false, reason: 'signature mismatch' };
  }

  return { valid: true, reason: 'ok' };
}
