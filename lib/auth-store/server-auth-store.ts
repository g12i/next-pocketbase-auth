import { COOKIE_KEY } from "../constants";
import { CookieOptions, CookiesAdapter } from "../types";
import { SyncAuthStore } from "./sync-auth-store";

export function serverAuthStore(
  cookies: CookiesAdapter,
  cookieOptions?: CookieOptions
) {
  const cookieOptionsWithDefaults = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    expires: new Date(Date.now() + 1209600), // 14 days
    ...cookieOptions,
  } satisfies CookieOptions;

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
