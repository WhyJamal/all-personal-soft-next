"use server";

import { AuthError, registerRequest } from "@/lib/auth/backend";

export type RegisterResult =
  | { ok: true }
  | { ok: false; code: string; fields?: Partial<Record<"username" | "email" | "password", string>> };

export async function registerAction(input: {
  username: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  try {
    await registerRequest({
      username: input.username.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });
    return { ok: true };
  } catch (e) {
    if (!(e instanceof AuthError)) return { ok: false, code: "REQUEST_FAILED" };
    // DRF field errors: { email: ["..."], username: ["..."] } → first message per field
    const fields: Record<string, string> = {};
    for (const key of ["username", "email", "password"]) {
      const msg = e.fields?.[key];
      if (Array.isArray(msg) && msg[0]) fields[key] = String(msg[0]);
    }
    return { ok: false, code: e.code, fields };
  }
}
