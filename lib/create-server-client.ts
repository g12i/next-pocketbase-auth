import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import PocketBase from "pocketbase";
import { COOKIE_KEY, DEFAULT_API_URL } from "./constants";
import { setPb } from "./pb";

type Cookies = RequestCookies | ReadonlyRequestCookies;

export async function createServerClient<T extends PocketBase = PocketBase>(
  cookies: Cookies,
  baseUrl: string = process.env.NEXT_PUBLIC_PB_URL ?? DEFAULT_API_URL,
  options = { usersCollection: "users" }
): Promise<T> {
  const pb = new PocketBase(baseUrl);

  const cookie = cookies.get(COOKIE_KEY)?.value;

  if (!cookie) {
    setPb(pb);
    return pb as T;
  }

  try {
    pb.authStore.loadFromCookie(`${COOKIE_KEY}=${encodeURIComponent(cookie)}`);
  } catch {
    pb.authStore.clear();
    setCookie(cookies, "");
  }

  try {
    if (pb.authStore.isValid)
      await pb.collection(options.usersCollection).authRefresh();
  } catch {
    pb.authStore.clear();
    setCookie(cookies, "");
  }

  setPb(pb);

  return pb as T;
}

function setCookie(cookies: Cookies, value: string) {
  try {
    cookies.set(COOKIE_KEY, value);
  } catch {
    // The `set` method was called from a Server Component.
    // This can be ignored if you have middleware refreshing
    // user sessions.
  }
}
