"use server";

import { redirect } from "next/navigation";
import {
  verifyPassword,
  createSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");

  if (!password || !(await verifyPassword(password))) {
    return { error: "Incorrect password." };
  }

  await createSessionCookie();
  redirect(from.startsWith("/") && !from.startsWith("//") ? from : "/");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
