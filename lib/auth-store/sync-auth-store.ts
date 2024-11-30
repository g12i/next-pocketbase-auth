import {
  AuthModel,
  AuthRecord,
  BaseAuthStore,
  getTokenPayload,
} from "pocketbase";
import { CookieOptions } from "../types";

type DTO = {
  token: string;
} & (
  | {
      /**
       * @deprecated
       */
      model: AuthModel;
      record?: never;
    }
  | {
      model?: never;
      record: AuthRecord;
    }
);
type SaveFunction = (serialized: string, cookieOptions: CookieOptions) => void;
type ClearFunction = () => void;

export class SyncAuthStore extends BaseAuthStore {
  private saveFunc: SaveFunction;
  private clearFunc: ClearFunction;

  constructor(config: {
    save: SaveFunction;
    clear: ClearFunction;
    initial?: string;
  }) {
    super();

    this.saveFunc = config.save;
    this.clearFunc = config.clear;

    if (config.initial) {
      try {
        const parsed = parse(config.initial);

        this.save(parsed.token, parsed.record ?? parsed.model ?? null);
      } catch {
        // Could not parse token
      }
    }
  }

  /**
   * @inheritdoc
   */
  save(token: string, record?: AuthRecord) {
    super.save(token, record);

    let stringified = "";

    const cookieOptions: CookieOptions = {};

    const payload = getTokenPayload(token);

    if ("exp" in payload && typeof payload.exp === "number") {
      cookieOptions.expires = new Date(payload.exp * 1000);
    }

    try {
      stringified = stringify({ token, record: record ?? null });
    } catch {
      console.warn("SyncAuthStore: failed to stringify the new state");
    }

    this.saveFunc(stringified, cookieOptions);
  }

  /**
   * @inheritdoc
   */
  clear(): void {
    this.clearFunc();

    super.clear();
  }
}

function parse(str: string): DTO {
  const parsed = JSON.parse(atob(str));

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "token" in parsed &&
    typeof parsed.token === "string" &&
    ("record" in parsed || "model" in parsed)
  ) {
    return parsed as DTO;
  }

  throw new Error("Invalid DTO");
}

function stringify(value: DTO): string {
  return btoa(JSON.stringify(value));
}
