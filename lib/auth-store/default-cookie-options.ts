import { CookieOptions } from "../types";

export const defaultCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  expires: new Date(Date.now() + 86400), // will be set to the token expiration date, this is safe default of 24 hours
};
