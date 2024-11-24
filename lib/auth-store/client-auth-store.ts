import Cookies from "js-cookie";
import { COOKIE_KEY } from "../constants";
import { CookieOptions } from "../cookie-options";
import { SyncAuthStore } from "./sync-auth-store";

export function clientAuthStore(cookieOptions?: CookieOptions) {
  const cookieOptionsWithDefaults: CookieOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    expires: new Date(Date.now() + 1209600), // 14 days
    ...cookieOptions,
  };

  return new SyncAuthStore({
    save: async (value) => {
      Cookies.set(COOKIE_KEY, value, cookieOptionsWithDefaults);
    },
    clear: async () => {
      Cookies.remove(COOKIE_KEY);
    },
    initial: Cookies.get(COOKIE_KEY),
  });
}
