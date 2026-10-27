// Lightweight integrity protection for the leaderboard stored in localStorage.
//
// IMPORTANT: Since this code runs entirely in the browser, this can NOT provide
// true security - a determined attacker can always read the secret from the
// bundled JS and forge a valid signature. The goal here is to raise the bar
// from "paste a new value into the console" to "reverse engineer the bundle",
// and to make tampering visible in the UI instead of silently trusted.

// Secret is split into parts and combined at runtime so it doesn't appear
// as a single readable string in the source / bundle.
const SECRET_PARTS = ['sybit-', 'kart-', 'lb-', 'v1-', '9f3a-', 'c7e2'];

function getSecret() {
  return SECRET_PARTS.join('');
}

function getSubtle() {
  // WebCrypto is only available in secure contexts (https / localhost).
  // Some environments expose it as `window.crypto` only.
  return globalThis.crypto?.subtle ?? globalThis.window?.crypto?.subtle;
}

// Non-cryptographic fallback (FNV-1a 32-bit).
// This is NOT secure. It only makes casual cheating harder when WebCrypto is unavailable
// (e.g. http on an IP).
function fnv1a32(str) {
  let hash = 0x811c9dc5; // offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // hash *= 16777619 (with 32-bit overflow)
    hash = (hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
  }
  return hash >>> 0;
}

function toHex32(num) {
  return (num >>> 0).toString(16).padStart(8, '0');
}

async function getKey() {
  const subtle = getSubtle();
  if (!subtle) {
    return null;
  }

  const keyData = new TextEncoder().encode(getSecret());
  return subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function buildMessage(entry) {
  const name = (entry.name ?? 'Unbekannt').trim();
  const distance = Number(entry.distance);
  return `${name}|${distance}`;
}

/**
 * Computes an HMAC-SHA256 signature (hex string) for a leaderboard entry
 * based on its name and distance.
 */
export async function computeSignature(entry) {
  const subtle = getSubtle();
  const key = await getKey();

  // If WebCrypto is unavailable, fall back to a lightweight hash.
  // This provides tamper-evidence against casual edits, but can be forged.
  if (!subtle || !key) {
    const msg = buildMessage(entry);
    const salted = `${getSecret()}|${msg}`;
    return `fnv1a32:${toHex32(fnv1a32(salted))}`;
  }

  const message = new TextEncoder().encode(buildMessage(entry));
  const signatureBuffer = await subtle.sign('HMAC', key, message);
  return `hmac256:${toHex(signatureBuffer)}`;
}

/**
 * Mutates / returns a new entry with a freshly computed `sig` field.
 */
export async function signEntry(entry) {
  const sig = await computeSignature(entry);
  return { ...entry, sig };
}

/**
 * Verifies that an entry's `sig` field matches its name/distance.
 * Returns false if the signature is missing, malformed, or doesn't match.
 */
export async function verifyEntry(entry) {
  if (!entry || typeof entry.sig !== 'string' || entry.sig.length === 0) {
    return false;
  }

  const expected = await computeSignature(entry);
  // With the fallback, `expected` is never empty; verify by exact match.
  return expected === entry.sig;
}
