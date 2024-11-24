import PocketBase from "pocketbase";
import { clientAuthStore } from "./auth-store/client-auth-store";
import { CookieOptions } from "./cookie-options";
import { DEFAULT_API_URL } from "./constants";

let pbCache: PocketBase | undefined;

export function createBrowserClient<T extends PocketBase = PocketBase>(
  baseUrl: string = process.env.NEXT_PUBLIC_PB_URL ?? DEFAULT_API_URL,
  lang?: string,
  cookieOptions?: CookieOptions
): T {
  if (pbCache) {
    return pbCache as T;
  }

  pbCache = new PocketBase(baseUrl, clientAuthStore(cookieOptions), lang);

  return pbCache as T;
}
