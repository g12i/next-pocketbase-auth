import PocketBase from "pocketbase";
import { createBrowserClient } from "./create-browser-client";

let pb: PocketBase | undefined;

export function getPb() {
  if (pb) {
    return pb;
  }

  pb = createBrowserClient();

  return pb;
}

export function setPb(_pb: PocketBase): void {
  pb = _pb;
}
