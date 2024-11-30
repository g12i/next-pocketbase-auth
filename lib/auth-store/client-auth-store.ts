import Cookies from "js-cookie";
import { COOKIE_KEY } from "../constants";
import { CookieOptions } from "../types";
import { defaultCookieOptions } from "./default-cookie-options";
import { SyncAuthStore } from "./sync-auth-store";

export function clientAuthStore(cookieOptions?: CookieOptions) {
  const cookieOptionsWithDefaults = {
    ...defaultCookieOptions,
    ...cookieOptions,
  } satisfies CookieOptions;

  return new SyncAuthStore({
    save: (value, saveCookieOptions) => {
      Cookies.set(COOKIE_KEY, value, {
        ...cookieOptionsWithDefaults,
        ...saveCookieOptions,
      });
    },
    clear: () => {
      Cookies.remove(COOKIE_KEY);
    },
    initial: Cookies.get(COOKIE_KEY),
  });
}
