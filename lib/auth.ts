import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE, signSession, verifySession } from "./session";

function passwordHash(): string {
  const b64 = process.env.APP_PASSWORD_HASH_B64;
  if (!b64) throw new Error("APP_PASSWORD_HASH_B64 is not set");
  return Buffer.from(b64, "base64").toString("utf8");
}

export async function verifyPassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash());
}

export async function createSessionCookie(): Promise<void> {
  const token = await signSession();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return (await verifySession(token)) !== null;
}

export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/login");
}
