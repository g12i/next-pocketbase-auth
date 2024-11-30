import { COOKIE_KEY } from "../constants";
import { CookieOptions, CookiesAdapter } from "../types";
import { defaultCookieOptions } from "./default-cookie-options";
import { SyncAuthStore } from "./sync-auth-store";

export function serverAuthStore(
  cookies: CookiesAdapter,
  cookieOptions?: CookieOptions
) {
  const cookieOptionsWithDefaults = {
    ...defaultCookieOptions,
    ...cookieOptions,
  } satisfies CookieOptions;

  return new SyncAuthStore({
    save: (value, saveCookieOptions) => {
      ignoreError(() =>
        cookies.set(COOKIE_KEY, value, {
          ...cookieOptionsWithDefaults,
          ...saveCookieOptions,
        })
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
