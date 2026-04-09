import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";
const SESSION_PASSWORD = process.env.SESSION_SECRET || "super-secret-at-least-32-characters-long-key-for-dev";

function encodeBase64Url(str: string) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(str: string) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

// Convert string to CryptoKey
async function getSecretKey() {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(SESSION_PASSWORD),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return keyMaterial;
}

export type SessionPayload = {
  userId: string;
  role: string;
  expiresAt: number;
};

// Sign a payload creating a JWT-like string
export async function encrypt(payload: SessionPayload): Promise<string> {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  
  const key = await getSecretKey();
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureBase64 = encodeBase64Url(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${data}.${signatureBase64}`;
}

// Verify a signature and return the payload
export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [header, body, signatureBase64] = parts;
    const data = `${header}.${body}`;
    
    const key = await getSecretKey();
    const encoder = new TextEncoder();
    
    const binaryString = decodeBase64Url(signatureBase64);
    const signature = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        signature[i] = binaryString.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(data));
    if (!isValid) return null;

    return JSON.parse(decodeBase64Url(body)) as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function createSession(userId: string, role: string) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const session = await encrypt({ userId, role, expiresAt });
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) return null;
  
  const session = await decrypt(sessionCookie);
  if (!session || session.expiresAt < Date.now()) {
    return null;
  }
  return session;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
