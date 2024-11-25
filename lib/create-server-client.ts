import PocketBase from "pocketbase";
import { serverAuthStore } from "./auth-store/server-auth-store";
import { DEFAULT_API_URL } from "./constants";
import { CookieOptions, CookiesAdapter } from "./types";

export function createServerClient<T extends PocketBase = PocketBase>(
  cookies: CookiesAdapter,
  baseUrl: string = process.env.NEXT_PUBLIC_PB_URL ?? DEFAULT_API_URL,
  lang?: string,
  cookieOptions?: CookieOptions
): T {
  const pb = new PocketBase(
    baseUrl,
    serverAuthStore(cookies, cookieOptions),
    lang
  );

  return pb as T;
}
