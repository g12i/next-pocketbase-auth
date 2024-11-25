export type CookieOptions = Partial<
  Omit<Cookies.CookieAttributes, "sameSite"> & {
    sameSite: "lax" | "strict" | "none";
  }
>;

export type CookiesAdapter = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  delete(name: string): void;
};
