import Cookies from "js-cookie";
import { AuthModel, BaseAuthStore } from "pocketbase";
import { COOKIE_KEY } from "./constants";

type StoredData = {
  token: string;
  model?: AuthModel;
};

export class CookieAuthStore extends BaseAuthStore {
  constructor(private readonly cookieOptions?: Cookies.CookieAttributes) {
    super();
  }

  /**
   * @inheritdoc
   */
  get token(): string {
    const data = this.parse(Cookies.get(COOKIE_KEY));

    return data.token;
  }

  /**
   * @inheritdoc
   */
  get model(): AuthModel {
    const data = this.parse(Cookies.get(COOKIE_KEY));

    return data.model || null;
  }

  /**
   * @inheritdoc
   */
  save(token: string, model?: AuthModel) {
    Cookies.set(
      COOKIE_KEY,
      this.stringify({ token, model }),
      this.cookieOptions,
    );

    super.save(token, model);
  }

  /**
   * @inheritdoc
   */
  clear(): void {
    Cookies.remove(COOKIE_KEY);

    super.clear();
  }

  private stringify(value: StoredData): string {
    return JSON.stringify(value);
  }

  private parse(str?: string): StoredData {
    try {
      if (!str) {
        throw new Error("No string to parse");
      }

      return JSON.parse(str);
    } catch {
      return { token: "" };
    }
  }
}
