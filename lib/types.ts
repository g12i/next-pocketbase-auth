import type { CookieAttributes } from "js-cookie";

export type CookieOptions = Partial<
  Pick<Required<CookieAttributes>, "expires" | "path" | "domain" | "secure"> & {
    sameSite: "lax" | "strict" | "none";
    httpOnly: boolean;
  }
>;

export type CookiesAdapter = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  delete(name: string): void;
};
