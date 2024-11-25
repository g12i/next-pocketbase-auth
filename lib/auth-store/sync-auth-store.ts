import { AuthModel, BaseAuthStore } from "pocketbase";

type DTO = {
  token: string;
  model: AuthModel;
};
type SaveFunction = (serialized: string) => void;
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
        const parsed = parse<DTO>(config.initial);
        this.baseToken = parsed.token;
        this.baseModel = parsed.model ?? null;
      } catch {
        // Could not parse token
      }
    }
  }

  /**
   * @inheritdoc
   */
  save(token: string, model?: AuthModel) {
    this.saveFunc(stringify({ token, model: model ?? null }));

    super.save(token, model);
  }

  /**
   * @inheritdoc
   */
  clear(): void {
    this.clearFunc();

    super.clear();
  }
}

function parse<T>(str: string): T {
  return JSON.parse(atob(str));
}

function stringify(value: DTO): string {
  return btoa(JSON.stringify(value));
}
