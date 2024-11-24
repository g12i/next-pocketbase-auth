import type PocketBase from "pocketbase";
import type { AuthModel } from "pocketbase";
import { useEffect, useState } from "react";
import { createBrowserClient } from "./create-browser-client";
import { Lazy } from "./lazy";

const pb = Lazy.of<PocketBase>(() => createBrowserClient<PocketBase>());

export function usePocketBase<T extends PocketBase = PocketBase>() {
  return pb.value as T;
}

export function useUser<
  T extends NonNullable<AuthModel> = NonNullable<AuthModel>,
>() {
  const pb = usePocketBase();
  const [user, setUser] = useState<T | null>(pb.authStore.model as T);

  useEffect(
    () =>
      pb.authStore.onChange((_, model) => {
        setUser(model as T);
      }),
    [pb.authStore]
  );

  return user;
}
