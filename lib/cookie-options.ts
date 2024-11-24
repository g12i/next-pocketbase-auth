export type CookieOptions = Partial<
  Omit<Cookies.CookieAttributes, "sameSite"> & {
    sameSite: "lax" | "strict" | "none";
  }
>;
