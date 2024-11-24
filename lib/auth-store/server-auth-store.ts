import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { COOKIE_KEY } from "../constants";
import { CookieOptions } from "../cookie-options";
import { SyncAuthStore } from "./sync-auth-store";

type NextCookies = RequestCookies | ReadonlyRequestCookies;

export function serverAuthStore(
  cookies: NextCookies,
  cookieOptions?: CookieOptions
) {
  const cookieOptionsWithDefaults: CookieOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    expires: new Date(Date.now() + 1209600), // 14 days
    ...cookieOptions,
  };

  return new SyncAuthStore({
    save: (value) => {
      ignoreError(() =>
        cookies.set(COOKIE_KEY, value, cookieOptionsWithDefaults)
      );
    },
    clear: () => {
      ignoreError(() => cookies.delete(COOKIE_KEY));
    },
    initial: cookies.get(COOKIE_KEY)?.value,
  });
}

function ignoreError(callback: () => void) {
  try {
    callback();
  } catch {
    // The `set` method was called from a Server Component.
    // This can be ignored if you have middleware refreshing
    // user sessions.
  }
}
