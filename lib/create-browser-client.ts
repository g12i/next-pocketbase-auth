import PocketBase from "pocketbase";
import { DEFAULT_API_URL } from "./constants";
import { CookieAuthStore } from "./cookie-auth-store";

export function createBrowserClient<T extends PocketBase = PocketBase>(
  baseUrl: string = process.env.NEXT_PUBLIC_PB_URL ?? DEFAULT_API_URL,
  cookieOptions?: Cookies.CookieAttributes
): T {
  const pb = new PocketBase(baseUrl);

  pb.authStore = new CookieAuthStore({
    httpOnly: false, // Must be false to allow client-side access
    secure: process.env.NODE_ENV === "production", // Cookie only sent over HTTPS
    sameSite: "strict", // Protects against CSRF attacks
    path: "/", // Cookie accessible from all paths
    expires: new Date(Date.now() + 1209600), // 14 days
    ...cookieOptions,
  });

  return pb as T;
}
