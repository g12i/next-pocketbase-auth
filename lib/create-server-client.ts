import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import PocketBase from "pocketbase";
import { serverAuthStore } from "./auth-store/server-auth-store";
import { DEFAULT_API_URL } from "./constants";
import { CookieOptions } from "./cookie-options";

type NextCookies = RequestCookies | ReadonlyRequestCookies;

export function createServerClient<T extends PocketBase = PocketBase>(
  cookies: NextCookies,
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
