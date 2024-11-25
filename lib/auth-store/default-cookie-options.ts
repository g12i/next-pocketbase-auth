import { CookieOptions } from "../types";

export const defaultCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  expires: new Date(Date.now() + 1209600), // 14 days
};
