import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { AsyncAuthStore } from "pocketbase";
import { COOKIE_KEY } from "./constants";

export class ServerCookieAuthStore extends AsyncAuthStore {
  constructor(
    private readonly cookies: Promise<RequestCookies | ReadonlyRequestCookies>
  ) {
    super({
      save: async (serialized) => {
        const c = await this.cookies;
        try {
          c.set(COOKIE_KEY, serialized);
        } catch {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    });
  }
}
