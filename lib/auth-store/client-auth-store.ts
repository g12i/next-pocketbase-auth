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
    save: (value) => {
      Cookies.set(COOKIE_KEY, value, cookieOptionsWithDefaults);
    },
    clear: () => {
      Cookies.remove(COOKIE_KEY);
    },
    initial: Cookies.get(COOKIE_KEY),
  });
}
