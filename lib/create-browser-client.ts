import PocketBase from "pocketbase";
import { DEFAULT_API_URL } from "./constants";
import { CookieAuthStore } from "./cookie-auth-store";

export function createBrowserClient<T extends PocketBase = PocketBase>(
  baseUrl: string = process.env.NEXT_PUBLIC_PB_URL ?? DEFAULT_API_URL,
  cookieOptions?: Cookies.CookieAttributes
): T {
  const pb = new PocketBase(baseUrl);

  pb.authStore = new CookieAuthStore(cookieOptions);

  return pb as T;
}
